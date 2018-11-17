import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import { LzTableFilter, LzTabs } from '../../../loadableComponents';
import cloneDeep from 'lodash.clonedeep';

import './LzTabsTableFilter.less';
const matchStyle = { position: 'static', left: 0, transform: '(0, 0)' };

/**
 * 标签页表格 + 顶部筛选
 */
export default class LzTabsTable extends React.Component {
  static propTypes = {
    /**
     * 表格组件s所接受的 props
     * 例如：
     * [
     *   {
     *     tabName: '人口信息学',
     *     filterFields: [
     *       {
     *         iconClass: 'icon-wdkq_icon', // 字体图标 class
     *         title: '人口信息学', // 标题
     *         innerFiledName: 'c3_1', // 内部字段名
     *         defaultValue: '201806', // 默认值
     *         options: [
     *         // 选项
     *           {
     *             label: '201806',
     *             value: '201806'
     *           },
     *           {
     *             label: '201807',
     *             value: '201807'
     *           }
     *         ]
     *       }
     *     ],
     *     componentInfo: {
     *       name: 'LzTable',
     *       props: {
     *         resid: 588426948996
     *       }
     *     }
     *   }
     * ]
     */
    tableProps: PropTypes.array
  };
  static defaultProps = {
    tableProps: []
  };
  constructor(props) {
    super(props);
    const tableProps = cloneDeep(this.props.tableProps);
    this.state = {
      activeKey: '',
      tableProps,
      filterStyle: {},
      tabsTableStyle: {}
    };
  }
  isExpand = true; // 是否展开

  componentDidMount() {
    let activeKey = '';
    const { tableProps } = this.props;
    if (tableProps.length) {
      activeKey = tableProps[0].tabName;
    }
    this.setState({ activeKey, tableProps });
  }

  handleChange = (cmswhere, tabName) => {
    console.log('cmswhere:', cmswhere);
    if (this.state.activeKey === tabName) {
      const { tableProps } = this.state;
      tableProps.forEach(tableProp => {
        if (cmswhere && tableProp.tabName === tabName) {
          tableProp.componentInfo.props.cmswhere = cmswhere;
        }
      });
      this.setState({ tableProps });
    }
  };

  tabChange = activeKey => {
    this.setState({ activeKey });
  };

  styleChange = isExpand => {};

  dealExpand = () => {
    let filterStyle, tabsTableStyle;
    if (this.isExpand) {
      filterStyle = {
        transform: 'translateY(-94px)'
      };
      tabsTableStyle = {
        transform: 'translateY(-94px)'
      };
    } else {
      filterStyle = {
        transform: 'translateY(0)'
      };
      tabsTableStyle = {
        transform: 'translateY(0)'
      };
    }
    this.isExpand = !this.isExpand;

    this.setState({ filterStyle, tabsTableStyle });
  };

  render() {
    // const tableProps = cloneDeep(this.props.tableProps);
    const { activeKey, tableProps, filterStyle, tabsTableStyle } = this.state;
    tableProps.forEach(tableProp => {
      tableProp.componentInfo.props.style = {
        ...matchStyle,
        boxShadow: 'none'
      };
      tableProp.componentInfo.props.hasScaleBtn = false;
    });

    return (
      <div className="lz-tabs-table">
        <div className="lz-table-filter-wrap" {...{ style: filterStyle }}>
          {tableProps.map(tableProp => {
            return (
              <LzTableFilter
                key={tableProp.tabName}
                startGetCmswhere={activeKey === tableProp.tabName}
                style={{
                  display: activeKey === tableProp.tabName ? 'flex' : 'none'
                }}
                filterFields={tableProp.filterFields}
                onChange={cmswhere => {
                  this.handleChange(cmswhere, tableProp.tabName);
                }}
              />
            );
          })}
          <i className="iconfont icon-expand-h" onClick={this.dealExpand} />
        </div>
        <LzTabs
          style={{
            marginTop: 20,
            padding: '10px 20px',
            boxShadow: '6px 6px 10px 0px rgba(0, 0, 0, 0.3)',
            transition: '0.2s',
            ...tabsTableStyle
          }}
          tabPanes={tableProps}
          animated={false}
          onChange={this.tabChange}
        />
      </div>
    );
  }
}
