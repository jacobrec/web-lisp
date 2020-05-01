import { print, jsprint, stringify } from './printer.js'

import {
  atom_type_of,
  atom_is_symbol,
  atom_is_string,
  atom_is_sexp,
  atom_is_nil,
  symbol_data,
  symbol,
} from './atom.js'

import {
  map,
  cons,
  car,
  cdr,
  concat,
  is_list,
  nth,
  array_from_list,
  get_scope,
} from './runtime.js'

let LOCAL_NEXT = Symbol("variable_scope")

let forms = {
  if: if_expr,
  def,
  set,
  fn: lambda,
  quote,
  quaziquote, // also unquote
  ['quazi-eval']: quazi_eval,
  defmacro,
}

let compile_data = {}
compile_data.globals = {}
compile_data.litmap = {}
compile_data.lits = []

let builtins = ["+", "-", "*", "/", "<", ">", "<=", ">=", "="]

let is_macro = (atom) => typeof atom === "object" && atom && atom.type === "macro"
function defmacro(args, compile_data) {
  // jsprint(compile_data)
  // console.log(l)
  let name = car(args)
  let rargs = cdr(args)

  let loc = compile_data.globals
  let call = lambda_body(rargs, compile_data)
  //call = "console.log('in macro call. scope: ', this);" + call
  let fargs = lambda_extract_args(rargs, compile_data)
  // console.log(fargs.concat([call]))
  let fn = Function.prototype.constructor.apply({}, fargs.concat([call]))
  // console.log("Macro Function:", fn.toString(), "args:", fargs)
  loc[symbol_data(name)] = {
    type: "macro",
    fn,
    args: fargs
  }
  return undefined
}

function lambda_extract_args(args, compile_data) {
  let local_args = array_from_list(car(args))
  return local_args.map(symbol_data)
}
function lambda_body(args, compile_data) {
  let body_stmts = array_from_list(map(cdr(args), e => compile(e, compile_data)))
  body_stmts[body_stmts.length - 1] = 'return ' + body_stmts[body_stmts.length - 1]
  return body_stmts
}
function with_lambda_scope(fn, args, compile_data) {
  let v = compile_data.is_top
  compile_data.is_top = false
  compile_data.locals = { [LOCAL_NEXT]: compile_data.locals }
  let local_args = lambda_extract_args(args, compile_data)
  for (let l of local_args) {
    compile_data.locals[l] = true
  }
  let val = fn(args, compile_data, local_args)
  compile_data.is_top = v
  compile_data.locals = compile_data.locals[LOCAL_NEXT]
  return val
}

function lambda(args, compile_data) {
  // TODO: asserts for valid forms
  // jsprint(args)
  let c = with_lambda_scope((args, compile_data, local_args) => {
    let body_stmts = lambda_body(args, compile_data)
    let c = `(${local_args.join(',')}) => {${body_stmts.join(';')}}`
    return c
  }, args, compile_data)
  return c
}
function if_expr(args, compile_data) {
  // TODO: asserts for valid forms
  return `(${compile(car(args), compile_data)}) ? (${compile(nth(args, 1), compile_data)}) : (${compile(nth(args, 2), compile_data)})`
}

function def(args, compile_data) {
  // TODO: asserts for valid forms
  let name = symbol_data(car(args))
  if (compile_data.is_top) {
    compile_data.globals[symbol_data(car(args))] = true
    return `this['${name}'] = (${compile(nth(args, 1), compile_data)})`
  } else {
    compile_data.locals[symbol_data(car(args))] = true
    return `let ${name} = (${compile(nth(args, 1), compile_data)})`
  }
}
function set(args, compile_data) {
  // TODO: asserts for valid forms
  let loc = compile(car(args), compile_data)
  if (atom_type_of(loc) === "symbol") {
    loc = symbol_scope_resolution(loc)
  }
  return `${loc} = (${compile(nth(args, 1), compile_data)})`
}

function quote(args, compile_data) {
  let item = car(args)
  return `this['__lits'][${create_literal(item, compile_data)}]`
}
function quaziquote(args, compile_data) {
  let oitem = car(args)
  let quazi_inner = (item) => {
    if (atom_type_of(item) == "list") {
      if (atom_type_of(car(item)) == "symbol" && symbol_data(car(item)) == "unquote") {
        // console.log("unquote compiles to:", scope_symbol(car(cdr(item)), compile_data), compile_data)
        return scope_symbol(car(cdr(item)), compile_data)
      } else if (atom_type_of(car(item)) == "symbol" && symbol_data(car(item)) == "unquote-splice") {
        return cons(new symbol("unquote-splice"), scope_symbol(car(cdr(item)), compile_data))
      } else {
        return map(item, quazi_inner)
      }
    } else if (atom_type_of(item) == "array") {
      throw 'Quaziquote not implemented for arrays yet'
    } else {
      return quote(cons(item, null), compile_data)
    }
  }
  let res = `this['evaluate'].call(this, JSON.parse(\`${JSON.stringify(cons(new symbol("quazi-eval"), quazi_inner(oitem)), null, 4)}\`))`
  //console.log("quaziJS=", res)
  // `(1 2 ,x 4) => (`1 `2 3 `4)
  // (quaziquote (1 2 3)) => this['parse']('(1 2 3)')
  // (quaziquote (1 2 x)) => this['parse']('(1 2 x)')
  // (quaziquote (1 2 (unquote x))) => this['parse']('(1 2 ${this['evaluate'](this['parse']('x')})')
  // (quaziquote (1 2 (unquote (+ 1 2)))) => this['parse']('(1 2 ${this['evaluate'](this['parse']('(+ 1 2)')})')
  // (quaziquote (0 (unquote (quote (1 2 3))))) => this['parse'](`(0 ${this['stringify'](this['evaluate'](this['parse'](`(quote (1 2 3))`)))})`)
  // (quaziquote (0 (unquote-splice (quote (1 2 3))))) => this['parse'](`(0 ${this['stringify'](this['evaluate'](this['parse'](`(quote (1 2 3))`)))})`)
  return res
}

import { jeval } from './eval.js'
function quazi_eval(args, compil_data) {

  let scope = this
  // console.log("qqes", scope)
  let process = e => {
    if (atom_is_nil(e)) {
      return e
    }
    let h = car(e)
    if (atom_type_of(h) === "list" && atom_type_of(car(h)) === "symbol" && symbol_data(car(h)) === "unquote-splice") {
      return concat(jeval(cdr(h), false, scope), process(cdr(e)), this)
    } else {
      let head = atom_type_of(h) === "string" ? jeval(h, false, scope) : h
      return cons(head, process(cdr(e)))
    }
  }
  //console.log("args:", args)
  let data = is_list(args) ? process(args) : jeval(args)
  // console.log("quaziJSData=", data)
  let res = `JSON.parse(\`${JSON.stringify(data)}\`)`
  // console.log("quaziJSPOST=", res)
  return res
}

function create_literal(item, compile_data) {
  let sitem = stringify(item)
  if (compile_data.litmap[sitem] !== undefined) {
    return compile_data.litmap[sitem]
  }
  let num = compile_data.lits.length
  compile_data.lits.push(item)
  compile_data.litmap[sitem] = num
  return num
}

export function init_compiler(scope) {
  scope.__lits = compile_data.lits
}

export function compile_tl(atom, inscope) {
  compile_data.is_top = true
  compile_data.locals = {}
  return compile(atom, compile_data, inscope)
}

function compile(atom, compile_data, inscope) {
  switch (atom_type_of(atom)) {
  case "string": return `"${atom}"`
  case "number": return `${atom}`
  case "nil":    return `null`
  case "void":   return `undefined`
  case "symbol": return `${scope_symbol(atom, compile_data)}`// symbol_scope_resolution(atom, compile_data.locals)
  case "bool":   return `${atom}`
  case "list":   return compile_expr(atom, compile_data, inscope)
  case "array":  return compile_array(atom, compile_data)
  }
  throw Error(`unknown type to compile: <${JSON.stringify(atom)}>`)
}

function compile_array(atom, compile_data) {
  let expr = atom.map(e => scope_symbol(e, compile_data))
  return `[${expr.join(',')}]`
}

function compile_expr(lexpr, compile_data, inscope) {
  let expr = array_from_list(lexpr)
  let sym = expr[0]
  let args = expr.slice(1)
  // console.log("inscope",inscope)
  if (atom_is_symbol(sym) && forms[symbol_data(sym)]) {
    return forms[symbol_data(sym)].call(inscope, cdr(lexpr), compile_data)
  } else if (atom_is_symbol(sym) && builtins.includes(symbol_data(sym))) {
    return compile_binop(symbol_data(sym), args, compile_data)
  }
  let fn = compile(sym, compile_data)
  // console.log(`compiling call: [${fn}]`)
  // console.log(compile_data.globals)
  if (is_macro(compile_data.globals[symbol_data(sym)])) {
    let mac = compile_data.globals[symbol_data(sym)]
    // console.log("Found macro", mac)
    let r = mac.fn
    let scope = { ...get_scope() }
    mac.args.map((k, i) => [k, array_from_list(cdr(lexpr))[i]]).forEach(e => {
      let [k, v] = e
      scope[k] = v

    })
    // console.log("calling with env:", scope, "and args", array_from_list(cdr(lexpr)))
    let new_expr = r.apply(scope, array_from_list(cdr(lexpr)))
    // console.log("expanded to", new_expr)
    new_expr = reinitalize_litirals(new_expr, scope)
    // console.log("reinitialized to:")
    // jsprint(new_expr)
    let res = compile(new_expr, compile_data)
    // console.log("macro compiled to", res)
    return res
  }
  // console.log("function args:", args)
  return `(${fn})(${args.map(e => compile(e, compile_data)).join(',')})`
}

function reinit_lit(lit, scope) {
  // console.log(scope)
  if (lit.startsWith("this['__lits']")) {
    return jeval(lit, false, scope)
  } else if (lit.startsWith("this[")) {
    try {
      let v = jeval(lit, false, scope)
      if (v !== undefined)
        return v
    } catch (e) {
    }
  }
  return lit
}
function reinitalize_litirals (expr, scope) {
  if (expr === null) {
    return null
  }
  if (!atom_is_sexp(expr) && !atom_is_string(expr)) {
    return expr
  }
  let h = car(expr)
  let t = cdr(expr)
  return cons(atom_is_string(h) ? reinit_lit(h, scope) : reinitalize_litirals(h, scope), atom_is_string(t) ? reinit_lit(t, scope) : reinitalize_litirals(t, scope))

}

function compile_binop(op, args, compile_data) {
  if (args.length === 2) {
    return `((${compile(args[0], compile_data)}) ${op} (${compile(args[1], compile_data)}))`
  }
  let compiled = `this['${op}'](${args.map(e => compile(e, compile_data)).join(',')})`
  return compiled
}

function scope_symbol(atom, compile_data){
  if (atom_type_of(atom) === "symbol") {
    return symbol_scope_resolution(atom, compile_data.locals)
  }
  return compile(atom, compile_data)
}

function in_global_scope(name, locals) {
  if (locals[symbol_data(name)]) {
    return false
  } else if (!locals[LOCAL_NEXT]) {
    return true
  } else {
    return in_global_scope(name, locals[LOCAL_NEXT])
  }
}

function symbol_scope_resolution(name, locals) {
  // console.log(`Looking up ${JSON.stringify(name)} in ${JSON.stringify(locals)}`)
  if (in_global_scope(name, locals)) {
    return `this['${symbol_data(name)}']`
  } else {
    return symbol_data(name)
  }
}
