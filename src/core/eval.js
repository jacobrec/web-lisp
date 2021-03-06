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
  // console.log("Starting eval", stringify(atom), this)
  let scope = this || get_scope()
  return jeval(compile_tl(atom, scope), is_def(atom), scope)
}

export function jeval(str_code, isdef, scope) {
  let fn_body = isdef ? `${str_code}` : `return (${str_code})`
  // console.log("Compiles to:", fn_body)
  // console.log("Called with scope", scope || get_scope())
  let r = Function(fn_body).bind(scope || get_scope())()
  //jsprint(r)
  return r
}
