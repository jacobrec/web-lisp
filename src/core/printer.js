import util from 'util'

import {
  array_from_list,
  list_from_array,
  map,
  car,
  cons,
  cdr,
  is_list,
} from './runtime.js'

import {
  atom_type_of,
  atom_is_nil,
} from './atom.js'

export function print(obj) {
  console.log(stringify(obj))
}

export function stringify(atom) {
  // console.log("STRINGIFY"); jsprint(atom)
  switch (atom_type_of(atom)) {
  case "string": return `"${atom}"`
  case "number": return `${atom}`
  case "symbol": return `${atom.description}`
  case "bool":   return `${atom}`
  case "list":   return stringify_cons(atom)
  case "array":  return `[${atom.map(stringify).join(' ')}]`
  case "nil":    return "nil"
  }
  throw `unknown type to print: <${JSON.stringify(atom)}>`
}

function stringify_cons(atom) {
  let scar = stringify(car(atom))
  let scdr = stringify(cdr(atom))
  if (is_list(cdr(atom))) {
    if (atom_is_nil(cdr(atom))) {
    return `(${scar})`
    }
    return `(${scar} ${scdr.slice(1, -1)})`
  } else {
    let scdr = stringify(cdr(atom))
    return `(${scar} . ${scdr})`
  }
}

export function jsprint(obj) {
  console.log(util.inspect(obj, false, null, true)) // showHidden: false, depth: null, colors: true
}
