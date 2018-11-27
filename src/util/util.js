export const clone = source => {
  return JSON.parse(JSON.stringify(source));
};

/**
 * 根据地址下载文件
 * @param {string} href 文件地址
 * @param {string} fileName 下载的文件名称
 */
export const downloadFile = (href, fileName) => {
  const el = document.createElement('a');
  el.setAttribute('href', href);
  el.setAttribute('download', fileName);
  el.click();
};
