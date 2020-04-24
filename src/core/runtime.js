const scoper = 'jlisp_global'

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
}

export function cons (car, cdr) {
  let l = [car, cdr]
  l.type = "list"
  return l
}
export function car (cell) {
  return !cell ? null : cell[0]
}
export function cdr (cell) {
  return !cell ? null : cell[1]
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

