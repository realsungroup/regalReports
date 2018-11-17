export const wrapStr = (str, wrapper) => {
  if (typeof wrapper === 'string') {
    return `${wrapper}${str}${wrapper}`
  }

  const { both, left, right } = wrapper
  if (both && typeof both === 'string') {
    return `${both}${str}${both}`
  }

  return `${left && typeof left === 'string' ? left : ''}${str}${
    right && typeof right === 'string' ? right : ''
  }`
}
