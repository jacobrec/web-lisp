function lambda(args) {
  // TODO: asserts for valid forms
  let fn_args = args[0].value.map(evaluate).concat([`"use strict"; return ${compile_expr(args[1])}`])
  return Function.apply(null, fn_args)
}
function if_expr(args) {
  // TODO: asserts for valid forms
  return `(${compile(args[0])}) ? (${compile(args[1])}) : (${compile(args[2])})`
}
function def(args) {
  // TODO: asserts for valid forms
  return `let ${compile(args[0])} = (${compile(args[1])})`
}


let forms = {
  if: if_expr,
  def: def,
  fn: lambda
}

export function compile(atom) {
  switch (atom.type) {
  case "str": return `"${atom.value}"`
  case "num": return `${atom.value}`
  case "sym": return `${atom.value}`
  case "exp": return compile_expr(atom)
  }
  throw `unknown type to compile: [${JSON.stringify(atom)}]`
}

export function compile_expr(expr) {
  let name = compile(expr.value[0])
  let args = expr.value.slice(1)
  if (forms[name]) {
    return forms[name](args)
  } else if (["+", "-", "*", "/", "<", ">", "<=", ">=", "="].includes(name)) {
    return compile_binop(name, args)
  }
  let compiled = `this['${name}'](${args.map(compile).join(',')})`
  return compiled
}

function compile_binop(op, args) {
  if (args.length === 2) {
    return `(${compile(args[0])}) ${op} ${compile(args[1])}`
  }
  let compiled = `this['${op}'](${args.map(compile).join(',')})`
  return compiled
}
