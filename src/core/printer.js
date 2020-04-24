import util from 'util'

import {
  atom_type_of,
} from './atom.js'

export function print(obj) {
  console.log(stringify(obj))
}

export function stringify(atom) {
  switch (atom_type_of(atom)) {
  case "string": return `"${atom}"`
  case "number": return `${atom}`
  case "symbol": return `${atom.toString().slice(7, -1)}`
  case "bool":   return `${atom}`
  case "sexp":   return `(${(atom||[]).map(stringify).join(' ')})`
  case "nil":    return "nil"
  }
  throw `unknown type to print: <${JSON.stringify(atom)}>`
}

export function jsprint(obj) {
  console.log(util.inspect(obj, false, null, true)) // showHidden: false, depth: null, colors: true
}
