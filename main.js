import { parse } from "./src/core/parser.js"
import { evaluate } from "./src/core/eval.js"
import { init_runtime } from "./src/core/runtime.js"

// TODO: make REPL
init_runtime()

evaluate(parse(`(def test_fn (fn (n) (fn () (set n (- n 1)) n)))`))
evaluate(parse(`(def t1 (test_fn 5))`))
console.log(evaluate(parse('(+ (t1) (t1))')))
