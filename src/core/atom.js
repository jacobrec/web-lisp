export function atom_symbol(str) {
  return Symbol.for(str)
}

export function atom_string(str) {
  return str
}

export function atom_sexp(exp) {
  // TODO: convert array to linked list?
  return exp
}

export function atom_number(num) {
  return num
}
export function atom_bool(bol) {
  return bol
}

export function atom_type_of(atom) {
  if (atom_is_string(atom)) {
    return "string"
  } else if (atom_is_bool(atom)) {
    return "bool"
  } else if (atom_is_symbol(atom)) {
    return "symbol"
  } else if (atom_is_sexp(atom)) {
    return "sexp"
  } else if (atom_is_number(atom)) {
    return "number"
  } else if (atom_is_nil(atom)) {
    return "nil"
  }
  throw `unknown atom type: <${JSON.stringify(atom)}>`
}

export let atom_is_string = (atom) => typeof atom === "string"
export let atom_is_bool = (atom) => typeof atom === "boolean"
export let atom_is_symbol = (atom) => typeof atom === "symbol"
export let atom_is_number = (atom) => typeof atom === "number"
export let atom_is_sexp = (atom) => typeof atom === "object" && Array.isArray(atom)
export let atom_is_nil = (atom) => typeof atom === "object" && atom === null
