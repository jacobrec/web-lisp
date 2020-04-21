export function parse_between(p1, p2, p3) {
}

// applies a function on a parse if it succeeds
export function parse_apply(f, p1) {
  return function (str) {
    let res = p1(str)
    if (!res.error) { res.result = f(res.result) }
    return res
  }
}

// takes in a parser and parses it until it no longer succeeds. May be zero times (p*)
export function parse_many(p) {
  return parse_optional(parse_some(p))
}

// takes in a parser and parses it if it can (p?)
export function parse_optional(p) {
  return function (str) {
    let val = p(str)
    if (val.error) {
      return { error: false, result: null, rest: str }
    } else {
      return val
    }
  }
}

// takes in a parser and parses it until it no longer succeeds. May not be zero times (p+)
export function parse_some(p) {
  return function (str) {
    let res = perr(str)
    let val = perr(str)
    do {
      let val_new = p(val.rest)
      val_new.result = (val.result || []).concat([val_new.result])
      if (!val_new.error) {
        val = val_new
      }
      res = val_new
    } while (!res.error);
    return val;
  }
}

export function parse_or_lit() {
  let args = [].slice.call(arguments).map(parse_lit)
  return parse_or.apply(null, args)
}

// take in several parsers and succeeds if all of them succeed in sequence
export function parse_and() {
  let args = arguments;
  return function (str) {
    let i = 0;
    let val = perr(str)
    do {
      if (i >= args.length) {
        return val
      }
      let val_new = args[i](val.rest)
      val_new.result = (val.result || []).concat([val_new.result])
      val = val_new
      if (val.error) {
        return perr(str)
      }
      i ++
    } while (true)
  }
}

// take in several parsers and succeeds if any succeed
export function parse_or() {
  let args = arguments;
  return function (str) {
    if (args.length < 1) {
      return perr(str)
    } else {
      let i = 0;
      do {
        if (i >= args.length) {
          return perr(str)
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
      return perr(str)
    }
  }
}

export function parse_lit_iw(lit) {
  return function (str) {
    let nstr = str.trimStart()
    if (nstr.startsWith(lit)) {
      return { error: false, result: lit, rest: nstr.substr(lit.length) }
    } else {
      return perr(str)
    }
  }
}

export function parse_string_lit_iw(open, close) {
  let parse = parse_string_lit(open, close)
  return function (str) {
    let nstr = str.trimStart()
    return parse_or(parse, perr(str))(nstr)
  }
}
export function parse_string_lit(open, close) {
  let escp = "\\"
  if (!close) {
    close = open
  }

  let success = function (str, i) {
    return { error: false, rest: str.substr(i + close.length), result: str.substr(open.length, i - open.length) }
  }

  return function (str) {
    let err = perr(str);
    if (!str.startsWith(open)) {
      return err
    }
    let i = 1
    while (i < str.length) {
      let c = str.charAt(i)
      if (c == escp) {
        let start = str.substr(0, i)
        let end = str.substr(i+1)
        str = start + end
      } else if (c == close) {
        return success(str, i)
      }
      i += 1
    }
    return err
  }
}

function perr(str) {
  return parse_error()(str)
}

export function parse_error() {
  return function (str) {
    return { error: true, result: null, rest: str }
  }
}


export let parse_spaces = parse_some(parse_lit(" "))
export let parse_digit = parse_apply(parseInt, parse_or_lit("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"))
export let parse_int = parse_apply(function (res) {
  let val = 0;
  for (let x of res) {
    val *= 10
    val += x
  }
  return val
}, parse_some(parse_digit))
export let parse_float = parse_apply(function (res) {
  res[0] = res[0] | 0
  res = res.reduce((a,b) => a+b)
  res = parseFloat(res)
  return res
}, parse_and(parse_optional(parse_int), parse_lit("."), parse_int))
