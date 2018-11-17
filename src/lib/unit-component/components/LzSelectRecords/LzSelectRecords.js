import React, { Fragment } from 'react';
import { Tree, message, Checkbox, Button } from 'antd';
import PropTypes from 'prop-types';
import { getMainTableData, getSubTableData } from 'Util/api';
import classNames from 'classnames';
import LzTree from '../LzTree';
import LzList from '../LzList';
import './LzSelectRecords.less';

const TreeNode = Tree.TreeNode;

/**
 * 选择记录组件：根据主表记录，选取子表的记录
 */
export default class LzSelectRecords extends React.Component {
  static propTypes = {
    /**
     * 主表显示模式
     * 可选：'tree' 树显示形式 | 'list' 列表显示形式
     */
    mainViewMode: PropTypes.oneOf(['tree', 'list']).isRequired,

    /**
     * 主表 id
     */
    resid: PropTypes.number.isRequired,

    /**
     * 子表 id
     */
    subresid: PropTypes.number.isRequired,

    // 树显示形式相关 props
    /**
     * 当前节点数据值所对应的内部字段名（当 mainViewMode 为 tree 时，必传）
     */
    currentNameTree: function(props, propName, componentName) {
      if (props.mainViewMode === 'tree' && !props[propName]) {
        return new Error(
          'Invalid prop `' +
            propName +
            '` supplied to' +
            ' `' +
            componentName +
            '`. Validation failed.'
        );
      }
    },

    /**
     * 父节点数据值所对应的内部字段名（当 mainViewMode 为 tree 时，必传）
     */
    parentNameTree: function(props, propName, componentName) {
      if (props.mainViewMode === 'tree' && !props[propName]) {
        return new Error(
          'Invalid prop `' +
            propName +
            '` supplied to' +
            ' `' +
            componentName +
            '`. Validation failed.'
        );
      }
    },

    /**
     * 节点显示值所对应的内部字段名（当 mainViewMode 为 tree 时，必传）
     */
    titleNameTree: function(props, propName, componentName) {
      if (props.mainViewMode === 'tree' && !props[propName]) {
        return new Error(
          'Invalid prop `' +
            propName +
            '` supplied to' +
            ' `' +
            componentName +
            '`. Validation failed.'
        );
      }
    },

    // 列表显示形式相关 props
    /**
     * 列表项 title 所对应的内部字段
     */
    titleNameList: function(props, propName, componentName) {
      if (props.mainViewMode === 'list' && !props[propName]) {
        return new Error(
          'Invalid prop `' +
            propName +
            '` supplied to' +
            ' `' +
            componentName +
            '`. Validation failed.'
        );
      }
    },
    /**
     * 列表的标题
     * 默认：''
     */
    listTitle: PropTypes.string,

    // 子表记录需要显示字段的内部字段名称
    /**
     * 头像所对应的内部字段名
     * 默认：-
     */
    avatarNameSub: PropTypes.string,

    /**
     * 标题所对应的内部字段名
     */
    titleNameSub: PropTypes.string.isRequired,

    /**
     * 描述所对应的内部字段名
     */
    descNameSub: PropTypes.string.isRequired,

    /**
     * 内容所对应的内部字段名数组（多个字段的内容）
     */
    contentNamesSub: PropTypes.array.isRequired,

    // 其他
    /**
     * 选择记录的回调
     * 例如：(records) => {}
     */
    onRecordsSelect: PropTypes.func.isRequired
  };

  static defaultProps = {
    listTitle: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      mainData: [], // 主表数据,
      subData: [], // 子表数据
      checkedAll: false
    };
  }

  componentDidMount() {
    this.getRecords();
  }

  getRecords = async () => {
    const { resid, mainViewMode } = this.props;
    let res;
    try {
      res = await getMainTableData(resid);
    } catch (err) {
      message.error(err.message);
    }
    let data;
    // 树系显示模式
    if (mainViewMode === 'tree') {
      data = this.getTreeData(res.data);
      // 列表显示模式
    } else {
      data = this.getListData(res.data);
    }
    this.setState({ mainData: data });
  };

  getTreeData = nodesData => {
    const { currentNameTree, parentNameTree, titleNameTree } = this.props;
    const length = nodesData.length;
    for (let i = 0; i < length; i++) {
      nodesData[i].title = nodesData[i][titleNameTree];
      for (let j = 0; j < length; j++) {
        if (nodesData[j][parentNameTree] === nodesData[i][currentNameTree]) {
          if (!nodesData[i].childNodes) {
            nodesData[i].childNodes = [];
          }
          nodesData[i].childNodes.push(nodesData[j]);
        }
      }
    }
    return nodesData.filter(nodeData => nodeData.childNodes);
  };

  getListData = listData => {
    listData.forEach(item => (item.title = item[this.props.titleNameList]));
    return listData;
  };

  hostrecid = 0;
  handleSelect = (selectedKeys, e) => {
    if (selectedKeys.length) {
      this.hostrecid = selectedKeys[0];
      const { resid, subresid } = this.props;
      this.getSubRecords(resid, subresid, selectedKeys[0]);
    }
  };

  getSubRecords = async (resid, subresid, hostrecid, options = {}) => {
    let res;
    try {
      res = await getSubTableData(resid, subresid, hostrecid, options);
    } catch (err) {
      message.error(err.message);
    }
    if (res.data.length) {
      const { avatarNameSub, titleNameSub, descNameSub } = this.props;
      res.data.forEach(item => {
        item.avatar = item[avatarNameSub];
        item.title = item[titleNameSub];
        item.description = item[descNameSub];
        item.checked = false;
      });
    }
    this.setState({ subData: res.data, checkedAll: false });
  };

  renderTreeNodes = nodesData => {
    return nodesData.map(nodeData => {
      if (nodeData.childNodes) {
        return (
          <TreeNode
            title={nodeData[this.props.titleName]}
            key={nodeData.REC_ID}
          >
            {this.renderTreeNodes(nodeData.childNodes)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={nodeData[this.props.titleName]}
          key={nodeData.REC_ID}
        />
      );
    });
  };

  checkboxChange = (e, item) => {
    const checked = e.target.checked;
    const { subData } = this.state;
    subData.forEach(itemData => {
      if (item.REC_ID === itemData.REC_ID) {
        itemData.checked = checked;
      }
    });
    this.setState({ subData });
  };

  handleSearch = value => {
    const { resid, subresid } = this.props;
    this.getSubRecords(resid, subresid, this.hostrecid, { key: value });
  };

  checkedAllChange = e => {
    const checked = e.target.checked;
    const { subData } = this.state;
    subData.forEach(item => (item.checked = checked));
    this.setState({ checkedAll: checked, subData });
  };

  selectRecords = () => {
    const { onRecordsSelect } = this.props;
    const newSubData = this.state.subData.filter(item => item.checked);
    onRecordsSelect && onRecordsSelect(newSubData);
  };

  renderListHeader = () => {
    return (
      <Fragment>
        <Button
          type="primary"
          style={{ marginRight: 10 }}
          onClick={this.selectRecords}
        >
          确定
        </Button>
        <Checkbox
          checked={this.state.checkedAll}
          onChange={this.checkedAllChange}
        >
          全选
        </Checkbox>
      </Fragment>
    );
  };

  renderListContent = item => {
    const contentArr = this.props.contentNamesSub.map(
      fieldName => item[fieldName]
    );
    return (
      <Fragment>
        {contentArr.map(content => (
          <span style={{ marginRight: 10 }} key={content}>
            {content}
          </span>
        ))}
        <Checkbox
          checked={item.checked}
          style={{ marginRight: 42 }}
          onChange={e => this.checkboxChange(e, item)}
        />
      </Fragment>
    );
  };

  handleListItemClick = hostrecid => {
    const { resid, subresid } = this.props;
    this.getSubRecords(resid, subresid, hostrecid);
  };

  renderMainListContent = item => {
    return (
      <a
        href="javascript:;"
        onClick={() => this.handleListItemClick(item.REC_ID)}
      >
        选择
      </a>
    );
  };

  render() {
    const { mainViewMode, listTitle, ...restProps } = this.props;
    const { mainData, subData } = this.state;

    return (
      <div className="lz-select-records" {...restProps}>
        <div className="lz-select-records__main">
          {mainViewMode === 'tree' ? (
            <LzTree nodesData={mainData} onSelect={this.handleSelect} />
          ) : (
            <LzList
              listData={mainData}
              content={this.renderMainListContent}
              hasSearch={false}
              header={() => <h2>{listTitle}</h2>}
            />
          )}
        </div>
        <div className="lz-select-records__sub">
          <LzList
            listData={subData}
            header={this.renderListHeader}
            content={this.renderListContent}
            onSearch={this.handleSearch}
          />
        </div>
      </div>
    );
  }
}
