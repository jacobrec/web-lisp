import { print, jsprint, stringify } from './printer.js'

import {
  atom_type_of,
  atom_is_symbol,
} from './atom.js'

import {
  map,
  car,
  cdr,
  nth,
  array_from_list,
} from './runtime.js'

let LOCAL_NEXT = Symbol("variable_scope")

function lambda(args, compile_data) {
  // TODO: asserts for valid forms
  // jsprint(args)
  let v = compile_data.is_top
  compile_data.is_top = false
  compile_data.locals = { [LOCAL_NEXT]: compile_data.locals }
  let local_args = array_from_list(nth(args, 0))
  for (let l of local_args) {
    compile_data.locals[l] = true
  }
  let body_stmts = array_from_list(map(cdr(args), e => compile(e, compile_data)))
  body_stmts[body_stmts.length - 1] = 'return ' + body_stmts[body_stmts.length - 1]
  let c = `(${array_from_list(local_args.map(symbol_to_string)).join(',')}) => {${body_stmts.join(';')}}`
  compile_data.is_top = v
  compile_data.locals = compile_data.locals[LOCAL_NEXT]
  return c
}
function if_expr(args, compile_data) {
  // TODO: asserts for valid forms
  return `(${compile(nth(args, 0), compile_data)}) ? (${compile(nth(args, 1), compile_data)}) : (${compile(nth(args, 2), compile_data)})`
}
function def(args, compile_data) {
  // TODO: asserts for valid forms
  let name = symbol_to_string(nth(args, 0))
  if (compile_data.is_top) {
    return `this[${name}] = (${compile(nth(args, 1), compile_data)})`
  } else {
    compile_data.locals[nth(args, 0)] = true
    return `let ${name} = (${compile(nth(args, 1), compile_data)})`
  }
}
function set(args, compile_data) {
  // TODO: asserts for valid forms
  return `${compile(nth(args, 0), compile_data)} = (${compile(nth(args, 1), compile_data)})`
}
function quote(args, compile_data) {
  return `"${stringify(nth(args, 0))}"`
}

let forms = {
  if: if_expr,
  def,
  set,
  fn: lambda,
  quote,
}

let compile_data = {}
export function compile_tl(atom) {
  compile_data.is_top = true
  compile_data.locals = {}
  return compile(atom, compile_data)
}

function compile(atom, compile_data) {
  switch (atom_type_of(atom)) {
  case "string": return `"${atom}"`
  case "number": return `${atom}`
  case "symbol": return symbol_scope_resolution(atom, compile_data.locals)
  case "bool":   return `${atom}`
  case "sexp":   return compile_expr(atom, compile_data)
  }
  throw Error(`unknown type to compile: <${JSON.stringify(atom)}>`)
}

function compile_expr(lexpr, compile_data) {
  let expr = array_from_list(lexpr)
  let sym = expr[0]
  let args = expr.slice(1)
  if (atom_is_symbol(sym) && forms[symbol_to_string(sym)]) {
    return forms[symbol_to_string(sym)](cdr(lexpr), compile_data)
  } else if (atom_is_symbol(sym) && ["+", "-", "*", "/", "<", ">", "<=", ">=", "="].includes(symbol_to_string(sym))) {
    return compile_binop(symbol_to_string(sym), args, compile_data)
  }
  let fn = compile(sym, compile_data)
  return `(${fn})(${args.map(e => compile(e, compile_data)).join(',')})`
}

function compile_binop(op, args, compile_data) {
  if (args.length === 2) {
    return `(${compile(args[0], compile_data)}) ${op} ${compile(args[1], compile_data)}`
  }
  let compiled = `this['${op}'](${args.map(e => compile(e, compile_data)).join(',')})`
  return compiled
}

function symbol_scope_resolution(name, locals) {
  // console.log(`Looking up ${name.toString()} in ${JSON.stringify(locals)}`)
  if (locals[name]) {
    return symbol_to_string(name)
  } else if (!locals[LOCAL_NEXT]) {
    return `this['${symbol_to_string(name)}']`
  } else {
    return symbol_scope_resolution(name, locals[LOCAL_NEXT])
  }
}

export function symbol_to_string(sym) {
  // console.log(sym)
  return `${sym.description}`
}
