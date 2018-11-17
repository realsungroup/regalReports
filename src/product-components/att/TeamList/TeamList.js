import React, { Fragment } from 'react';
import { Tree, message, List } from 'antd';
import PropTypes from 'prop-types';
import { getMainTableData } from 'Util/api';
import classNames from 'classnames';
import './TeamList.less';
const TreeNode = Tree.TreeNode;

/**
 * 班组列表组件
 */
export default class TeamList extends React.Component {
  render() {
    const { data, onSelect } = this.props;
    return (
      <List
        className="team-list"
        dataSource={data}
        header={<div>班组列表</div>}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta style={{ marginLeft: 10 }} title={item.title} />
            <a
              style={{ marginRight: 10 }}
              href="javascript:;"
              onClick={() => onSelect(item, index)}
            >
              选择
            </a>
          </List.Item>
        )}
      />
    );
  }
}
