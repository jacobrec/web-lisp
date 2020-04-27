import { print, jsprint, stringify } from './printer.js'

import {
  atom_type_of,
  atom_is_symbol,
  symbol_data,
} from './atom.js'

import {
  map,
  cons,
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
  let local_args = array_from_list(car(args))
  for (let l of local_args) {
    compile_data.locals[symbol_data(l)] = true
  }
  let body_stmts = array_from_list(map(cdr(args), e => compile(e, compile_data)))
  body_stmts[body_stmts.length - 1] = 'return ' + body_stmts[body_stmts.length - 1]
  let c = `(${local_args.map(compile).join(',')}) => {${body_stmts.join(';')}}`
  compile_data.is_top = v
  compile_data.locals = compile_data.locals[LOCAL_NEXT]
  return c
}
function if_expr(args, compile_data) {
  // TODO: asserts for valid forms
  return `(${compile(car(args), compile_data)}) ? (${compile(nth(args, 1), compile_data)}) : (${compile(nth(args, 2), compile_data)})`
}

function def(args, compile_data) {
  // TODO: asserts for valid forms
  let name = compile(car(args))
  if (compile_data.is_top) {
    return `this[${name}] = (${compile(nth(args, 1), compile_data)})`
  } else {
    compile_data.locals[symbol_data(car(args))] = true
    return `let ${name} = (${compile(nth(args, 1), compile_data)})`
  }
}
function set(args, compile_data) {
  // TODO: asserts for valid forms
  let loc = compile(car(args), compile_data)
  if (atom_type_of(loc) === "symbol") {
    loc = symbol_scope_resolution(loc)
  }
  return `${loc} = (${compile(nth(args, 1), compile_data)})`
}

function quote(args, compile_data) {
  let item = car(args)
  return `this['parse']('${stringify(item)}')`
}
function quaziquote(args, compile_data) {
  let oitem = car(args)
  let quazi_inner = (item) => {
    if (atom_type_of(item) == "list") {
      if (atom_type_of(car(item)) == "symbol" && symbol_data(car(item)) == "unquote") {
        return "${this['evaluate'](" + quaziquote(cdr(item), compile_data)+ ")}"
      } else {
        let qargs = map(item, quazi_inner)
        return `(${array_from_list(qargs).join(' ')})`
      }
    } else if (atom_type_of(item) == "array") {
      throw 'Quaziquote not implemented for arrays yet'
      return 'TODO'
    } else if (atom_type_of(item) == "symbol") {
      let x = symbol_data(item)
      return in_global_scope(item, compile_data) && !builtins.includes(symbol_data(item))? `this.${x}` : symbol_data(item)
    } else {
      return stringify(item)
    }
  }
  let res = `this['parse'](\`${quazi_inner(oitem)}\`)`
  // console.log("quaziJS=", res)
  // (quaziquote (1 2 3)) => this['parse']('(1 2 3)')
  // (quaziquote (1 2 x)) => this['parse']('(1 2 x)')
  // (quaziquote (1 2 (unquote x))) => this['parse']('(1 2 ${this['evaluate'](this['parse']('x')})')
  // (quaziquote (1 2 (unquote (+ 1 2)))) => this['parse']('(1 2 ${this['evaluate'](this['parse']('(+ 1 2)')})')
  return res
}

let forms = {
  if: if_expr,
  def,
  set,
  fn: lambda,
  quote,
  quaziquote, // also unquote
}

let builtins = ["+", "-", "*", "/", "<", ">", "<=", ">=", "="]

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
  case "symbol": return `${symbol_data(atom)}`// symbol_scope_resolution(atom, compile_data.locals)
  case "bool":   return `${atom}`
  case "list":   return compile_expr(atom, compile_data)
  case "array":  return compile_array(atom, compile_data)
  }
  throw Error(`unknown type to compile: <${JSON.stringify(atom)}>`)
}

function compile_array(atom, compile_data) {
  let expr = atom.map(e => scope_symbol(e, compile_data))
  return `[${expr.join(',')}]`
}

function compile_expr(lexpr, compile_data) {
  let expr = array_from_list(lexpr)
  let sym = expr[0]
  let args = expr.slice(1)
  if (atom_is_symbol(sym) && forms[compile(sym)]) {
    return forms[compile(sym)](cdr(lexpr), compile_data)
  } else if (atom_is_symbol(sym) && builtins.includes(compile(sym))) {
    return compile_binop(compile(sym), args, compile_data)
  }
  let fn = scope_symbol(sym, compile_data)
  return `(${fn})(${args.map(e => scope_symbol(e, compile_data)).join(',')})`
}

function compile_binop(op, args, compile_data) {
  if (args.length === 2) {
    return `(${compile(args[0], compile_data)}) ${op} ${compile(args[1], compile_data)}`
  }
  let compiled = `this['${op}'](${args.map(e => compile(e, compile_data)).join(',')})`
  return compiled
}

function scope_symbol(atom, compile_data){
  if (atom_type_of(atom) === "symbol") {
    return symbol_scope_resolution(atom, compile_data.locals)
  }
  return compile(atom, compile_data)
}

function in_global_scope(name, locals) {
  if (locals[symbol_data(name)]) {
    return false
  } else if (!locals[LOCAL_NEXT]) {
    return true
  } else {
    return in_global_scope(name, locals[LOCAL_NEXT])
  }
}

function symbol_scope_resolution(name, locals) {
  // console.log(`Looking up ${JSON.stringify(name)} in ${JSON.stringify(locals)}`)
  if (in_global_scope(name, locals)) {
    return `this['${compile(name)}']`
  } else {
    return compile(name)
  }
}
