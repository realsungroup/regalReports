import React, { Fragment } from 'react';
import { Modal, Input, message } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './LzList.less';
import { List, Avatar } from 'antd';
import { getMainTableData, getSubTableData } from 'Util/api';
const Search = Input.Search;

/**
 * 列表
 */
export default class LzList extends React.Component {
  static propTypes = {
    // 当本组件不请求数据时：
    // =================
    /**
     * 列表数据
     * 默认：[]
     */
    listData: PropTypes.array,

    // 当组件请求数据时：
    // ==============
    /**
     * 数据模式
     * 可选：'main' 主表 | 'sub' 子表
     * 默认：'main'
     */
    dataMode: PropTypes.oneOf(['main', 'sub']),

    /**
     * 主表 id
     */
    resid: PropTypes.number,

    /**
     * 子表 id
     */
    subresid: PropTypes.number,

    /**
     * 记录 id
     */
    hostrecid: PropTypes.number,

    /**
     * 头像内部字段
     */
    avatarFieldName: PropTypes.string,

    /**
     * 列表项 title 内部字段名
     */
    titleFieldName: PropTypes.string,

    /**
     * 列表项 description 内部字段名
     */
    descFieldName: PropTypes.string,

    // 公共的
    // =================
    /**
     * 是否有搜索栏
     * 默认：true
     */
    hasSearch: PropTypes.bool,

    /**
     * 返回内容的函数
     * 默认：(item) => {}
     */
    content: PropTypes.func,

    /**
     * 返回内容的函数
     * 默认：(listData) => {}
     */
    header: PropTypes.func
  };

  static defaultProps = {
    listData: [],
    content: () => {},
    header: () => {},
    hasSearch: true
  };

  constructor(props) {
    super(props);
    this.state = {
      listData: []
    };
  }

  async componentDidMount() {
    // 有 resid，则在本组件中获取数据
    if (!this.props.resid) {
      return;
    }
    const { dataMode, resid, subresid, hostrecid } = this.props;
    let res;
    if (dataMode === 'main') {
      try {
        res = await getMainTableData(resid);
      } catch (err) {
        message.error(err.message);
      }
    } else {
      try {
        res = await getSubTableData(resid, subresid, hostrecid);
      } catch (err) {
        message.error(err.message);
      }
    }
    const { titleFieldName, descFieldName, avatarFieldName } = this.props;
    res.data.forEach(item => {
      item.title = item[titleFieldName];
      item.descripation = item[descFieldName];
      item.avatar = item[avatarFieldName];
    });
    this.setState({ listData: res.data });
  }

  render() {
    const { header, content, onSearch, hasSearch } = this.props;
    let data = this.props.listData;
    if (this.props.resid) {
      data = this.state.listData;
    }
    return (
      <List
        className="lz-list"
        itemLayout="horizontal"
        header={
          <div className="lz-list__header">
            {hasSearch && (
              <Search
                placeholder="搜索"
                onSearch={onSearch}
                className="lz-list__search"
              />
            )}
            <div className="lz-list__header-other">{header(data)}</div>
          </div>
        }
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              {...(item.avatar
                ? { avatar: <Avatar src={item.avatar} /> }
                : null)}
              {...(item.title ? { title: <span>{item.title}</span> } : null)}
              {...(item.description ? { title: item.description } : null)}
            />
            {content(item)}
          </List.Item>
        )}
      />
    );
  }
}
