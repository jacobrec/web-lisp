import { compile_tl } from './compiler.js'
import { jsprint, print } from './printer.js'
import { get_scope } from './runtime.js'

let is_def = (atom) => atom.type === "exp" && atom.value[0].value === "def" && atom.value[0].type === "sym"

export function evaluate(atom) {
  // jsprint(get_scope())
  // print(atom)
  if (is_def(atom)) {
    // console.log(`    get_scope()['${atom.value[1].value}'] = jeval("${compile_tl(atom.value[2])}")`)

    let val = jeval(compile_tl(atom.value[2]))
    get_scope()[atom.value[1].value] = val
    // print(atom)
    return val
  } else {
    // console.log(`    eval("${compile_tl(atom)}")`)
    return jeval(compile_tl(atom))
  }
}

function jeval(str_code) {
  // console.log(str_code)
  let r = Function(`return (${str_code})`).bind(get_scope())()

  // jsprint(r)
  return r
}
