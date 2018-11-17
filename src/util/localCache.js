// 获取 localStorage
export const getItem = key => {
  return localStorage.getItem(key)
}

// 设置 localStorage
export const setItem = (key, val) => {
  return localStorage.setItem(key, val)
}

// 移除 localStorage
export const removeItem = key => {
  return localStorage.removeItem(key)
}
