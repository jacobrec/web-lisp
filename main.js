import { parse } from "./src/parser.js"
import { evaluate } from "./src/eval.js"

parse("4")
parse("4.3")
parse('"Hello"')
parse("(1 2 3)")
parse("(1 (2.0 2.1 2.2) 3)")
parse("(+ 1 2 3)")
// console.log(evaluate(parse("(+ 1 2 3)")))
// console.log(evaluate(parse("(* 4 5)")))
// console.log(evaluate(parse("(< 1 2)")))
// console.log(evaluate(parse("(< 1 2 3)")))
// console.log(evaluate(parse("(< 3 2 3)")))
// console.log(evaluate(parse('(if (< 2 1) "t" "f")')))
// console.log("res: ", evaluate(parse('((fn (a b) (+ a b)) 1 2)')))
// console.log("res: ", evaluate(parse('(def y 3)')))
// console.log("res: ", evaluate(parse('(def add2 (fn (a b) (+ a b)))')))
// console.log("res: ", evaluate(parse('(add2 y 5)')))

// console.log("res: ", evaluate(parse('(def test (fn (a b) (if (< a b) b a)))')))
// console.log("res: ", evaluate(parse('(test 10 30)')))
// console.log("res: ", evaluate(parse('(test 43 30)')))

evaluate(parse(`(def fib (fn (n)
                  (if (< n 2)
                      n
                      (+ (fib (- n 1))
                         (fib (- n 2))))))`))

console.log(evaluate(parse(`(fib 10)`)))
console.log(evaluate(parse(`(fib 30)`)))

evaluate(parse(`(def test_fn (fn (n) (fn () (set n (- n 1)) n)))`))
evaluate(parse(`(def t1 (test_fn 5))`))
console.log(evaluate(parse(`(+ (t1) (t1))`))) // 4 + 3

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
