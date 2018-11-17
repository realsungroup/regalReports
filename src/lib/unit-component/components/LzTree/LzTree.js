import React, { Fragment } from 'react';
import { Tree, message } from 'antd';
import PropTypes from 'prop-types';
import { getMainTableData } from 'Util/api';
import classNames from 'classnames';
const TreeNode = Tree.TreeNode;

/**
 * 树组件
 */
export default class LzTree extends React.Component {
  static propTypes = {
    /**
     * 节点数据
     * 默认：[]
     */
    nodesData: PropTypes.array,

    /**
     * 点击树节点触发
     * 默认：(selectedKeys, e) => {}
     */
    onSelect: PropTypes.func
  };

  static defaultProps = {
    nodesData: []
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSelect = (selectedKeys, e) => {
    this.props.onSelect(selectedKeys, e);
  };

  renderTreeNodes = nodesData => {
    return nodesData.map(nodeData => {
      if (nodeData.childNodes) {
        return (
          <TreeNode title={nodeData.title} key={nodeData.REC_ID}>
            {this.renderTreeNodes(nodeData.childNodes)}
          </TreeNode>
        );
      }
      return <TreeNode title={nodeData.title} key={nodeData.REC_ID} />;
    });
  };

  render() {
    return (
      <Tree onSelect={this.props.onSelect}>
        {this.renderTreeNodes(this.props.nodesData)}
      </Tree>
    );
  }
}
