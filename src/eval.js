import { compile_expr } from './compiler.js'

var scope = typeof global !== 'undefined' ?
             global :
             typeof self !== 'undefined' ?
               self :
               typeof window !== 'undefined' ?
               window :
               {};

function lambda(args) {
  // TODO: asserts for valid forms
  let fn_args = args[0].value.map(evaluate).concat([`"use strict"; return ${compile_expr(args[1])}`])
  console.log("COMPILED: ", fn_args)
  return Function.apply(null, fn_args).bind(scope)
}
function if_expr(args) {
  // TODO: asserts for valid forms
  return evaluate(args[0]) ? evaluate(args[1]) : evaluate(args[2])
}
function def(args) {
  // TODO: asserts for valid forms
  return scope[evaluate(args[0])] = evaluate(args[1])
}
function set(args) {
  // TODO: asserts for valid forms
  return scope[evaluate(args[0])] = evaluate(args[1])
}
function do_expr(args) {
  // TODO: asserts for valid forms
  let res = null;
  for (let a in args) {
    res = evaluate(a)
  }
  return res
}

let forms = {
  if: if_expr,
  fn: lambda,
  def,
  set,
  do: do_expr,
}

export function evaluate(atom) {
  switch (atom.type) {
  case "str": return atom.value
  case "num": return atom.value
  case "sym": return scope[atom.value] || atom.value
  case "exp":
    let name = evaluate(atom.value[0])
    let args = atom.value.slice(1)
    return funcall(name, args)
  }
  throw "unknown type to eval"
}

function funcall(name, args) {
  if (forms[name]) {
    return forms[name](args)
  }
  let fn = (typeof name === "function") ? name : scope[name]
  if (!fn) {
    error(`function "${name}" not in scope`)
  }
  let eval_args = args.map(evaluate)
  return fn.apply(null, eval_args)
}

scope["-"] = function () {
  let val = Array.from(arguments).reduce((a,b) => a-b)
  return val
}
scope["+"] = function () {
  return Array.from(arguments).reduce((a,b) => a+b, 0)
}
scope["*"] = function () {
  return Array.from(arguments).reduce((a,b) => a*b, 1)
}
scope["<"] = function () {
  return Array.from(arguments).slice(1).reduce((a,b) => ({last: b, is_good: a.is_good && a.last < b}), {last: arguments[0], is_good: true}).is_good
}


function error(msg) {
    throw `Error: ${msg}`
}

