function lambda(args) {
  // TODO: asserts for valid forms
  return `(${(args[0].value || []).join(',')}) => (${compile(args[1])})`
}
function if_expr(args) {
  // TODO: asserts for valid forms
  return `(${compile(args[0])}) ? (${compile(args[1])}) : (${compile(args[2])})`
}
function def(args) {
  // TODO: asserts for valid forms
  return `let ${compile(args[0])} = (${compile(args[1])})`
}
function set(args) {
  // TODO: asserts for valid forms
  return `${compile(args[0])} = (${compile(args[1])})`
}

let forms = {
  if: if_expr,
  def,
  set,
  fn: lambda,
}

export function compile(atom) {
  switch (atom.type) {
  case "str": return `"${atom.value}"`
  case "num": return `${atom.value}`
  case "sym": return `${atom.value}`
  case "exp": return compile_expr(atom)
  }
  throw `unknown type to compile: <${JSON.stringify(atom)}>`
}

function compile_expr(expr) {
  let name = compile(expr.value[0])
  let args = expr.value.slice(1)
  if (forms[name]) {
    return forms[name](args)
  } else if (["+", "-", "*", "/", "<", ">", "<=", ">=", "="].includes(name)) {
    return compile_binop(name, args)
  }
  let compiled = `(${name}||this['${name}'])(${args.map(compile).join(',')})`
  return compiled
}

function compile_binop(op, args) {
  if (args.length === 2) {
    return `(${compile(args[0])}) ${op} ${compile(args[1])}`
  }
  let compiled = `this['${op}'](${args.map(compile).join(',')})`
  return compiled
}
