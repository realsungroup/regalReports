import React, { Fragment } from 'react';
import { Tree } from 'antd';
const TreeNode = Tree.TreeNode;

/**
 * 显示部门数据的树组件
 */
export default class DepartmentTree extends React.Component {
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
    const { onSelect, nodesData } = this.props;
    return (
      <Fragment>
        {!!nodesData.length && (
          <Tree defaultExpandAll={true} onSelect={onSelect}>
            {this.renderTreeNodes(nodesData)}
          </Tree>
        )}
      </Fragment>
    );
  }
}
