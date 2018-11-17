import React from 'react';

import './ReportTable.less';
import { Tree, message, Button, Spin, Popconfirm, Tag } from 'antd';
import { getRptGroups, getReportList } from 'Util/api';
import { LzTable, LzUnitComponentContainer } from '../../loadableComponents';
const TreeNode = Tree.TreeNode;

export default class ReportTable extends React.Component {
  constructor() {
    super();
    this.state = {
      treeData: [],
      selectedNode: {},
      accessToken: JSON.parse(localStorage.getItem('userInfo')).AccessToken
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    let res;
    try {
      res = await getRptGroups();
    } catch (err) {
      return message.error(err.message);
    }
    res.data.forEach(item => {
      item.title = item.RPTST_NAME;
      item.key = item.RPTST_NAME;
      item.hasChildren = true;
    });
    this.setState({ treeData: res.data });
  };

  onLoadData = async treeNode => {
    if (!treeNode.props.hasChildren) {
      return;
    }
    const id = treeNode.props.RPTST_ID;
    let res;
    try {
      res = await getReportList(id);
    } catch (err) {
      return message.error(err.message);
    }
    res.data.forEach(item => {
      item.title = item.RPTLIST_NAME;
      item.key = item.RPTLIST_NAME;
      item.url = item.RPTLIST_URL;
    });
    treeNode.props.dataRef.children = res.data;
    this.setState({ treeData: [...this.state.treeData] });
  };

  handleTreeNodeSelect = (selectedKeys, e) => {
    // 未选中
    if (!selectedKeys.length) {
      return;
    }
    // 非叶子节点
    if (e.node.props.hasChildren) {
      return;
    }
    this.setState({ selectedNode: { ...e.node.props } });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} isLeaf={!item.hasChildren} />;
    });
  };

  renderContent = () => {
    const { selectedNode, accessToken } = this.state;
    return (
      <div className="report-table__content">
        <div className="report-table__tree">
          <Tree loadData={this.onLoadData} onSelect={this.handleTreeNodeSelect}>
            {this.renderTreeNodes(this.state.treeData)}
          </Tree>
        </div>
        <div className="report-table__iframe">
          {selectedNode.url ? (
            <iframe
              src={selectedNode.url + '?accessToken=' + accessToken}
              frameBorder="1"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2>请选择报表</h2>
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="unit-one report-table">
        <div className="unit-one-header">
          <i className="back-btn iconfont icon-back" onClick={this.back} />
          <span className="header-title">报表</span>
        </div>
        <LzUnitComponentContainer
          scaleStatus="max"
          style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            width: '90%',
            // height: '80%',
            overflow: 'auto',
            transform: 'translateX(-50%)'
          }}
        >
          {this.renderContent()}
        </LzUnitComponentContainer>
      </div>
    );
  }
}
