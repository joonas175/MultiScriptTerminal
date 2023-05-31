
export type ColorFunction = (str: string) => string;

export const reset = (str: string) => {
  return `${str}\u001b[0m`
} 

export const green = (str: string) => {
  return reset(`\u001b[32m${str}`)
} 

export const red = (str: string) => {
  return reset(`\u001b[91m${str}`);
};

export const lightGray = (str: string) => {
  return reset(`\u001b[37m${str}`)
}

export const underLine = (str: string) => {
  return `\u001b[4m${str}`
}

export const boldUnderline = (str: string) => {
  return underLine(`\u001b[1m${str}`);
}

export const darkGrayBg = (str: string) => {
  return `\u001b[100m${str}`
}