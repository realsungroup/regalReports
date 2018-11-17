import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { PrivateRoute } from './util/auth';
import { IntlProvider, addLocaleData, FormattedMessage } from 'react-intl';

import { message, Tag, Icon, LocaleProvider } from 'antd';

import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import zh_CN from './lib/locales/zh-CN';
import en_US from './lib/locales/en-US';

import { getItem } from './util/localCache';

import { CheckIn } from './loadableComponents';

import NonsupportIE from 'nonsupport-ie-react';

// antd 组件国际化
import zh_CN_antd from 'antd/lib/locale-provider/zh_CN';
import en_US_antd from 'antd/lib/locale-provider/en_US';
import 'moment/locale/zh-cn';

import { NotFound } from './loadableComponents';

addLocaleData([...en, ...zh]);

const Reminder = (
  <div className="app__nonuse-ie">
    本应用不支持
    <div className="app__nonuse-tag">
      <Icon type="ie" theme="outlined" />
      <span>IE 浏览器</span>
    </div>
    ， 请使用
    <div className="app__nonuse-tag">
      <a href="https://www.google.cn/chrome/" target="_blank">
        <Icon type="chrome" theme="outlined" />
        <span>谷歌浏览器</span>
      </a>
    </div>
    或
    <div className="app__nonuse-tag">
      <a href="http://www.firefox.com.cn/" target="_blank">
        <Icon type="fire" theme="outlined" />
        <span>火狐浏览器</span>
      </a>
    </div>
    打开
  </div>
);

class App extends Component {
  render() {
    // 国际化
    let userInfo,
      language = '中文';
    try {
      userInfo = JSON.parse(getItem('userInfo'));
      language = userInfo.UserInfo.EMP_LANGUAGE;
    } catch (err) {}

    let localeAntd = zh_CN_antd;
    if (language === 'English') {
      localeAntd = en_US_antd;
    }

    let locale, messages;
    if (language === 'en') {
      locale = 'en';
      messages = en_US;
    } else {
      locale = 'zh';
      messages = zh_CN;
    }
    console.log('userInfo');
    return (
      <NonsupportIE reminder={Reminder}>
        <LocaleProvider locale={localeAntd}>
          <IntlProvider locale={locale} messages={messages}>
            <Router>
              <Switch>
                <PrivateRoute
                  exact
                  path="/:resid/:accessToken/:userCode/:theme/:name"
                  component={CheckIn}
                />
              </Switch>
            </Router>
          </IntlProvider>
        </LocaleProvider>
      </NonsupportIE>
    );
  }
}

export default App;
