import rl from 'readline-sync'

import { parse } from "./src/core/parser.js"
import { evaluate } from "./src/core/eval.js"
import { print, jsprint } from "./src/core/printer.js"
import { init_runtime } from "./src/core/runtime.js"

init_runtime()

function repl () {
  while (true) {
    let line = rl.question('>>> ')
    let parsed = parse(line)
    let evaluated = evaluate(parsed)
    //jsprint(evaluated)
    print(evaluated)
  }
}

repl()
