
export const reset = (str: string) => {
  return `${str}\u001b[0m`
} 

export const green = (str: string) => {
  return reset(`\u001b[32m${str}`)
} 