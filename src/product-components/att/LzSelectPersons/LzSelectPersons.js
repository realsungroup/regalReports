import React from 'react';
import { message, Radio, Spin, Input } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './LzSelectPersons.less';
import { getMainTableData, getSubTableData } from 'Util/api';
import DepartmentTree from '../DepartmentTree';
import ListWithSelect from '../ListWithSelect';
import PersonListWithSelect from '../PersonListWithSelect';
import PersonListWithDel from '../PersonListWithDel';
import InfiniteScroll from 'react-infinite-scroller';
const Search = Input.Search;

const departmentResid = 592742244497; // 部门主表
const departmentSubResid = 592742369617; // 部门子表（人员表）

const teamResid = 593017031990; // 班组主表
const teamSubResid = 592742369617; // 班组子表（人员表）

const plResid = 593255133996; // 产线主表
const plSubResid = 592742369617; // 产线子表（人员表）

const TeamList = props => {
  const headerTitle = '班组列表';
  return <ListWithSelect {...props} headerTitle={headerTitle} />;
};
const PlList = props => {
  const headerTitle = '产线列表';
  return <ListWithSelect {...props} headerTitle={headerTitle} />;
};

/**
 * 选择人员
 */
export default class LzSelectPersons extends React.Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      curNavName: '按部门添加', // 当前选中的单选

      departmentData: [], // 部门列表
      listData: [], // 班组列表
      plListData: [], // 产线列表

      personList: [], // 用户列表
      selectedList: [], // 选中的人员列表

      isCheckedPart: false, // 人员是否只选了部分
      isCheckedAll: false, // 是否全选了

      pageIndex: 0, // 当前页数
      totalPage: 0, // 总页数
      pageSize: 10, // 每页数量
      total: 0, // 总共人数
      searchValue: '', // 搜索值

      hasMore: true, // 是否有更多人员

      subType: 'tree', // 点击获取人员信息的节点类型：'tree' 点击树节点 | 'cesItem' 点击班组列表项 | 'plItem' 点击产线列表项
      selectedItem: {}, // 选中的列表项
      selectedKeys: [], // 选中的节点的 key

      loading: false,
      typeLoading: false
    };
  }

  componentDidMount() {
    this.setState({ typeLoading: true });
    this.getDepartmentData();
  }

  onChange = e => {
    const value = e.target.value;
    this.setState({ typeLoading: true });
    let subType;
    if (value === '按部门添加') {
      this.getDepartmentData();
      subType = 'tree';
    } else if (value === '按班组添加') {
      this.getTeamData();
      subType = 'cesItem';
    } else if (value === '按产线添加') {
      this.getProductLineData();
      subType = 'plItem';
    }
    this.setState({
      curNavName: e.target.value,
      departmentData: [],
      listData: [],
      plListData: [],
      personList: [],
      subType
    });
  };

  getDepartmentData = async () => {
    let res;
    try {
      res = await getMainTableData(departmentResid);
    } catch (err) {
      message.error(err.message);
    }
    const nodesData = res.data;
    const length = nodesData.length;
    const titleFieldName = 'DEP_NAME',
      curNodeFieldName = 'DEP_ID',
      parentNodeFieldName = 'DEP_PID';
    for (let i = 0; i < length; i++) {
      nodesData[i].title = nodesData[i][titleFieldName];
      for (let j = 0; j < length; j++) {
        if (
          nodesData[j][parentNodeFieldName] === nodesData[i][curNodeFieldName]
        ) {
          if (!nodesData[i].childNodes) {
            nodesData[i].childNodes = [];
          }
          nodesData[i].childNodes.push(nodesData[j]);
        }
      }
    }
    const departmentData = nodesData.filter(nodeData => nodeData.DEP_PID === 0);
    this.setState({ departmentData, typeLoading: false });
  };

  getTeamData = async () => {
    let res;
    try {
      res = await getMainTableData(teamResid);
    } catch (err) {
      message.error(err.message);
    }
    const titleFieldName = 'DESCP';
    res.data.forEach(item => (item.title = item[titleFieldName]));
    this.setState({ listData: res.data, typeLoading: false });
  };

  getProductLineData = async () => {
    let res;
    try {
      res = await getMainTableData(plResid);
    } catch (err) {
      message.error(err.message);
    }
    const titleFieldName = 'C3_593254711841';
    res.data.forEach(item => (item.title = item[titleFieldName]));
    this.setState({ plListData: res.data, typeLoading: false });
  };

  getPersonList = async (resid, subResid, hostRecid, option) => {
    this.loading = true;
    this.setState({ loading: true });
    let res;
    try {
      res = await getSubTableData(resid, subResid, hostRecid, option);
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    this.dealPersonList(res.data, res.total, option.current === 0);
  };

  dealPersonList = (resData, total) => {
    const avatarFieldName = '',
      badgeNumFieldName = 'C3_227192472953',
      nameFieldName = 'C3_227192484125',
      departmentFieldName = 'C3_227212499515';

    const { selectedList } = this.state;

    resData.forEach(item => {
      item.avatar = item[avatarFieldName];
      item.badgeNum = item[badgeNumFieldName];
      item.name = item[nameFieldName];
      item.department = item[departmentFieldName];
      item.checked = selectedList.some(
        person => item.badgeNum === person.badgeNum
      );
    });

    const isCheckedPart = this.isCheckedPart(resData);
    const isCheckedAll = this.isCheckedAll(resData);
    const totalPage = Math.ceil(total / this.state.pageSize);
    const hasMore = this.state.pageIndex + 1 <= totalPage;

    const personList = [...this.state.personList, ...resData];

    const pageIndex = this.state.pageIndex + 1;

    this.setState(
      {
        personList,
        isCheckedPart,
        isCheckedAll,
        pageIndex,
        totalPage,
        total,
        hasMore,
        loading: false
      },
      () => {
        this.loading = false;
      }
    );
  };

  // 点击树节点
  handleTreeNodeSelect = async (selectedKeys, e) => {
    this.setState({
      personList: [],
      pageIndex: 0,
      selectedKeys,
      searchValue: ''
    });
    if (!selectedKeys.length) {
      return;
    }
    const hostrecid = selectedKeys[0];
    const option = {
      current: 0,
      pageSize: this.state.pageSize
    };
    this.getPersonList(departmentResid, departmentSubResid, hostrecid, option);
  };

  // 选择列表项
  handleListItemSelect = async (resid, subResid, hostRecid, item) => {
    this.setState({
      personList: [],
      pageIndex: 0,
      selectedItem: item,
      searchValue: ''
    });
    let res;
    const option = {
      current: 0,
      pageSize: this.state.pageSize
    };
    this.getPersonList(resid, subResid, hostRecid, option);
  };

  // 选择班组
  handleTeamSelect = async (item, index) => {
    this.handleListItemSelect(teamResid, teamSubResid, item.REC_ID, item);
    const { listData } = this.state;
    listData.forEach(item => (item.isSelect = false));
    listData[index].isSelect = true;
    this.setState({ listData });
  };

  // 选择产线
  handlePlSelect = async (item, index) => {
    this.handleListItemSelect(plResid, plSubResid, item.REC_ID, item);
    const { plListData } = this.state;
    plListData.forEach(item => (item.isSelect = false));
    plListData[index].isSelect = true;
    this.setState({ plListData });
  };

  handlePersonSearch = async (value, isFirstSearch = true) => {
    if (!value) {
      return message.error('请输入关键字');
    }
    this.loading = true;
    this.setState({ loading: true });
    const { pageIndex, pageSize } = this.state;
    const option = {
      key: value,
      current: pageIndex,
      pageSize: pageSize
    };
    // 第一次搜索该值（非 loadMore 中搜索）
    if (isFirstSearch) {
      option.current = 0;
      this.personSearchValue = value;
      this.setState({
        personList: [],
        pageIndex: 0
      });
    }
    let res;
    try {
      res = await getMainTableData(592742369617, option);
    } catch (err) {
      return message.error(err.message);
    }
    this.dealPersonList(res.data, res.total);
  };

  isCheckedPart = personList => {
    return !this.isCheckedNo(personList) && !this.isCheckedAll(personList);
  };

  isCheckedNo = personList => {
    return !personList.some(person => person.checked);
  };

  isCheckedAll = personList => {
    return personList.every(person => person.checked);
  };

  handleSingleChange = (e, item, index) => {
    const checked = e.target.checked;
    const { personList, selectedList } = this.state;
    personList[index].checked = checked;
    const isCheckedPart = this.isCheckedPart(personList);
    const isCheckedAll = this.isCheckedAll(personList);

    if (checked) {
      !selectedList.some(person => item['badgeNum'] === person['badgeNum']) &&
        selectedList.unshift(item);
    } else {
      const index = selectedList.findIndex(
        person => person['badgeNum'] === item['badgeNum']
      );
      selectedList.splice(index, 1);
    }

    this.setState({ personList, isCheckedPart, isCheckedAll, selectedList });
    this.props.onSelect(selectedList);
  };

  handleAllChange = e => {
    const checked = e.target.checked;
    const { personList, selectedList } = this.state;
    personList.forEach(person => {
      person.checked = checked;
      if (checked) {
        !selectedList.some(item => item['badgeNum'] === person['badgeNum']) &&
          selectedList.unshift(person);
      } else {
        const index = selectedList.findIndex(
          item => item['badgeNum'] === person['badgeNum']
        );
        selectedList.splice(index, 1);
      }
    });

    this.setState({
      personList,
      isCheckedPart: false,
      isCheckedAll: checked,
      selectedList
    });
    this.props.onSelect(selectedList);
  };

  handleDelete = (item, sIndex) => {
    const { selectedList, personList } = this.state;
    const pIndex = personList.findIndex(
      person => item['badgeNum'] === person['badgeNum']
    );
    if (personList[pIndex]) {
      personList[pIndex].checked = false;
    }

    const isCheckedPart = this.isCheckedPart(personList);
    const isCheckedAll = this.isCheckedAll(personList);

    selectedList.splice(sIndex, 1);
    this.setState({ personList, selectedList, isCheckedPart, isCheckedAll });
    this.props.onSelect(selectedList);
  };

  getReqParams = (searchValue = '') => {
    const { subType, pageIndex, pageSize } = this.state;
    let resid, subResid, hostRecid;
    const option = {
      current: pageIndex,
      pageSize,
      key: searchValue
    };
    if (subType === 'tree') {
      resid = departmentResid;
      subResid = departmentSubResid;
      hostRecid = this.state.selectedKeys[0];
    } else if (subType === 'cesItem') {
      resid = teamResid;
      subResid = teamSubResid;
      hostRecid = this.state.selectedItem.REC_ID;
    } else if (subType === 'plItem') {
      resid = plResid;
      subResid = plSubResid;
      hostRecid = this.state.selectedItem.REC_ID;
    }
    return { resid, subResid, hostRecid, option };
  };

  loadMore = page => {
    if (this.loading || this.state.pageIndex >= this.state.totalPage) {
      return;
    }
    // 人员在主表中
    if (this.state.curNavName === '全员搜索') {
      this.handlePersonSearch(this.personSearchValue, false);
      // 人员在子表中
    } else {
      const { resid, subResid, hostRecid, option } = this.getReqParams(
        this.state.searchValue
      );
      this.getPersonList(resid, subResid, hostRecid, option);
    }
  };

  handleSearch = value => {
    this.setState({ personList: [], searchValue: value, pageIndex: 0 });
    let { resid, subResid, hostRecid, option } = this.getReqParams(value);
    option = { ...option, key: value, current: 0 };
    this.getPersonList(resid, subResid, hostRecid, option);
  };

  handleSearchChange = e => {
    this.setState({ searchValue: e.target.value });
  };

  render() {
    const {
      curNavName,
      departmentData,
      listData,
      plListData,
      personList,
      isCheckedPart,
      isCheckedAll,
      selectedList,
      hasMore,
      loading,
      typeLoading,
      searchValue
    } = this.state;
    return (
      <div className="lz-select-persons">
        <div className="lz-select-persons__nav">
          <Radio.Group onChange={this.onChange} value={curNavName}>
            <Radio.Button value="按部门添加">按部门添加</Radio.Button>
            <Radio.Button value="按班组添加">按班组添加</Radio.Button>
            <Radio.Button value="按产线添加">按产线添加</Radio.Button>
            <Radio.Button value="全员搜索">全员搜索</Radio.Button>
          </Radio.Group>
        </div>
        <div className="lz-select-persons__content">
          {/* 第一栏：部门、班组、产线、搜索 */}
          <div>
            {curNavName === '按部门添加' ? (
              <Spin spinning={typeLoading}>
                <DepartmentTree
                  nodesData={departmentData}
                  onSelect={this.handleTreeNodeSelect}
                />
              </Spin>
            ) : null}
            {curNavName === '按班组添加' ? (
              <Spin spinning={typeLoading}>
                <TeamList data={listData} onSelect={this.handleTeamSelect} />
              </Spin>
            ) : null}
            {curNavName === '按产线添加' ? (
              <Spin spinning={typeLoading}>
                <PlList data={plListData} onSelect={this.handlePlSelect} />
              </Spin>
            ) : null}
            {curNavName === '全员搜索' ? (
              <Search
                placeholder="请输入内容"
                style={{ marginTop: 25 }}
                onSearch={value => this.handlePersonSearch(value, true)}
              />
            ) : null}
          </div>
          {/* 第二栏：人员列表 */}
          <div>
            {!!curNavName && curNavName === '全员搜索' && (
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={this.loadMore}
                hasMore={hasMore}
                useWindow={false}
              >
                <PersonListWithSelect
                  data={personList}
                  singleChange={this.handleSingleChange}
                  allChange={this.handleAllChange}
                  indeterminate={isCheckedPart}
                  isCheckedAll={isCheckedAll}
                  loading={loading}
                  onSearch={this.handleSearch}
                  onSearchChange={this.handleSearchChange}
                  hasSearch={false}
                />
              </InfiniteScroll>
            )}
            {!!curNavName && curNavName !== '全员搜索' && (
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={this.loadMore}
                hasMore={hasMore}
                useWindow={false}
              >
                <PersonListWithSelect
                  data={personList}
                  searchValue={searchValue}
                  singleChange={this.handleSingleChange}
                  allChange={this.handleAllChange}
                  indeterminate={isCheckedPart}
                  isCheckedAll={isCheckedAll}
                  loading={loading}
                  onSearch={this.handleSearch}
                  onSearchChange={this.handleSearchChange}
                />
              </InfiniteScroll>
            )}
          </div>
          {/* 被选的人员列表 */}
          <div>
            {!!curNavName && (
              <PersonListWithDel
                data={selectedList}
                onDelete={this.handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
