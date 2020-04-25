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
} from "../parser_combinator.js"

import {
  atom_bool,
  atom_number,
  atom_sexp,
  atom_array,
  atom_string,
  atom_symbol,
} from "./atom.js"


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

function parse_array() {
  return (str) => parse_between(
    parse_lit_iw("["),
    parse_many(parse_atom_fn()),
    parse_lit_iw("]")
  )(str)
}

let parse_identifier = parse_until(parse_or(parse_white, parse_lit("["), parse_lit("]"), parse_lit(")"), parse_lit("(")))
// parses a single atom
// returns
// {
//   rest: [string| unparsed part of string],
//   expr: [sexp| parsed atom]
// }
function parse_atom_fn() {
  let parse_data = (str) => parse_or(
    parse_apply(atom_number, parse_float),
    parse_apply(atom_number, parse_int),
    parse_apply(atom_string, parse_string_lit('"')),
    parse_apply(_e => atom_bool(true), parse_lit("true")),
    parse_apply(_e => atom_bool(false), parse_lit("false")),
    parse_apply(atom_symbol, parse_identifier),
    parse_apply(atom_array, parse_array()),
    parse_apply(atom_sexp, parse_sexp_fn()),
  )(str)

  return parse_ignore_leading_white(parse_data)
}

export function parse(str) {
  let data = parse_atom(str)
  return data.result
}

