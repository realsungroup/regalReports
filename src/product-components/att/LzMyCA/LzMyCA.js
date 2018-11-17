import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon, Avatar, Tabs, DatePicker } from 'antd';
import './LzMyCA.less';
import { LzTable, LzTabs } from '../../../loadableComponents';
import moment from 'moment';
import MonthReport from './MonthReport';
import CurMonSchedule from './CurMonSchedule';
import tabsProps from './config';
const { MonthPicker } = DatePicker;
const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;

/**
 * 我的考勤
 */
export default class LzMyCA extends React.Component {
  static propTypes = {
    /**
     * 用户记录
     */
    record: PropTypes.object.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      selectedKey: '1',
      selectedMonth: moment(),
      mRRecord: {} // 月报记录
    };
  }

  componentDidMount() {}

  handleTabsClick = () => {};

  renderContent = () => {
    switch (this.state.selectedKey) {
      case '1': {
        const { resid, subresid, record } = this.props;
        const { selectedMonth } = this.state;
        const lzTableProps = {
          dataMode: 'sub',
          resid: resid,
          subresid: subresid,
          hostrecid: record.REC_ID,
          cmswhere: `YEARMONTH = ${selectedMonth.format('YYYYMM')}`,
          btnsVisible: {
            check: true
          },
          isSearch: false,
          tableSize: 'small'
        };
        const cmswhere = `YEARMONTH = ${selectedMonth.format(
          'YYYYMM'
        )} and PNID = ${record.PNID}`;
        return (
          <Tabs
            defaultActiveKey="1"
            className="lz-myca__tabs"
            onClick={this.handleTabsClick}
          >
            <TabPane tab="当月排班" key="1">
              <CurMonSchedule pnid={record.PNID} curMonth={selectedMonth} />
            </TabPane>
            <TabPane tab="考勤日报" key="2">
              <LzTable {...lzTableProps} />
            </TabPane>
            <TabPane tab="考勤月报" key="3">
              <MonthReport cmswhere={cmswhere} />
            </TabPane>
          </Tabs>
        );
      }
      case '2': {
        tabsProps.tabPanes.forEach(item => {
          item.componentInfo.props.hostrecid = this.props.record.REC_ID;
          // item.componentInfo.props.cmswhere = `YEARMONTH = ${this.state.selectedMonth.format(
          //   'YYYYMM'
          // )}`;
        });
        return (
          <div>
            <LzTabs {...tabsProps} />
          </div>
        );
      }
      case '3': {
        const props = {
          resid: 593695678218,
          pagination: {
            current: 0,
            pageSize: 10
          },
          addBtn: true
        };
        return (
          <div>
            <LzTable {...props} />
          </div>
        );
      }
      case '4': {
        const props = {
          resid: 593696007689,
          pagination: {
            current: 0,
            pageSize: 10
          },
          addBtn: true,
          btnsVisible: {
            edit: false,
            save: false,
            cancel: false,
            check: false,
            check: false,
            del: true
          },
          opIsFixed: true
        };
        return <LzTable {...props} />;
      }
    }
  };

  handleMenuItemChange = ({ key }) => {
    console.log('key:', key);

    this.setState({ selectedKey: key });
  };

  handleMonthChange = date => {
    if (date) {
      this.setState({ selectedMonth: date });
    }
  };

  render() {
    const { record } = this.props;
    const { selectedMonth } = this.state;
    return (
      <div className="lz-myca">
        <Layout style={{ width: '100%', height: '100%' }}>
          <Sider width={260}>
            <div className="lz-myca__userinfo">
              <Avatar className="lz-myca__avatar" icon="user" size={120} />
              <div className="lz-myca__name">{record.YGNAMES}</div>

              <div className="lz-myca__select-month">
                <MonthPicker
                  value={selectedMonth}
                  onChange={this.handleMonthChange}
                  className="lz-myca__month-picker"
                />
              </div>
            </div>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              onClick={this.handleMenuItemChange}
            >
              <Menu.Item key="1">
                <Icon type="user" />
                <span className="nav-text">个人查询</span>
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="video-camera" />
                <span className="nav-text">个人调整</span>
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="video-camera" />
                <span className="nav-text">年假管理</span>
              </Menu.Item>
              <Menu.Item key="4">
                <Icon type="video-camera" />
                <span className="nav-text">调休登记</span>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content>
            <div className="lz-myca__content">{this.renderContent(1)}</div>
          </Content>
        </Layout>
      </div>
    );
  }
}
