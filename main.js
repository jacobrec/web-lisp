import { parse } from "./src/core/parser.js"
import { evaluate } from "./src/core/eval.js"


evaluate(parse(`
(def test2_fn
  (fn ()
    (def x (fn () 5))
    (def y (x))
    y))`))
// let test2_fn = function () {
//   let x = () => 5
//   let y = x()
//   y
// }
console.log(evaluate(parse(`(test2_fn)`)))
