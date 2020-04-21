// take in several parsers and succeeds if all of them succeed in sequence
export function parse_and() {
  let args = arguments;
  console.log(args)
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
  console.log(args)
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
