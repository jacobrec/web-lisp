var scope = typeof global !== 'undefined' ?
             global :
             typeof self !== 'undefined' ?
               self :
               typeof window !== 'undefined' ?
               window :
               {};

export function init_runtime() {
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
  scope["car"] = function () {
    return arguments[0][0]
  }
  scope["cdr"] = function () {
    return arguments[0][1]
  }
  scope["cons"] = function () {
    return [arguments[0], arguments[1]]
  }
}
