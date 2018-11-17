import React from 'react';
import './Container.less';
import SearchBox from '../components/SearchBox';
import PageHeader from '../components/PageHeader';
import UserInfo from '../components/UserInfo';
import { Route } from 'react-router-dom';
import { getItem } from '../../util/localCache';
import {
  Home,
  FnModule,
  WorkbenchSetting,
  TaskNotice,
  PersonCenter,
  Reminder,
  ReportTable
} from '../../loadableComponents';
import { message, Avatar, Input, Button, Icon } from 'antd';
import { retrieveReminderNum, defaultLogin, domainLogin } from 'Util/api';
import LockScreen from '../components/LockScreen';

let keyIndex = 0;
const defaultLoginMode = localStorage.getItem('curLoginMode');
const domainLoginConfig = window.domainLogin;

export default class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reminderNum: 0,
      password: ''
    };
    this.lockScreenRef = React.createRef();
  }

  componentDidMount = () => {
    this.retrieveReminderNum();
    let userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        userInfo = JSON.parse(userInfo);
      } catch (err) {
        return this.setThemeColor(window.themeColor);
      }
      const themeColor =
        (userInfo.UserInfo.EMP_Color && {
          '@primary-color': userInfo.UserInfo.EMP_Color
        }) ||
        window.themeColor;
      this.setThemeColor(themeColor);
    }
  };

  setThemeColor = themeColor => {
    setTimeout(() => {
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
    }, 500);
  };

  retrieveReminderNum = async () => {
    let res;
    try {
      res = await retrieveReminderNum();
    } catch (err) {
      return message.error(err.message);
    }
    this.setState({ reminderNum: res.data });
  };

  unloadCallback = () => {
    localStorage.removeItem('userInfo');
  };

  handleMashShow = () => {
    window.addEventListener('unload', this.unloadCallback);
  };

  handlePassChange = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = async () => {
    const { password } = this.state;
    let res;
    // 普通方式登录
    if (defaultLoginMode === 'normal') {
      try {
        res = await defaultLogin(this.userCode, password);
      } catch (err) {
        return message.error(err.message);
      }

      // 域登录
    } else {
      const domain = domainLoginConfig.domain;
      const usernameSuffix = domainLoginConfig.usernameSuffix;
      const domainUserField = domainLoginConfig.domainUserField;
      try {
        res = await domainLogin(
          this.userCode + usernameSuffix,
          password,
          domain,
          domainUserField
        );
      } catch (err) {
        return message.error(err.message);
      }
    }
    if (res.OpResult === 'N') {
      return message.error('密码输入错误');
    }
    localStorage.setItem('userInfo', JSON.stringify(res));
    this.lockScreenRef.current.removeLockScreen();
    this.setState({ password: '' });
    window.removeEventListener('unload', this.unloadCallback);
  };

  render() {
    const { reminderNum, password } = this.state;
    const user = JSON.parse(getItem('userInfo'));
    const userData = {
      userName: user.SysUserInfo.UserName
    };
    const searchBox = <SearchBox placeholder="" />;
    const userInfo = (
      <UserInfo userName={userData.userName} userRank={userData.userRank} />
    );

    let username;
    if (user) {
      this.userCode = user.UserCode;
      username = user.Data;
    }
    return (
      <React.Fragment>
        {username && (
          <LockScreen
            className="app-lock-screen-wrap"
            time={window.lockScreenWaitTime}
            maskShow={this.handleMashShow}
            ref={this.lockScreenRef}
          >
            <div className="app-lock-screen">
              <div className="app-lock-screen__logo">
                <span className="app-lock-screen__logo-bg" />
                <span className="iconfont icon-lock-logo" />
              </div>
              <div className="app-lock-screen__username">{username}</div>

              <div className="app-lock-screen__input">
                <Input
                  id="pass"
                  name="pass"
                  type="password"
                  value={password}
                  onChange={this.handlePassChange}
                  placeholder="请输入密码"
                  style={{ width: 200, marginRight: 10 }}
                  autoComplete="new-password"
                  onPressEnter={this.handleSubmit}
                />

                <Button
                  type="primary"
                  shape="circle"
                  className="app-lock-screen__submit"
                  onClick={this.handleSubmit}
                >
                  <Icon type="login" theme="outlined" />
                </Button>
              </div>
            </div>
          </LockScreen>
        )}
        <PageHeader
          searchBox={searchBox}
          title={userInfo}
          reminderNum={reminderNum}
          lockScreenRef={this.lockScreenRef}
        />
        <Route path="/" exact component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/fnmodule/:ids" component={FnModule} />
        {/* <Route path="/fnmodule/:ids" key={keyIndex++} component={FnModule} /> */}
        <Route path="/workbench-setting" component={WorkbenchSetting} />
        <Route path="/reminder" component={Reminder} />
        <Route path="/report-table" component={ReportTable} />
        <Route path="/person-center" component={PersonCenter} />
        <Route
          path="/task-notice/:taskCatalog/:taskType"
          component={TaskNotice}
        />
      </React.Fragment>
    );
  }
}
