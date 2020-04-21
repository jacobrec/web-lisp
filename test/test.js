import assert from 'assert'
import { parse_lit, parse_lit_iw, parse_or, parse_and, parse_string_lit } from '../parser_combinator.js'

function check(a, b) {
  return assert.deepStrictEqual(a, b)
}

describe('parse', function() {
  let parse_a = parse_lit("a");
  let parse_b = parse_lit("b");
  let parse_a_iw = parse_lit_iw("a");
  let parse_b_iw = parse_lit_iw("b");
  let parse_a_or_b = parse_or(parse_a, parse_b)
  let parse_a_and_b = parse_and(parse_a, parse_b)
  let parse_a_and_b_iw = parse_and(parse_a_iw, parse_b_iw)
  let parse_str = parse_string_lit('"')

  describe('_lit()', function() {
    it('has a', function() { check(parse_a("apple"), {error: false, rest: "pple", result: "a"}) })
    it('not has a', function() { check(parse_a("banana"), {error: true, rest: "banana", result: null}) })
  });
  describe('_or()', function() {
    it('has a', function() { check(parse_a_or_b("apple"), {error: false, rest: "pple", result: "a"}) })
    it('has b', function() { check(parse_a_or_b("banana"), {error: false, rest: "anana", result: "b"}) })
    it('has neither', function() { check(parse_a_or_b("orange"), {error: true, rest: "orange", result: null}) })
  });
  describe('_and()', function() {
    it('has ab', function() { check(parse_a_and_b("abbot"), {error: false, rest: "bot", result: ["a", "b"]}) })
    it('has ba', function() { check(parse_a_and_b("banana"), {error: true, rest: "banana", result: null}) })
    it('has neither', function() { check(parse_a_and_b("orange"), {error: true, rest: "orange", result: null}) })
  });
  describe('_iw()', function() {
    it('has ab', function() { check(parse_a_and_b_iw("a b b o t"), {error: false, rest: " b o t", result: ["a", "b"]}) })
    it('has ba', function() { check(parse_a_and_b_iw("b a n a n a"), {error: true, rest: "b a n a n a", result: null}) })
    it('has neither', function() { check(parse_a_and_b_iw(" o r a n g e"), {error: true, rest: " o r a n g e", result: null}) })
  });
  describe('_string_lit()', function() {
    it('has string', function() { check(parse_str('hello "world"'), {error: true, rest: 'hello "world"', result: null}) })
    it('starts with string', function() { check(parse_str('"hello" world'), {error: false, rest: " world", result: "hello"}) })
    it('starts with empty string', function() { check(parse_str('"" world'), {error: false, rest: " world", result: ""}) })
    it('has no string', function() { check(parse_str("orange"), {error: true, rest: "orange", result: null}) })
    it('non terminating', function() { check(parse_str('"uhh'), {error: true, rest: '"uhh', result: null}) })
    it('escaped', function() { check(parse_str('"hello\\\" world"'), {error: false, rest: "", result: 'hello\" world'}) })
    it('escaped first', function() { check(parse_str('"\\\" world"'), {error: false, rest: "", result: '\" world'}) })
    it('escaped escape', function() { check(parse_str('"hello\\\\" world'), {error: false, rest: " world", result: 'hello\\'}) })
  });
});
