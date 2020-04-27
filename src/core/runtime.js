const scoper = 'jlisp_global'

import { stringify } from'./printer.js'
import { evaluate } from'./eval.js'
import { parse } from'./parser.js'
import { atom_type_of } from'./atom.js'
import { init_compiler } from'./compiler.js'

export function get_global() {
  return typeof global !== 'undefined' ?
    global :
    typeof self !== 'undefined' ?
    self :
    typeof window !== 'undefined' ?
    window :
    {}
}
export function get_scope() {
  return get_global()[scoper]
}

export function init_runtime() {
  get_global()[scoper] = {}
  let scope = get_scope()
  init_compiler(scope)

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
  // cons cell looks like [car, cons]
  scope["car"] = car
  scope["cdr"] = cdr
  scope["cons"] = cons

  scope["parse"] = parse
  scope["evaluate"] = evaluate

  scope["type"] = atom_type_of

  scope["stringify"] = stringify
}

function cons_cell(car, cdr) {
  this.car = car
  this.cdr = cdr
  this.type = "list"
}
export function cons (car, cdr) {
  return new cons_cell(car, cdr)
}
export function car (cell) {
  return !cell ? null : cell.car
}
export function cdr (cell) {
  return !cell ? null : cell.cdr
}
export function is_list (cell) {
  return cell && cell.hasOwnProperty('car') && cell.hasOwnProperty('cdr')
}

export function nth (cell, n) {
  return !cell ? null : (n == 0 ? car(cell) : nth(cdr(cell), n-1))
}
export function map (cell, f) {
  return !cell ? null : cons(f(car(cell)), map(cdr(cell), f))
}

export function list_from_array(array) {
  return array.concat([null]).reduceRight((a, b) => cons(b, a))
}
export function array_from_list(list) {
  let a = []
  map(list, e => a.push(e))
  return a
}
