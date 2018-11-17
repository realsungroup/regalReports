import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, message, Spin, List } from 'antd';
import './LzTCList.less';
import classNames from 'classnames';

/**
 * 班组/班次 列表组件
 */
export default class LzTCList extends React.Component {
  static propTypes = {
    /**
     * 标题
     */
    title: PropTypes.string.isRequired,

    /**
     * 数据
     * 默认：[]
     */
    data: PropTypes.array,

    /**
     * 标题内部字段名
     */
    titleFieldName: PropTypes.string.isRequired,

    /**
     * 切换到某页的回调函数
     */
    pageChange: PropTypes.func.isRequired,

    /**
     * 分页配置
     */
    pagination: PropTypes.object.isRequired,

    /**
     * 头部额外的 jsx
     */
    headerExtra: PropTypes.node
  };

  static defaultProps = {
    data: []
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      title,
      titleFieldName,
      data,
      renderExtra,
      pagination,
      headerExtra
    } = this.props;
    return (
      <div className="lz-tc-list">
        <div className="lz-tc-list__header">
          <h2 className="lz-tc-list__title">{title}</h2>
          {headerExtra && (
            <div className="lz-tc-list__header-extra">{headerExtra}</div>
          )}
        </div>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span style={{ fontSize: 18 }}>{item[titleFieldName]}</span>
                }
              />
              {renderExtra && renderExtra(item)}
            </List.Item>
          )}
          pagination={pagination}
        />
      </div>
    );
  }
}
