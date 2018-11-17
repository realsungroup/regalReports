import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { message, Tabs } from 'antd';
import './LzAFFO.less';
import classNames from 'classnames';
import LzTable from '../../../lib/unit-component/LzTable';
import EventEmitter from 'wolfy87-eventemitter';

import {
  inApplication,
  applyForAbnormal,
  approved,
  refused,
  history
} from './config';

const TabPane = Tabs.TabPane;

/**
 * 加班申请
 */
export default class LzAFFO extends React.Component {
  static propTypes = {};

  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {
      abnormalNum: 0,
      activeKey: '申请中'
    };
    this.abnormalRef = React.createRef();
    this.inApplicationRef = React.createRef();
  }

  componentDidMount = () => {
    window.lzCustomEvent.ee = new EventEmitter();
    // 监听 批量添加完成
    window.lzCustomEvent.ee.addListener('batchAdd', this.retHandleBatchAdd());
  };

  componentWillUnmount = () => {
    window.lzCustomEvent.ee.removeListener('batchAdd', this.handleBatchAdd);
  };

  retHandleBatchAdd = () => {
    const that = this;
    this.handleBatchAdd = function handleBatchAdd(
      normalRecords,
      abnormalRecords
    ) {
      let activeKey = '申请异常';

      if (!abnormalRecords.length) {
        activeKey = '申请中';
      }
      if (normalRecords.length) {
        that.inApplicationRef.current.refreshTableData(true);
      }
      if (abnormalRecords.length) {
        that.abnormalRef.current.refreshTableData(true);
      }
      that.setState({ activeKey });
    };
    return this.handleBatchAdd;
  };

  getTableData = (tableData, total) => {
    this.setState({ abnormalNum: total });
  };

  handleTabsChange = activeKey => {
    this.setState({ activeKey });
  };

  render() {
    const { activeKey, abnormalNum } = this.state;
    return (
      <div className="lz-affo">
        <Tabs
          activeKey={activeKey}
          renderTabBar={this.renderTabBar}
          onChange={this.handleTabsChange}
        >
          <TabPane tab="申请中" key="申请中">
            <LzTable
              {...inApplication}
              // https://github.com/react-component/form#note-use-wrappedcomponentref-instead-of-withref-after-rc-form140
              // wrappedComponentRef={form => (this.inApplicationRef = form)}
              ref={this.inApplicationRef}
            />
          </TabPane>
          <TabPane tab="申请异常" key="申请异常" forceRender={true}>
            <LzTable
              {...applyForAbnormal}
              getTableData={this.getTableData}
              // https://github.com/react-component/form#note-use-wrappedcomponentref-instead-of-withref-after-rc-form140
              // wrappedComponentRef={form => (this.abnormalRef = form)}
              ref={this.abnormalRef}
            />
          </TabPane>
          <TabPane tab="已审核" key="已审核">
            <LzTable {...approved} />
          </TabPane>
          <TabPane tab="已拒绝" key="已拒绝">
            <LzTable {...refused} />
          </TabPane>
          <TabPane tab="历史记录" key="历史记录">
            <LzTable {...history} />
          </TabPane>
        </Tabs>
        {!!abnormalNum && (
          <div className="lz-affo__abnormal-num">{abnormalNum}</div>
        )}
      </div>
    );
  }
}
