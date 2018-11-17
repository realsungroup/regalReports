import React from 'react';
import { Tabs, message } from 'antd';
import './LzTabsDataDashboard.less';
import PropTypes from 'prop-types';

import LzDataDashboard from '../LzDataDashboard';
import { getDataDashboardData } from 'Util/api';
const TabPane = Tabs.TabPane;

/**
 * 标签页形式的数据看板
 */
export default class LzTabsDataDashboard extends React.Component {
  static propTypes = {
    boardType: PropTypes.string
  };
  constructor(props) {
    super(props);

    this.state = {
      tabsData: []
    };
  }

  componentDidMount = () => {
    this.getData();
  };

  getData = async () => {
    const { boardType } = this.props;
    let res;
    try {
      res = await getDataDashboardData(boardType);
    } catch (err) {
      message.error(err.message);
    }
    const tabsData = res.data;
    this.setState({ tabsData });
  };

  render() {
    const { tabsData } = this.state;
    let defaultActiveKey = '';
    if (tabsData.length) {
      defaultActiveKey = tabsData[0].C3_593704595986;
    }
    return (
      <div className="lz-tabs-data-dashboard">
        <Tabs defaultActiveKey={defaultActiveKey}>
          {tabsData.map((tab, index) => {
            const props = JSON.parse(tab.C3_593704922370);
            return (
              <TabPane tab={tab.C3_593704595986} key={tab.C3_593704595986}>
                <LzDataDashboard
                  cardsResid={parseInt(tab.C3_593692761000, 10)}
                  tableResid={parseInt(tab.C3_593692763202, 10)}
                  index={index}
                  {...props}
                />
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}
