import { parse } from "./parser.js"
import { evaluate } from "./eval.js"

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
console.log(evaluate(parse('((lambda (a b) (+ a b)) 1 2)')))
console.log(evaluate(parse('(def y 3)')))
console.log(evaluate(parse('(def add2 (lambda (a b) (+ a b)))')))
console.log(evaluate(parse('(add2 y 5)')))
