// 获取 localStorage
export const getItem = key => {
  return localStorage.getItem(key);
};

// 设置 localStorage
export const setItem = (key, val) => {
  return localStorage.setItem(key, val);
};

// 移除 localStorage
export const removeItem = key => {
  return localStorage.removeItem(key);
};

// 深克隆
export const clone = o => {
  return JSON.parse(JSON.stringify(o));
};

// 对象是否是一个没有属性的空对象
export const isEmptyObj = obj => {
  if (!obj) {
    return true;
  }
  return !Object.keys(obj).length;
};

// 触发 resize 事件
export const triggerResize = () => {
  let e = document.createEvent('Event');
  e.initEvent('resize', true, true);
  window.dispatchEvent(e);
  e = null;
};

export const getToken = () => {
  const userInfo = JSON.parse(getItem('userInfo'));
  if (userInfo) {
    return userInfo.AccessToken;
  }
  return '';
};
