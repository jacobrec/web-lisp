import {
  parse_or,
  parse_apply,
  parse_some,
  parse_many,
  parse_between,
  parse_until,
  parse_lit_iw,
  parse_lit,
  parse_ignore_leading_white,
  parse_white,

  parse_int,
  parse_float,
  parse_string_lit,
} from "./parser_combinator.js"


let parse_atom = parse_atom_fn()
let parse_sexp = parse_sexp_fn()

// parses a single s-expression,
// returns
// {
//   rest: [string| unparsed part of string],
//   expr: [sexp| parsed sexp]
// }
function parse_sexp_fn() {
  return (str) => parse_between(
    parse_lit_iw("("),
    parse_many(parse_atom_fn()),
    parse_lit_iw(")")
  )(str)
}

let parse_identifier = parse_until(parse_or(parse_white, parse_lit(")"), parse_lit("(")))
// parses a single atom
// returns
// {
//   rest: [string| unparsed part of string],
//   expr: [sexp| parsed atom]
// }
function parse_atom_fn() {
  let parse_data = (str) => parse_or(
    parse_apply(r => ({type:"num", value: r}), parse_float),
    parse_apply(r => ({type:"num", value: r}), parse_int),
    parse_apply(r => ({type:"str", value: r}), parse_string_lit('"')),
    parse_apply(r => ({type:"sym", value: r}), parse_identifier),
    parse_apply(r => ({type:"exp", value: r}), parse_sexp_fn()),
  )(str)

  return parse_ignore_leading_white(parse_data)
}

import util from 'util'
export function parse(str) {
  let data = parse_atom(str)
  // console.log(util.inspect(data, false, null, true)) // showHidden: false, depth: null, colors: true
  return data.result
}

