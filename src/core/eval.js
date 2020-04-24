import { compile_tl, symbol_to_string } from './compiler.js'
import { jsprint, print } from './printer.js'
import { get_scope } from './runtime.js'

import {
  atom_is_sexp,
  atom_is_symbol,
} from './atom.js'

let is_def = (atom) => atom_is_sexp(atom) && atom_is_symbol(atom[0]) && atom[0] === Symbol.for("def")

export function evaluate(atom) {
  // jsprint(get_scope())
  print(atom)
  if (is_def(atom)) {
    console.log(`    get_scope()[${symbol_to_string(atom[1])}] = jeval(${JSON.stringify(compile_tl(atom[2]))})`)

    let val = jeval(compile_tl(atom[2]))
    get_scope()[symbol_to_string(atom[1])] = val
    // print(atom)
    return val
  } else {
    console.log(`    eval(${JSON.stringify(compile_tl(atom))})`)
    return jeval(compile_tl(atom))
  }
}

function jeval(str_code) {
  // console.log(str_code)
  let r = Function(`return (${str_code})`).bind(get_scope())()

  // jsprint(r)
  return r
}
