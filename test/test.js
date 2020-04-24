import assert from 'assert'
import { parse_apply, parse_int, parse_digit, parse_spaces, parse_float, parse_or_lit, parse_lit, parse_lit_iw, parse_or,
         parse_between_lit, parse_and, parse_many, parse_some, parse_optional, parse_string_lit, parse_string_lit_iw } from '../src/parser_combinator.js'

import { init_runtime } from "../src/core/runtime.js"
init_runtime()


function check(a, b) {
  return assert.deepStrictEqual(a, b)
}

describe('parse', function() {
  let parse_a = parse_lit("a")
  let parse_b = parse_lit("b")
  let parse_a_iw = parse_lit_iw("a")
  let parse_b_iw = parse_lit_iw("b")
  let parse_a_or_b = parse_or(parse_a, parse_b)
  let parse_a_and_b = parse_and(parse_a, parse_b)
  let parse_a_and_b_iw = parse_and(parse_a_iw, parse_b_iw)
  let parse_str = parse_string_lit('"')
  let parse_str_iw = parse_string_lit_iw('"')
  let parse_many_a = parse_many(parse_a)
  let parse_some_a = parse_some(parse_a)
  let parse_if_a = parse_optional(parse_a)
  let parse_add = parse_apply(function (res) { return res[0] + res[3]}, parse_and(parse_int, parse_lit_iw("+"), parse_spaces, parse_int))
  let parse_between_bracks = parse_between_lit("(", parse_add, ")")

  describe('_lit()', function() {
    it('has a', function() { check(parse_a("apple"), {error: false, rest: "pple", result: "a"}) })
    it('not has a', function() { check(parse_a("banana"), {error: true, rest: "banana", result: null}) })
  })
  describe('_or()', function() {
    it('has a', function() { check(parse_a_or_b("apple"), {error: false, rest: "pple", result: "a"}) })
    it('has b', function() { check(parse_a_or_b("banana"), {error: false, rest: "anana", result: "b"}) })
    it('has neither', function() { check(parse_a_or_b("orange"), {error: true, rest: "orange", result: null}) })
    it('has neither lit', function() { check(parse_or_lit("a", "b")("orange"), {error: true, rest: "orange", result: null}) })
    it('has b lit', function() { check(parse_or_lit("a", "b")("banana"), {error: false, rest: "anana", result: "b"}) })
  })
  describe('_and()', function() {
    it('has ab', function() { check(parse_a_and_b("abbot"), {error: false, rest: "bot", result: ["a", "b"]}) })
    it('has ac', function() { check(parse_a_and_b("acorn"), {error: true, rest: "acorn", result: null}) })
    it('has ba', function() { check(parse_a_and_b("banana"), {error: true, rest: "banana", result: null}) })
    it('has neither', function() { check(parse_a_and_b("orange"), {error: true, rest: "orange", result: null}) })
  })
  describe('_iw()', function() {
    it('has ab', function() { check(parse_a_and_b_iw("a b b o t"), {error: false, rest: " b o t", result: ["a", "b"]}) })
    it('has ba', function() { check(parse_a_and_b_iw("b a n a n a"), {error: true, rest: "b a n a n a", result: null}) })
    it('has neither', function() { check(parse_a_and_b_iw(" o r a n g e"), {error: true, rest: " o r a n g e", result: null}) })
    it('with str', function() { check(parse_str_iw('   "orange" '), {error: false, rest: " ", result: "orange"}) })
  })
  describe('_string_lit()', function() {
    it('has string', function() { check(parse_str('hello "world"'), {error: true, rest: 'hello "world"', result: null}) })
    it('starts with string', function() { check(parse_str('"hello" world'), {error: false, rest: " world", result: "hello"}) })
    it('starts with empty string', function() { check(parse_str('"" world'), {error: false, rest: " world", result: ""}) })
    it('has no string', function() { check(parse_str("orange"), {error: true, rest: "orange", result: null}) })
    it('non terminating', function() { check(parse_str('"uhh'), {error: true, rest: '"uhh', result: null}) })
    it('escaped', function() { check(parse_str('"hello\\\" world"'), {error: false, rest: "", result: 'hello\" world'}) })
    it('escaped first', function() { check(parse_str('"\\\" world"'), {error: false, rest: "", result: '\" world'}) })
    it('escaped escape', function() { check(parse_str('"hello\\\\" world'), {error: false, rest: " world", result: 'hello\\'}) })
  })
  describe('_some()', function() {
    it('has aadvark', function() { check(parse_some_a("aadvark"), {error: false, rest: "dvark", result: ["a", "a"]}) })
    it('has apple', function() { check(parse_some_a("apple"), {error: false, rest: "pple", result: ["a"]}) })
    it('has banana', function() { check(parse_some_a("banana"), {error: true, rest: "banana", result: null}) })
  })
  describe('_optional()', function() {
    it('has apple', function() { check(parse_if_a("apple"), {error: false, rest: "pple", result: "a"}) })
    it('has banana', function() { check(parse_if_a("banana"), {error: false, rest: "banana", result: null}) })
  })
  describe('_many()', function() {
    it('has aadvark', function() { check(parse_many_a("aadvark"), {error: false, rest: "dvark", result: ["a", "a"]}) })
    it('has apple', function() { check(parse_many_a("apple"), {error: false, rest: "pple", result: ["a"]}) })
    it('has banana', function() { check(parse_many_a("banana"), {error: false, rest: "banana", result: null}) })
  })
  describe('_apply()', function() {
    it('has digit', function() { check(parse_digit("1 + 3"), {error: false, rest: " + 3", result: 1}) })
    it('has num 10', function() { check(parse_int("10 + 3"), {error: false, rest: " + 3", result: 10}) })
    it('has num 1', function() { check(parse_int("1 + 3"), {error: false, rest: " + 3", result: 1}) })
    it('has addition', function() { check(parse_add("1 + 3"), {error: false, rest: "", result: 4}) })
    it('has incomplete addition', function() { check(parse_add("1 +"), {error: true, rest: "1 +", result: null}) })
    it('has no addition', function() { check(parse_add("a"), {error: true, rest: "a", result: null}) })
    it('has float', function() { check(parse_float("1.2"), {error: false, rest: "", result: 1.2}) })
    it('has float no lead', function() { check(parse_float(".2"), {error: false, rest: "", result: 0.2}) })
    it('has no float', function() { check(parse_float("a"), {error: true, rest: "a", result: null}) })
  })
  describe('_between()', function() {
    it('succeeds', function() { check(parse_between_bracks("(1 + 3)"), {error: false, rest: "", result: 4}) })
    it('fail_start', function() { check(parse_between_bracks("1 + 3)"), {error: true, rest: "1 + 3)", result: null}) })
    it('fail_end', function() { check(parse_between_bracks("(1 + 3"), {error: true, rest: "(1 + 3", result: null}) })
  })
})


import { car, cons, cdr } from '../src/core/runtime.js'
import { array_from_list, list_from_array } from '../src/core/runtime.js'
describe('js-runtime', function() {
  it('lists1', function() { check(car(cons(1, 2)), 1) })
  it('lists2', function() { check(cdr(cons(1, 2)), 2) })
  it('lists3', function() { check(car(cons(1, cons(2, cons(3, null)))), 1) })
  it('lists4', function() { check(car(cdr(cons(1, cons(2, cons(3, null))))), 2) })
  it('lists5', function() { check(car(cdr(cdr(cons(1, cons(2, cons(3, null)))))), 3) })
  it('lists6', function() { check(car(cdr(cdr(cdr(cons(1, cons(2, cons(3, null))))))), null) })

  it('lists7', function() { check(array_from_list(cons(1, cons(2, cons(3, null)))), [1, 2, 3]) })
  it('lists8', function() { check(list_from_array([1, 2, 3]), cons(1, cons(2, cons(3, null)))) })
  it('lists9', function() { check(list_from_array([]), null) })
  it('lists10', function() { check(array_from_list(null), []) })

})

/*


import { evaluate } from '../src/core/eval.js'
import { compile_tl } from '../src/core/compiler.js'
import { parse } from '../src/core/parser.js'
let compile = compile_tl

describe('end-to-end', function() {
  it('addition', function() { check(evaluate(parse("(+ 1 2 3)")), 6) })
  it('multiplication', function() { check(evaluate(parse("(* 4 5)")), 20) })
  it('equality binary', function() { check(evaluate(parse("(< 1 2)")), true) })
  it('equality non binary', function() { check(evaluate(parse("(< 1 2 3)")), true) })
  it('equality false', function() { check(evaluate(parse("(< 3 2 3)")), false) })
  it('if', function() { check(evaluate(parse('(if (< 2 1) "t" "f")')), "f") })
  it('true literal', function() { check(evaluate(parse('(if true "t" "f")')), "t") })
  it('false literal', function() { check(evaluate(parse('(if false "t" "f")')), "f") })

  it('lambda function', function() { check(evaluate(parse('((fn (a b) (+ a b)) 1 2)')), 3) })
  it('define var', function() { check(evaluate(parse('(def y 3)')), 3) })
  evaluate(parse('(def add2 (fn (a b) (+ a b)))'))
  it('named function 1', function() { check(evaluate(parse('(add2 y 5)')), 8) })
  evaluate(parse('(def test (fn (a b) (if (< a b) b a)))'))
  it('named function 2', function() { check(evaluate(parse('(test 10 30)')), 30) })
  it('named function 3', function() { check(evaluate(parse('(test 43 30)')), 43) })

  evaluate(parse(`(def fib (fn (n)
                      (if (< n 2)
                          n
                          (+ (fib (- n 1))
                             (fib (- n 2))))))`))

  it('fibinicci 10', function() { check(evaluate(parse('(fib 10)')), 55) })
  it('fibinicci 30', function() { check(evaluate(parse('(fib 30)')), 832040) })

  evaluate(parse(`(def test_fn (fn (n) (fn () (set n (- n 1)) n)))`))
  evaluate(parse(`(def t1 (test_fn 5))`))
  it('nested function', function() { check(evaluate(parse('(+ (t1) (t1))')), 7) })

  evaluate(parse(`
    (def test2_fn
      (fn ()
        (def x (fn () 5))
        (def y (x))
        (set y (+ y 1))
        y))`))
  it('def/set in function', function() { check(evaluate(parse('(test2_fn)')), 6) })

  it('car', function() { check(evaluate(parse('(car (cons 1 2))')), 1) })
  it('cdr', function() { check(evaluate(parse('(cdr (cons 1 2))')), 2) })
  it('car cdr', function() { check(evaluate(parse('(car (cdr (cons 0 (cons 1 2))))')), 1) })

  it('quote', function() { check(evaluate(parse('(quote (cons 1 2))')), "(cons 1 2)") })
  it('quote compiled', function() { check(evaluate(parse('((fn () (quote (cons 1 2))))')), "(cons 1 2)") })
})

*/
