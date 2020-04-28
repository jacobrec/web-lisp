import { compile_tl } from './compiler.js'
import { jsprint, print, stringify } from './printer.js'
import { get_scope, array_from_list, car } from './runtime.js'

import {
  atom_is_sexp,
  atom_is_symbol,
  symbol_data,
} from './atom.js'

let is_def = (atom) => atom_is_sexp(atom) && atom_is_symbol(car(atom)) && symbol_data(car(atom)) === "def"

export function evaluate(atom) {
  // jsprint(get_scope())
  // jsprint(atom)
  // print(atom)
  return jeval(compile_tl(atom), is_def(atom))
}

export function jeval(str_code, isdef) {
  let fn_body = isdef ? `${str_code}` : `return (${str_code})`
  //console.log(fn_body)
  let r = Function(fn_body).bind(get_scope())()
  //jsprint(r)
  return r
}
