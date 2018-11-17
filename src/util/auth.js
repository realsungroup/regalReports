import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import appConfig, { dataType } from './http.config';
import http from './http';
import { getItem, removeItem } from './localCache';

export const loggedIn = () => !!getItem('userInfo');

export const logout = () => {
  removeItem('userInfo');
};

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      loggedIn() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: {
              from: props.location
            }
          }}
        />
      )
    }
  />
);

// ================================= 登录 =================================

const { path } = appConfig;
const { baseUrl8055, baseUrlEnterprise } = path;
const GET = 'GET';
const POST = 'POST';

const baseUrl = window.baseUrl;

// 默认登录
export const defaultLogin = async (code, password) => {
  let url = baseUrl + path.login;
  const params = {
    Code: code,
    Password: password
  };
  return http(url, POST, params, dataType.LoginDefaultEM);
};

//修改密码
export const changePassword = (oldpass, newpass) => {
  const url = baseUrl + path.changePassword;
  const params = {
    OldPass: oldpass,
    NewPass1: newpass
  };
  return http(url, POST, params, dataType.HostTableDataEM);
};

// 工号登录(企业用户)
export const loginWithBadgeNo = async (badgeNo, badgePassword) => {
  let url = baseUrl + path.login;
  const params = {
    badgeno: badgeNo,
    unionid: ' ',
    password: badgePassword,
    enterprisecode: '9063'
  };
  return http(url, POST, params, dataType.LoginEM);
};

// 登陆(微信unionid登陆)
export const login = params => {
  let url = baseUrl + path.login;
  return http(url, POST, params, dataType.LoginWXUnionidEM);
};

// 验证手机号
export const validatePhoneNumber = async handphone => {
  const url = baseUrl + path.phoneExist;
  let params = {
    handphone
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 验证用户
export const validateUser = async userid => {
  const url = baseUrl + path.userExist;
  let params = {
    userid
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 短信注册(非企业用户)
export const registerForMessage = async (validCode, Handphone) => {
  const url = baseUrl + path.register;
  let params = {
    validCode,
    Handphone
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 获取验证码（企业用户)
export const getValidateCode = async telephone => {
  const url = path.baseUrlValidateCode + path.getValidateCode;
  const params = {
    telephone
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 获取验证码（非企业用户)
export const getNoEnterpriseValidateCode = async telephone => {
  const url = baseUrl8055 + path.getValidateCode;
  const params = {
    telephone
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 手机验证码登陆(企业用户)
export const loginWithValidateCode = (mobileno, validcode) => {
  let url = baseUrl + path.login;
  const params = {
    mobileno,
    unionid: ' ',
    validcode
  };
  return http(url, POST, params, dataType.LoginMobileValidateCodeEM);
};

// 手机验证码登陆(非企业用户)
export const loginNoEnterpriseWithValidateCode = async (
  mobileno,
  validcode
) => {
  let url = baseUrl + path.login;
  const params = {
    mobileno,
    unionid: ' ',
    validcode
  };
  return http(url, POST, params, dataType.LoginMobileValidateCodeEM);
};

// 获取微信access_token
export const getWXAccessToken = async code => {
  const url = path.getWXAccessToken;
  let params = {
    appid: 'wx3e771d44ee153d35',
    secret: '303ca657f207c53f74a94607a5214b43',
    code,
    grant_type: 'authorization_code'
  };
  return http(url, GET, params, dataType.UnKnow);
};
