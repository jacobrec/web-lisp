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

// take in several parsers and succeeds if all of them succeed in sequence
export function parse_and() {
  let args = arguments;
  console.log(args)
  return function (str) {
    let i = 0;
    let val = { error: false, result: null, rest: str }
    do {
      if (i >= args.length) {
        return val
      }
      let val_new = args[i](val.rest)
      val_new.result = (val.result || []).concat([val_new.result])
      val = val_new
      if (val.error) {
        return { error: true, result: null, rest: str }
      }
      i ++
    } while (true)
  }
}

// take in several parsers and succeeds if any succeed
export function parse_or() {
  let args = arguments;
  console.log(args)
  return function (str) {
    if (args.length < 1) {
      return { error: true, result: null, rest: str }
    } else {
      let i = 0;
      do {
        if (i >= args.length) {
          return { error: true, result: null, rest: str }
        }
        let val = args[i](str)
        if (!val.error) {
          return val
        }
        i ++
      } while (true)
    }
  }
}

export function parse_lit(lit) {
  return function (str) {
    if (str.startsWith(lit)) {
      return { error: false, result: lit, rest: str.substr(lit.length) }
    } else {
      return { error: true, result: null, rest: str }
    }
  }
}

export function parse_lit_iw(lit) {
  return function (str) {
    let nstr = str.trimStart()
    if (nstr.startsWith(lit)) {
      return { error: false, result: lit, rest: nstr.substr(lit.length) }
    } else {
      return { error: true, result: null, rest: str }
    }
  }
}
