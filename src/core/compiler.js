import { jsprint, stringify } from './printer.js'

let LOCAL_NEXT = "next set"

function lambda(args, compile_data) {
  // TODO: asserts for valid forms
  // jsprint(args)
  let v = compile_data.is_top
  compile_data.is_top = false
  compile_data.locals = { "next set": compile_data.locals }
  let local_args = (args[0].value || []).map(e => e.value)
  for (let l of local_args) {
    compile_data.locals[l] = true
  }
  let body_stmts = args.slice(1).map(e => compile(e, compile_data))
  body_stmts[body_stmts.length - 1] = 'return ' + body_stmts[body_stmts.length - 1]
  let c = `(${local_args.join(',')}) => {${body_stmts.join(';')}}`
  compile_data.is_top = v
  compile_data.locals = compile_data.locals[LOCAL_NEXT]
  return c
}
function if_expr(args, compile_data) {
  // TODO: asserts for valid forms
  return `(${compile(args[0], compile_data)}) ? (${compile(args[1], compile_data)}) : (${compile(args[2], compile_data)})`
}
function def(args, compile_data) {
  // TODO: asserts for valid forms
  let name = args[0].value
  if (compile_data.is_top) {
    return `this[${name}] = (${compile(args[1], compile_data)})`
  } else {
    compile_data.locals[name] = true
    return `let ${name} = (${compile(args[1], compile_data)})`
  }
}
function set(args, compile_data) {
  // TODO: asserts for valid forms
  return `${compile(args[0], compile_data)} = (${compile(args[1], compile_data)})`
}
function quote(args, compile_data) {
  return `"${stringify(args[0])}"`
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
  switch (atom.type) {
  case "str": return `"${atom.value}"`
  case "num": return `${atom.value}`
  case "sym": return symbol_scope_resolution(atom.value, compile_data.locals)
  case "bol": return `${atom.value}`
  case "exp": return compile_expr(atom, compile_data)
  }
  throw `unknown type to compile: <${JSON.stringify(atom)}>`
}

function compile_expr(expr, compile_data) {
  let car = expr.value[0]
  let sym = car.value
  let args = expr.value.slice(1)
  let fn = null
  if (car.type === "sym") {
    if (forms[sym]) {
      return forms[sym](args, compile_data)
    } else if (["+", "-", "*", "/", "<", ">", "<=", ">=", "="].includes(sym)) {
      return compile_binop(sym, args, compile_data)
    }
    fn = symbol_scope_resolution(sym, compile_data.locals)
  } else {
    fn = compile(car, compile_data)
  }
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
  if (locals[name]) {
    return name
  } else if (!locals[LOCAL_NEXT]) {
    return `this['${name}']`
  } else {
    return symbol_scope_resolution(name, locals[LOCAL_NEXT])
  }
}
