import React from 'react';
import Panel from '../../../components/Panel';
import AppSelector from './AppSelector';
import {
  getAllAppLinks,
  removeFns,
  addWorkbenchApps
} from '../../../../util/api';
import SelectedApp from './SelectedApp';
import { Modal, Button, Tree, message, Spin } from 'antd';

import './OptionalApps.less';
import { clone } from '../../../../lib/util/util';
const TreeNode = Tree.TreeNode;

export default class OptionalApps extends React.Component {
  state = {
    modalVisible: false,
    spinning: false,

    fnTreeData: [], // 功能树数据
    fnList: [], // 功能列表
    expandedKeys: [], // 展开的节点的 key
    autoExpandParent: true,
    checkedKeys: [], // 已选中的节点的 key
    selectedKeys: []
  };

  onClose = () => {
    this.setState({ modalVisible: false });
    this.addFnList = [];
    this.removeFnList = [];
  };

  onExpand = expandedKeys => {
    console.log('onExpand', expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  };

  onCheck = async (checkedKeys, e) => {
    console.log('e:', e);
    let res;

    const isParentNode = e.node.props.dataRef.isParentNode;

    // 添加或删除多个
    if (isParentNode) {
      const checkedNodes = e.checkedNodes.filter(
        node => !node.props.dataRef.isParentNode
      );
      if (e.checked) {
        // 添加多个
        e.node.props.children.forEach(item => {
          const name = item.props.dataRef.RES_NAME;
          !this.selectedFnList.some(fn => fn.RES_NAME === name) &&
            this.addFnList.push(item.props.dataRef);
          this.removeFnList.some((fn, index, arr) => {
            if (fn.RES_NAME === name) {
              arr.splice(index, 1);
            }
          });
        });
      } else {
        // 删除多个
        e.node.props.children.forEach(item => {
          const name = item.props.dataRef.RES_NAME;
          this.selectedFnList.some(fn => fn.RES_NAME === name) &&
            !this.removeFnList.some(fn => fn.RES_NAME === name) &&
            this.removeFnList.push(item.props.dataRef);
          this.addFnList.some((fn, index, arr) => {
            if (fn.RES_NAME === name) {
              arr.splice(index, 1);
            }
          });
        });
      }
    } else {
      const name = e.node.props.dataRef.RES_NAME;

      if (e.checked) {
        if (this.selectedFnList.some(fn => fn.RES_NAME === name)) {
          this.removeFnList.some((fn, index, arr) => {
            if (fn.RES_NAME === name) {
              arr.splice(index, 1);
            }
          });
        } else {
          !this.addFnList.some(fn => fn.RES_NAME === name) &&
            this.addFnList.push(e.node.props.dataRef);
        }
      } else {
        if (this.selectedFnList.some(fn => fn.RES_NAME === name)) {
          if (!this.removeFnList.some(fn => fn.RES_NAME === name)) {
            this.removeFnList.push(e.node.props.dataRef);
          }
        } else {
          this.addFnList.some((fn, index, arr) => {
            if (fn.RES_NAME === name) {
              arr.splice(index, 1);
            }
          });
        }
      }
    }

    console.log('this.addFnList:', this.addFnList);
    console.log('this.removeFnList:', this.removeFnList);

    // 添加
    // if (e.checked) {
    //   res = await this.addApp(e);
    //   // 删除
    // } else {
    //   res = await this.delApp(e);
    // }
    this.setState({ checkedKeys });
  };

  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  };

  renderTreeNodes = fnTreeData => {
    return fnTreeData.map(item => {
      if (item.AppLinks) {
        return (
          <TreeNode
            selectable={false}
            title={item.title}
            key={item.key}
            dataRef={item}
          >
            {this.renderTreeNodes(item.AppLinks)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} dataRef={item} />;
    });
  };

  openModal = () => {
    this.setState({ modalVisible: true, spinning: true });
    this.getAllAppLinks();
  };

  selectedFnList = []; // 已添加的功能列表
  addFnList = []; // 将要添加的功能列表
  removeFnList = []; // 将要移除的功能列表

  dealFnTreeData = fnTreeData => {
    const expandedKeys = [],
      checkedKeys = [],
      selectedFnList = [];
    const { selectedApps } = this.props;
    fnTreeData.forEach(item => {
      item.title = item.resname;
      item.key = item.resid;
      expandedKeys.push(item.key + '');
      item.isParentNode = true;
      item.AppLinks.forEach(app => {
        app.title = app.RES_NAME;
        app.key = app.RES_PID + '_' + app.RES_ID;
        app.isParentNode = false;
        if (
          selectedApps.some(item => {
            if (item.name === app.RES_NAME) {
              return (app.recid = item.REC_ID);
            }
          })
        ) {
          checkedKeys.push(app.key);
          selectedFnList.push(clone(app));
        }
      });
    });

    return { expandedKeys, fnTreeData, checkedKeys, selectedFnList };
  };

  getAllAppLinks = async () => {
    const residStr = window.businessOptionalResIds.join(',');
    let res;
    try {
      res = await getAllAppLinks(residStr);
    } catch (err) {
      return message.error(err.message);
    }
    const {
      expandedKeys,
      fnTreeData,
      checkedKeys,
      selectedFnList
    } = this.dealFnTreeData(res.data || []);
    this.selectedFnList = selectedFnList;
    this.setState({ fnTreeData, expandedKeys, spinning: false, checkedKeys });
  };

  chooseFn = async () => {
    this.setState({ spinning: true });
    let addFnsParams = { resid: 582414136652, data: [] },
      removeFnsParams = { resid: 582414136652, data: [] },
      primiseArr = [];
    if (this.addFnList.length) {
      this.addFnList.forEach(fn => {
        addFnsParams.data.push({
          ResID: fn.RES_ID
        });
      });
      primiseArr.push(addWorkbenchApps(addFnsParams));
    }

    if (this.removeFnList.length) {
      this.removeFnList.forEach(fn => {
        removeFnsParams.data.push({
          REC_ID: fn.recid
        });
      });
      primiseArr.push(removeFns(removeFnsParams));
    }
    let res;
    try {
      res = await Promise.all(primiseArr);
    } catch (err) {
      return message.error(err.message);
    }
    this.onClose();
    if (res.length) {
      this.props.onConfirmSelection();
      message.success('选择成功');
    }
  };

  render() {
    const { selectedApps, onRemoveApp } = this.props;
    const { modalVisible, spinning, fnTreeData } = this.state;

    return (
      <Panel>
        <div className="workbench-setting-optional-apps">
          <i
            className="workbench-setting-add-apps iconfont icon-add"
            onClick={this.openModal}
          />

          {/* 已选的功能列表 */}
          <div className="app-list">
            {selectedApps.map((app, idx) => (
              <SelectedApp
                key={app.ResID || idx}
                appData={app}
                onRemove={onRemoveApp}
              />
            ))}
          </div>
          {/* 所有的功能 */}
          <Modal
            visible={modalVisible}
            className="lz-optional-apps-modal"
            onCancel={this.onClose}
            destroyOnClose={true}
            title={
              <div className="header">
                <span className="title">可选功能</span>
              </div>
            }
            footer={
              <Button type="primary" block onClick={this.chooseFn}>
                确定
              </Button>
            }
          >
            <Spin spinning={spinning}>
              <Tree
                checkable
                defaultExpandAll={true}
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                autoExpandParent={this.state.autoExpandParent}
                onCheck={this.onCheck}
                checkedKeys={this.state.checkedKeys}
                onSelect={this.onSelect}
                selectedKeys={this.state.selectedKeys}
              >
                {this.renderTreeNodes(fnTreeData)}
              </Tree>
            </Spin>
          </Modal>
          {/* <AppSelector
            isOpen={isAppSelectorOpen}
            onClose={this.closeAppSelector}
            onConfirmSelection={onConfirmSelection}
          /> */}
        </div>
      </Panel>
    );
  }
}
