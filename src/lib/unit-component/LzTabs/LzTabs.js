import React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

import {
  LzTableChart,
  LzCards,
  LzForm,
  LzSelectRecords
} from '../../../loadableComponents';

import LzTable from '../LzTable';
import './LzTabs.less';
const TabPane = Tabs.TabPane;
/**
 * tabs 组件
 */
export default class LzTabs extends React.Component {
  static propTypes = {
    /**
     * tabPanes 数组
     * 默认值：[]
     */
    tabPanes: PropTypes.array
    //  例如：
    //  [
    //    {
    //      tabName: '表格1', // 标题
    //      componentInfo: { // or componentProps
    //        name: 'LzTable', // 组件名称
    //        props: { // 组件接受的 props
    //          resid: xxx
    //        }
    //      }
    //    }
    //  ]
  };

  static defaultProps = {
    tabPanes: []
  };

  constructor() {
    super();
  }

  componentWillReceiveProps = nextProps => {
    this.Props = nextProps;
  };

  getComponent = (componentInfo, tabName) => {
    const { tabPanes, style, onChange, ...restProps } = this.props;

    switch (componentInfo.name) {
      case 'LzTable': {
        return <LzTable ref={tabName} {...componentInfo.props} />;
      }
      case 'LzForm': {
        return <LzForm {...componentInfo.props} />;
      }
      case 'LzTableChart': {
        return <LzTableChart {...componentInfo.props} />;
      }
      case 'LzCards': {
        return <LzCards {...componentInfo.props} />;
      }
      case 'LzSelectRecords': {
        return <LzSelectRecords {...componentInfo.props} {...restProps} />;
      }
      default: {
        return (
          <div>
            LzTabs 配置信息有误，没有名为 “{componentInfo.name}” 的组件！
          </div>
        );
      }
    }
  };

  handleChange = activeKey => {
    const { onChange } = this.props;
    onChange && onChange(activeKey);
  };

  render() {
    const { tabPanes, style, onChange, ...restProps } = this.props;
    // console.log('render~ ~ ~');
    return (
      <Tabs
        onChange={this.handleChange}
        className="lz-tabs"
        {...(style ? { style } : {})}
        {...restProps}
      >
        {tabPanes.map(item => (
          <TabPane tab={item.tabName} key={item.tabName}>
            {this.getComponent(
              item.componentInfo || item.componentProps,
              item.tabName
            )}
          </TabPane>
        ))}
      </Tabs>
    );
  }
}
