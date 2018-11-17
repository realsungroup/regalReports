import appConfig, { dataType } from './http.config';
import { getItem, removeItem, setItem } from './localCache';
import Axios from 'axios';
import qs from 'qs';

Axios.interceptors.response.use(
  function(res) {
    return res;
  },
  function(error) {
    return Promise.reject(error);
  }
);

// GET 请求拼装参数
const appendParamsForGet = (url, params) => {
  // let keysArr = params ? Object.keys(params) : [];
  // for (let i = 0; i < keysArr.length; i++) {
  //   let key = keysArr[i];
  //   if (!i) url += '?' + key + '=' + params[key];
  //   else url += '&' + key + '=' + params[key];
  // }
  // return url;
  return url + '?' + qs.stringify(params);
};

/**
 * 组装 header：不同的登录方式，请求的 header 不同
 * @param {string} url 请求地址
 * @return {}
 */
function getHeaderWithUrl(url) {
  // 默认 headers
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
  };

  // 非企业登陆
  let userInfo;
  userInfo = JSON.parse(getItem('userInfo'));

  // 用户未登录时
  if (!userInfo) {
    return headers;
  }

  return Object.assign(headers, {
    userCode: userInfo.UserCode,
    accessToken: userInfo.AccessToken
  });
}

// 根据 type 给 body 添加额外的参数
const addDataWithDataType = (data, type) => {
  switch (type) {
    // 工号登录
    case dataType.LoginEM:
      data.loginMethod = 'badgeno'; // 工号
      setItem('loginMethod', data.loginMethod);
      break;
    // 动态登录
    case dataType.LoginDynamicEM:
      data.loginMethod = 'badgenodynamic';
      setItem('loginMethod', data.loginMethod);
      break;
    // 默认登录
    case dataType.LoginDefaultEM:
      data.loginMethod = 'default';
      setItem('loginMethod', data.loginMethod);
      break;
    // 默认动态登录
    case dataType.LoginDefaultDynamicEM:
      data.loginMethod = 'defaultdynamic';
      setItem('loginMethod', data.loginMethod);
      break;
    // 微信登录
    case dataType.LoginWXUnionidEM:
      data.loginMethod = 'weixin';
      setItem('loginMethod', data.loginMethod);
      break;
    // 手机验证码登录
    case dataType.LoginMobileValidateCodeEM:
      data.loginMethod = 'mobileonly';
      data.enterprisecode = ' ';
      setItem('loginMethod', data.loginMethod);
      break;
    // 获取主表数据
    case dataType.HostTableDataEM:
      break;

    case dataType.AddOneDataEM:
      data.data._id = 1;
      data.data._state = 'added';
      data.data.REC_ID = 0;
      data.data = JSON.stringify([data.data]);
      break;

    case dataType.BeforeAddOneData:
      data.data._id = 1;
      data.data._state = 'added';
      data.data.REC_ID = 0;
      data.data = JSON.stringify([data.data]);
      break;

    case dataType.AddMultiDataEM:
      data.data.forEach((item, idx) => {
        item.UserID = JSON.parse(localStorage.getItem('userInfo')).UserCode;
        item._id = idx + 1;
        item._state = 'editoradd';
      });
      data.data = JSON.stringify(data.data);

    case dataType.AttachTableDataEM:
      break;

    case dataType.FixOneDataEM:
      data.data._id = 1;
      data.data._state = 'modified';
      data.data = JSON.stringify([data.data]);
      break;

    case dataType.BeforeFixOneData:
      data.data._id = 1;
      data.data._state = 'modified';
      data.data = JSON.stringify([data.data]);
      break;

    case dataType.FixMoreDataEM:
      data.data.forEach(item => {
        item._id = 1;
        item._state = 'modified';
      });
      data.data = JSON.stringify(data.data);
      break;

    case dataType.DeleteOneDataEM:
      data.data._id = 1;
      data.data._state = 'removed';
      data.data = JSON.stringify([data.data]);
      break;

    case dataType.DeleteMultiDataEM:
      data.data.forEach((item, idx) => {
        item._id = idx + 1;
        item._state = 'removed';
      });
      data.data = JSON.stringify(data.data);
      break;

    case dataType.AddMoreAndFixMore:
      data.data.add.forEach(item => {
        item._id = 1;
        item._state = 'added';
        item.REC_ID = 0;
      });

      data.data.fix.forEach(item => {
        item._id = 1;
        item._state = 'modified';
      });
      data.data = data.data.add.concat(data.data.fix);
      data.data = JSON.stringify(data.data);
      break;

    case dataType.EditOrAdd:
      data.data._id = 0;
      data.data._state = 'editoradd';
      // data.data.REC_ID = 0;
      data.data = JSON.stringify([data.data]);
      break;

    default:
      break;
  }
  return data;
};

//上传图片的方法
export const uploadImageApi = param => {
  let url =
    appConfig.path.uploadFileUrl +
    '?savepath=c:\\web\\web\\web\\rispweb\\upfiles&httppath=' +
    appConfig.path.httppath;
  let formData = new FormData();
  // fd.append("file", param, 'hello.png');//新建formdata提交，png格式
  let file = { uri: param, type: 'multipart/form-data', name: 'a.jpg' };
  formData.append('images', file);
  let options = {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData
  };
  return fetch(url, options).then(value => extractData(value));
};

// 处理服务器返回的数据（根据实际的 error 参数的值来 resolve 和 reject）
export const dealNextExtractData = promise => {
  return promise.then(value => {
    if (value && (value.error === 0 || value.Error === 0)) {
      return Promise.resolve(value);
    } else {
      return Promise.reject(value);
    }
  });
};

// 处理 http 请求返回的数据
const extractData = value => {
  if (value.status === 200) {
    value = value.data;
    return value;
  } else {
    // token 失效
    if (value.status === 401) {
      console.log('401401');
      window.location.href = '/login';
      value = value.data;
      if (value.Message === '已拒绝为此请求授权。') {
        removeItem('userInfo');
        removeItem('loginMethod');
      }
    }
    return value;
  }
};

/**
 * http
 * @param {string} url 请求地址
 * @param {string} method 请求方法
 * @param {object} body 参数
 * @param {string} type 请求类型
 * @return {promise} 处理后的后台数据
 */
export default function http(url, method, params, type) {
  // 组装 headers
  const headers = getHeaderWithUrl(url);
  // 根据 type 给 data 添加额外的参数
  params = addDataWithDataType(params, type);

  let options = {
    method: method,
    headers: headers
  };

  if (method === 'GET') {
    url = appendParamsForGet(url, params);
  } else if (method === 'POST') {
    options.data = JSON.stringify(params);
  } else {
    Promise.reject('请使用 GET 和 POST 方式请求数据');
  }
  options.url = url;
  return Axios(options).then(value => extractData(value));
}
