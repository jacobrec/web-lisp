import {
  list_from_array,
  is_list,
} from './runtime.js'


export function symbol (sym) {
  this.description = sym
}
export function symbol_data(sym) {
  return sym.description
}
export function atom_symbol(str) {
  return new symbol(str)
}

export function atom_string(str) {
  return str
}

export function atom_sexp(exp) {
  return list_from_array(exp || [])
}

export function atom_array(exp) {
  return exp
}

export function atom_number(num) {
  return num
}
export function atom_bool(bol) {
  return bol
}
export function atom_nil(nil) {
  return null
}


export let atom_is_string = (atom) => typeof atom === "string"
export let atom_is_bool = (atom) => typeof atom === "boolean"
export let atom_is_symbol = (atom) => atom && atom.constructor.name === "symbol"
export let atom_is_number = (atom) => typeof atom === "number"
export let atom_is_sexp = (atom) => is_list(atom)
export let atom_is_array = (atom) => typeof atom === "object" && Array.isArray(atom) && atom.type === undefined
export let atom_is_nil = (atom) => atom === null

export function atom_type_of(atom) {
  if (atom_is_string(atom)) {
    return "string"
  } else if (atom_is_nil(atom)) {
    return "nil"
  } else if (atom_is_bool(atom)) {
    return "bool"
  } else if (atom_is_symbol(atom)) {
    return "symbol"
  } else if (atom_is_sexp(atom)) {
    return "list"
  } else if (atom_is_array(atom)) {
    return "array"
  } else if (atom_is_number(atom)) {
    return "number"
  }
  throw Error(`unknown atom type: <${JSON.stringify(atom)}>`)
}
