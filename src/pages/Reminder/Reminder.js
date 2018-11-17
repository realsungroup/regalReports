import React from 'react';

import './Reminder.less';
import { Tabs, message, Button, Spin, Popconfirm, Tag } from 'antd';
import { retrieveDataOfHasReminder } from 'Util/api';
import { LzTable, LzUnitComponentContainer } from '../../loadableComponents';
const TabPane = Tabs.TabPane;

export default class Reminder extends React.Component {
  constructor() {
    super();
    this.state = {
      tabsData: [],
      activeKey: ''
    };
  }

  componentDidMount() {
    this.retrieveDataOfHasReminder();
  }

  retrieveDataOfHasReminder = async () => {
    let res;
    try {
      res = await retrieveDataOfHasReminder();
    } catch (err) {
      return message.error(err.message);
    }
    const tabsData = this.dealData(res.data);
    let activeKey = '';
    if (tabsData.length) {
      activeKey = tabsData[0].title;
    }
    this.setState({ tabsData, activeKey });
  };

  dealData = arr => {
    const tabsData = [];
    arr.forEach(item =>
      tabsData.push({
        title: item.REMINDER_TITLE,
        resid: parseInt(item.REMINDER_RESID, 10),
        mtsid: parseInt(item.REMINDER_MTSID, 10),
        taskNum: item.REMINDER_TASKNUM
      })
    );
    return tabsData;
  };

  handleTabsChange = activeKey => {
    this.setState({ activeKey });
  };

  handleRefreshClick = async () => {
    await this.retrieveDataOfHasReminder();
    message.success('刷新成功');
  };

  back = () => {
    this.props.history.goBack();
  };

  renderContent = () => {
    const { tabsData, activeKey } = this.state;
    return (
      <div className="reminder__content">
        <div className="reminder__content-header">
          <div className="reminder__content-header-left">
            <i
              className="iconfont icon-refresh"
              onClick={this.handleRefreshClick}
            />
          </div>
        </div>
        <Tabs
          tabPosition="left"
          className="reminder__tabs"
          type="card"
          tabBarStyle={{ width: '20%', marginTop: 10 }}
          activeKey={activeKey}
          onChange={this.handleTabsChange}
        >
          {!!tabsData.length &&
            tabsData.map(paneData => {
              return (
                <TabPane
                  tab={
                    <div>
                      <span className="reminder__tab-title">
                        {paneData.title}
                      </span>
                      <span className="reminder__task-num">
                        {paneData.taskNum}
                      </span>
                    </div>
                  }
                  key={paneData.title}
                >
                  <LzTable
                    willReceiveProps
                    tableTitle={paneData.title}
                    resid={paneData.resid}
                    mtsid={paneData.mtsid}
                    isBackEndBtnsVisible={true}
                    opIsFixed={true}
                  />
                </TabPane>
              );
            })}
        </Tabs>
      </div>
    );
  };

  render() {
    return (
      <div className="unit-one reminder">
        <div className="unit-one-header">
          <i className="back-btn iconfont icon-back" onClick={this.back} />
          <span className="header-title">提醒</span>
        </div>
        <LzUnitComponentContainer
          style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            width: '90%',
            // height: '80%',
            overflow: 'auto',
            transform: 'translateX(-50%)'
          }}
        >
          {this.renderContent()}
        </LzUnitComponentContainer>
      </div>
    );
  }
}
