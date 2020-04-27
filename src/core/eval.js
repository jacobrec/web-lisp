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

  if (is_def(atom)) {
    atom = array_from_list(atom)
    // console.log(`    var: ${symbol_data(atom[1])}    val: ${stringify(atom[2])}`)
    // console.log(`    get_scope()[${symbol_data(atom[1])}] = jeval(${JSON.stringify(compile_tl(atom[2]))})`)

    let val = jeval(compile_tl(atom[2]))
    get_scope()[compile_tl(atom[1])] = val
    // print(atom)
    return val
  } else {
    // console.log(`    eval(${JSON.stringify(compile_tl(atom))})`)
    return jeval(compile_tl(atom))
  }
}

export function jeval(str_code) {
  // console.log(str_code)
  let r = Function(`return (${str_code})`).bind(get_scope())()

  // jsprint(r)
  return r
}
