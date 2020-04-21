export function parse(str) {
  let p_test = parse_or_2(parse_lit("a"), parse_lit("b"));
  console.log(p_test(str))
}

// parses a single s-expression,
// returns
// {
//   rest: [string| unparsed part of string],
//   expr: [sexp| parsed sexp]
// }
function parse_sexp(str) {
}


// parses a single atom
// returns
// {
//   rest: [string| unparsed part of string],
//   expr: [sexp| parsed atom]
// }
function parse_atom(str) {

}

