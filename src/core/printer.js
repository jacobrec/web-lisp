export function print(obj) {
  console.log(stringify(obj))
}

export function stringify(atom) {
  switch (atom.type) {
  case "str": return `"${atom.value}"`
  case "num": return `${atom.value}`
  case "sym": return `${atom.value}`
  case "bol": return `${atom.value}`
  case "exp": return `(${atom.value.map(stringify).join(' ')})`
  }
  throw `unknown type to print: <${JSON.stringify(atom)}>`
}
