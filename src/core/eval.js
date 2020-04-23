import { compile } from './compiler.js'
import { stringify } from './printer.js'

var scope = typeof global !== 'undefined' ?
             global :
             typeof self !== 'undefined' ?
               self :
               typeof window !== 'undefined' ?
               window :
               {};

function lambda(args) {
  // TODO: asserts for valid forms
  let body_stmts = args.slice(1).map(compile)
  body_stmts[body_stmts.length - 1] = 'return ' + body_stmts[body_stmts.length - 1]
  let fn_args = (args[0].value || []).map(evaluate).concat([`"use strict"; ${body_stmts.join(';')}`])
  // console.log(`compiled function to ${body_stmts}`)
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
function quote(args) {
  return `${stringify(args[0])}`
}

let forms = {
  if: if_expr,
  fn: lambda,
  def,
  set,
  quote,
}

export function evaluate(atom) {
  switch (atom.type) {
  case "str": return atom.value
  case "num": return atom.value
  case "bol": return atom.value
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


function error(msg) {
    throw `Error: ${msg}`
}

