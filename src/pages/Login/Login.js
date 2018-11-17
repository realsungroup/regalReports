import React from 'react';
import { Redirect } from 'react-router-dom';
import { defaultLogin } from '../../util/auth';
import { setItem } from '../../util/localCache';
import { preLoadImg } from '../../util/imgUtil';
import { Spin, message } from 'antd';
import accountIcon from './images/account.png';
import passwordIcon from './images/password.png';
import './Login.less';
import { domainLogin } from 'Util/api';
import classNames from 'classnames';
import loginLeft from './images/login-left.png';
import logoImg from '../../assets/logo.png';

const domainLoginConfig = window.domainLogin;
const defaultLoginMode = window.defaultLoginMode;

export default class Login extends React.Component {
  state = {
    userName: '',
    password: '',
    errorMsg: '',
    ready: false,
    redirectToReferrer: false,
    loginMode: defaultLoginMode // 登录模式：'normal' 普通登录 | 'domain' 域登录
  };

  componentDidMount() {
    preLoadImg([accountIcon, passwordIcon], () => {
      this.setState({ ready: true });
    });
    this.setThemeColor(window.themeColor);
  }

  setThemeColor = themeColor => {
    try {
      window.less
        .modifyVars(themeColor)
        .then(() => {})
        .catch(err => {
          message.error(err.message);
        });
    } catch (err) {
      message.error('设置主题色出错，请刷新页面');
    }
  };

  handleUserNameChange = e => {
    this.setState({ userName: e.target.value });
  };

  handlePasswordChange = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = () => {
    this.login();
  };

  login = async () => {
    const { userName, password, loginMode } = this.state;

    // 普通方式登录
    if (loginMode === 'normal') {
      try {
        const response = await defaultLogin(userName, password);
        const result = response.OpResult;
        if (result === 'Y') {
          setItem('userInfo', JSON.stringify(response));
          this.setState({
            redirectToReferrer: true
          });
          localStorage.setItem('curLoginMode', 'normal');
          console.log('登录成功');
        } else if (result === 'N') {
          const errorMsg = response.ErrorMsg;
          this.setState({ errorMsg });
        }
      } catch (err) {
        console.error(err.message);
      }
      // 域登录
    } else {
      const domain = domainLoginConfig.domain;
      const usernameSuffix = domainLoginConfig.usernameSuffix;
      const domainUserField = domainLoginConfig.domainUserField;
      try {
        const response = await domainLogin(
          userName + usernameSuffix,
          password,
          domain,
          domainUserField
        );
        const result = response.OpResult;
        if (result === 'Y') {
          setItem('userInfo', JSON.stringify(response));
          this.setState({
            redirectToReferrer: true
          });
          localStorage.setItem('curLoginMode', 'domain');
          console.log('登录成功');
        } else if (result === 'N') {
          const errorMsg = response.ErrorMsg;
          this.setState({ errorMsg });
        }
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  loginModeChange = () => {
    this.setState({
      loginMode: this.state.loginMode === 'normal' ? 'domain' : 'normal'
    });
  };

  render() {
    const {
      userName,
      password,
      errorMsg,
      ready,
      redirectToReferrer,
      loginMode
    } = this.state;
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }
    const usernameSuffix = domainLoginConfig.usernameSuffix;
    return (
      <div className="login">
        <Spin spinning={!ready}>
          <div className="login-left-part">
            <img src={loginLeft} alt="" />
          </div>
          <div className="login-right-part">
            <img src={logoImg} alt="logo" className="login__logo-img" />
            <div className="login-input">
              <span>切换为 </span>
              <a href="javascript:;" onClick={this.loginModeChange}>
                {loginMode === 'normal' ? '域登录' : '普通登录'}
              </a>
              <div style={{ marginTop: 10 }} className="login-input-item">
                <div className="login-input-icon">
                  <img
                    className="login-input-icon-inner"
                    src={accountIcon}
                    alt=""
                  />
                </div>

                <input
                  type="text"
                  className="login-input-box"
                  placeholder="请输入您的账号"
                  value={userName}
                  onChange={this.handleUserNameChange}
                />

                {loginMode === 'domain' ? (
                  <span style={{ fontWeight: 'bold' }}>{usernameSuffix}</span>
                ) : null}
              </div>

              <div className="login-input-item">
                <div className="login-input-icon">
                  <img
                    className="login-input-icon-inner"
                    src={passwordIcon}
                    alt=""
                  />
                </div>

                <input type="hidden" />
                <input
                  type="password"
                  className="login-input-box"
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={this.handlePasswordChange}
                />
              </div>

              {errorMsg && <div className="login-fail">{errorMsg}</div>}
              <div className="login-right-part-row">
                <div className="login-forget-password" onClick={() => {}}>
                  忘记密码？
                </div>
                <div className="login-register" onClick={() => {}}>
                  注册
                </div>
              </div>
            </div>
            <button className="login-submit-btn" onClick={this.handleSubmit}>
              登 录
            </button>
            <div className="login-copyright">Copyright © 2008 ~ 2018 </div>
          </div>
        </Spin>
      </div>
    );
  }
}
