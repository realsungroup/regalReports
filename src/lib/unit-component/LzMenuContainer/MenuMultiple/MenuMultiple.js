import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal, Input, message, Spin, Button, Timeline } from 'antd';
import './MenuMultiple.less';
import LzFormWithFooter from '../../components/LzFormWithFooter';
import { getFormData, addSubRecord, getSubTableData } from '../../../util/api';
import dealControlArr from 'Util/controls';
import LzFormModalContainer from '../../components/LzFormModalContainer';
import LzAdvSearch from '../../LzTable/LzAdvSearch';
/**
 * MenuMultiple
 */
export default class MenuMultiple extends React.Component {
  static propTypes = {
    /**
     * 记录列表
     * 默认：-
     */
    recordList: PropTypes.array,

    /**
     * 显示记录值的内部字段名
     */
    innerFieldName: PropTypes.string,

    /**
     * 主表 id
     */
    resid: PropTypes.number.isRequired,

    /**
     * 子表 id
     */
    subresid: PropTypes.number.isRequired,

    /**
     * 主表记录 id
     */
    hostrecid: PropTypes.number.isRequired,

    /**
     * 表单标题
     * 默认：''
     */
    formTitle: PropTypes.string,

    /**
     * 高级搜索配置
     */
    advSearchConfig: PropTypes.object
  };
  static defaultProps = {
    formTitle: ''
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedRecord: {}, // 被选中记录的 recid
      formFormData: {
        subTableArr: [],
        allControlArr: [],
        canOpControlArr: [],
        containerControlArr: []
      },
      operation: 'check',
      viewStatus: 'view',
      recordList: [],
      innerFieldName: '',
      modalVisible: false,
      advSearchVisible: false // 高级搜索是否显示
    };
  }

  componentDidMount = async () => {
    if (!this.props.resid) {
      return;
    }
    this.getFormData();
    this.getRecordList();
  };

  getRecordList = async (selectedRecord, wheres = '') => {
    const { resid, subresid, hostrecid } = this.props;
    let res;
    try {
      res = await getSubTableData(resid, subresid, hostrecid, {
        cmswhere: wheres
      });
    } catch (err) {
      return message.error(err.message);
    }
    this.setState({
      recordList: res.data,
      selectedRecord: selectedRecord || res.data[0],
      innerFieldName: res.cmscolumninfo[0].id
    });
  };

  getFormData = async () => {
    const { subresid } = this.props;
    if (!subresid) {
      return;
    }
    let res;
    try {
      res = await getFormData(subresid, 'default');
    } catch (err) {
      return message.error(err.message);
    }
    const formFormData = dealControlArr(res.data.columns);
    this.setState({ formFormData });
  };

  handleAddClick = () => {
    this.setState({ modalVisible: true });
  };

  handleFilterClick = () => {
    this.setState({ advSearchVisible: !this.state.advSearchVisible });
  };

  saveCb = () => {
    message.success('保存成功');
    this.getRecordList(this.state.selectedRecord);
  };

  delCb = () => {
    this.getRecordList();
  };

  conditionChange = wheres => {
    this.getRecordList(this.state.selectedRecord, wheres);
  };

  renderForm = () => {
    const { selectedRecord, formFormData, operation } = this.state;
    const header = (
      <div className="menu-multiple-form-header">
        <span className="menu-multiple-form-header-title">
          {this.props.formTitle}
        </span>
        <Button type="primary" onClick={this.handleAddClick}>
          添加
        </Button>
      </div>
    );
    const { resid, subresid, hostrecid } = this.props;
    const props = {
      dataMode: 'sub',
      header,
      key: selectedRecord && selectedRecord.REC_ID,
      record: selectedRecord,
      formFormData,
      operation: 'mod',
      cancelBtn: true,
      resid,
      subresid,
      hostrecid,
      viewStatus: this.state.viewStatus,
      saveCb: this.saveCb,
      delCb: this.delCb
    };
    return <LzFormWithFooter {...props} />;
  };

  switchRecord = record => {
    this.setState({ selectedRecord: record });
  };

  cancelAddRecord = () => {
    this.setState({ modalVisible: false });
  };

  addRecordCb = () => {
    message.success('添加成功');
    this.setState({ modalVisible: false });
    this.getRecordList(this.state.selectedRecord);
  };

  closeAdvSearch = () => {
    this.setState({ advSearchVisible: false });
  };

  render() {
    const {
      selectedRecord,
      recordList,
      innerFieldName,
      modalVisible,
      formFormData,
      advSearchVisible
    } = this.state;
    const { resid, subresid, hostrecid, advSearchConfig } = this.props;
    const modalProps = {
      dataMode: 'sub',
      operation: 'add',
      resid,
      subresid,
      hostrecid,
      onCancel: this.cancelAddRecord,
      onConfirm: this.addRecordCb,
      formFormData
    };
    return (
      <div className="menu-multiple">
        <div className="form-wrap">
          {!!recordList.length ? (
            this.renderForm()
          ) : (
            <div>
              暂无数据
              <Button type="primary" onClick={this.handleAddClick}>
                添加
              </Button>
            </div>
          )}
        </div>

        <Timeline className="record-list">
          <div className="record-list-title">
            <i
              className="iconfont icon-adv-search"
              onClick={this.handleFilterClick}
            />
          </div>
          {recordList.map(record => (
            <Timeline.Item
              key={record.REC_ID}
              className={classNames('record-item', {
                selected: selectedRecord.REC_ID === record.REC_ID
              })}
              onClick={() => this.switchRecord(record)}
            >
              {record[innerFieldName]}
            </Timeline.Item>
          ))}
          {!recordList.length && <div>暂无数据</div>}
        </Timeline>
        {modalVisible && <LzFormModalContainer {...modalProps} />}

        <LzAdvSearch
          advSearchConfig={advSearchConfig}
          conditionChange={this.conditionChange}
          advSearchVisible={advSearchVisible}
          onClose={this.closeAdvSearch}
          cssSelector=".lz-menu-container"
        />
      </div>
    );
  }
}
