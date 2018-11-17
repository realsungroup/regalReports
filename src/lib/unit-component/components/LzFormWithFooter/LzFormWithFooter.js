import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Button, Popconfirm, message, Spin } from 'antd';
import LzForm from '../LzForm';
import { dealFormData } from 'Util/controls';
import {
  addRecord,
  addSubRecord,
  modRecord,
  delRow,
  saveMultipleRecord
} from '../../../util/api';
import LzTabs from '../../LzTabs';
import cloneDeep from 'lodash.clonedeep';
import './LzFormWithFooter.less';

/**
 * 带有与后台交互（保存、删除）功能（按钮在 footer 中）的 LzForm 组件
 */
export default class LzFormWithFooter extends React.Component {
  static propTypes = {
    /**
     * 数据模式
     * 可选：'main' 主表的记录 | 'sub' 子表的记录
     */
    dataMode: PropTypes.oneOf(['main', 'sub']).isRequired,

    /**
     * 主表 id
     */
    resid: PropTypes.number.isRequired,

    /**
     * 子表 id（当 dataMode 为 'sub' 时，必传）
     */
    subresid: PropTypes.number,

    /**
     * 主表记录 id（当 dataMode 为 'sub' 时，必传）
     */
    hostrecid: PropTypes.number,

    /**
     * 是否有编辑按钮
     * 默认：true
     */
    editBtn: PropTypes.bool,

    /**
     * 是否有删除按钮
     * 默认：true
     */
    delBtn: PropTypes.bool,

    /**
     * 是否有取消按钮
     * 默认：true
     */
    cancelBtn: PropTypes.bool,

    /**
     * 表单默认视图状态
     * 可选：'view' 查看状态 | 'edit' 编辑状态
     * 默认：'view'
     */
    viewStatus: PropTypes.oneOf(['view', 'edit']),

    /**
     * 操作
     * 可选：'add' 添加操作 | 'mod' 修改操作
     */
    operation: PropTypes.oneOf(['add', 'mod']).isRequired,

    /**
     * 点击保存按钮成功的回调函数
     * 默认：() => {}
     */
    saveCb: PropTypes.func,

    /**
     * 点击取消按钮回调函数
     * 默认：() => {}
     */
    cancelCb: PropTypes.func,

    /**
     * 删除成功后的回调函数
     * 默认：() => {}
     */
    delCb: PropTypes.func
  };

  static defaultProps = {
    editBtn: true,
    delBtn: true,
    viewStatus: 'view',
    saveCb: () => {},
    cancelCb: () => {}
  };

  constructor(props) {
    super(props);
    const { viewStatus } = props;

    this.state = {
      viewStatus,
      loading: false
    };
  }

  // 保存记录和子表数据
  saveRecordAndSubTable = async opType => {
    let hasErr = false;
    let record = this.record;
    // 获取记录表单数据
    const { resid } = this.props,
      { validateFields } = this.form,
      data = [],
      formData = {},
      subdata = [];
    formData.resid = resid;
    formData.maindata = {};
    formData.subdata = [];

    validateFields((err, values) => {
      if (!err) {
        formData.maindata = { ...values };
        dealFormData(formData.maindata);
        formData.maindata.REC_ID = record.REC_ID;
        formData.maindata._id = 1;
        if (opType === 'add') {
          formData.maindata._state = 'added';
        } else if (opType === 'mod') {
          formData.maindata._state = 'modified';
        }
      } else {
        hasErr = true;
      }
    });
    if (hasErr) {
      return;
    }
    // 获取子表数据
    const lzTables = this.lzTabsRef.refs;
    console.log('lzTables:', lzTables);
    Object.keys(lzTables).forEach(key => {
      const tempFormArr = lzTables[key].tempFormArr;
      const addFormArr = lzTables[key].addFormArr;

      const formArr = [...tempFormArr, ...addFormArr];
      const subresid = lzTables[key].props.subresid;
      formArr.forEach(form => {
        const { validateFields } = form;
        validateFields((err, values) => {
          console.log(err);
          if (!err) {
            const subdataFormData = {};
            subdataFormData.resid = subresid;
            subdataFormData.maindata = { ...values };
            dealFormData(subdataFormData.maindata);
            subdataFormData.maindata._id = 1;
            subdataFormData.maindata._state = form._state;
            subdataFormData.maindata.REC_ID = form.REC_ID;
            formData.subdata.push(subdataFormData);
          } else {
            hasErr = true;
          }
        });
      });
    });
    if (hasErr) {
      return;
    }
    data.push(formData);
    let res;
    console.log(data);
    try {
      res = await saveMultipleRecord(data);
    } catch (err) {
      return message.error(err.message);
    }

    // 抛出子表错误
    res.data[0].subdata.forEach(item => {
      if (item.maindata.message) {
        hasErr = true;
        const msg = `ERROR: 表 ${item.resid}：${item.maindata.message}`;
        message.error(msg);
        console.error(msg);
      }
    });
    const { saveCb, operation } = this.props;
    if (!hasErr) {
      saveCb && saveCb(operation, record);
    }
  };

  handleEditClick = () => {
    this.setState({ viewStatus: 'edit' });
  };

  handleSaveClick = () => {
    const {
      operation,
      resid,
      subresid,
      dataMode,
      hostrecid,
      record,
      saveCallback
    } = this.props;
    this.setState({ loading: true });
    let id;
    if (dataMode === 'main') {
      id = resid;
    } else if (dataMode === 'sub') {
      id = subresid;
    }
    switch (operation) {
      // 添加
      case 'add': {
        if (this.props.formTabsSubTableProps) {
          this.saveRecordAndSubTable('add');
        } else {
          // 无子表时，只保存记录
          const { validateFieldsAndScroll } = this.form;
          validateFieldsAndScroll(async (err, values) => {
            if (!err) {
              const formData = values;
              dealFormData(formData);
              let res;
              try {
                if (dataMode === 'main') {
                  res = await addRecord(resid, formData);
                } else if (dataMode === 'sub') {
                  res = await addSubRecord(
                    resid,
                    hostrecid,
                    subresid,
                    formData
                  );
                }
              } catch (err) {
                this.setState({ loading: false });

                return message.error(err.message);
              }
              this.setState({ loading: false });

              this.props.saveCb(operation, record);
            }
          });
        }
        break;
      }
      // 修改
      case 'mod': {
        // 有子表时，同时修改记录和子表数据
        // https://github.com/realsungroup/ReactOfPowerWorks/blob/f6947aef8266006b180ba7e9074068087dde3b61/src/lib/unit-component/components/LzForm/LzForm.js
        if (this.props.formTabsSubTableProps) {
          this.saveRecordAndSubTable('mod');
        } else {
          // 无子表时，只修改记录
          const { validateFieldsAndScroll } = this.form;
          const { record } = this.props;
          validateFieldsAndScroll(async (err, values) => {
            if (!err) {
              const formData = values;
              formData.REC_ID = record.REC_ID;
              dealFormData(formData);
              try {
                await modRecord(id, formData);
              } catch (err) {
                this.setState({ loading: false });
                return message.error(err.message);
              }
            }
            this.props.saveCb(operation, record);
            this.setState({ viewStatus: 'view', loading: false });
            saveCallback && saveCallback();
          });
        }
      }
    }
  };

  handleCancelClick = () => {
    this.form.resetFields();
    this.setState({ viewStatus: 'view' });
    this.props.cancelCb && this.props.cancelCb();
  };

  handleDeleteClick = async () => {
    const { dataMode, resid, subresid, record } = this.props;
    let id;
    if (dataMode === 'main') {
      id = resid;
    } else if (dataMode === 'sub') {
      id = subresid;
    }
    if (!id) {
      return;
    }
    let res;
    try {
      res = await delRow(id, record.REC_ID);
    } catch (err) {
      return message.error(err.message);
    }
    message.success('删除成功');
    this.props.delCb();
  };

  renderFooter = (form, lzTabsRef, record) => {
    this.form = form;
    this.lzTabsRef = lzTabsRef; // 表单中的子表父级 lzTabs 组件的实例
    this.record = record;
    const { editBtn, delBtn, cancelBtn } = this.props;
    const { viewStatus } = this.state;
    const hasEditBtn = editBtn && viewStatus === 'view';
    const hasSaveBtn = editBtn && viewStatus === 'edit';
    const hasDelBtn = delBtn && viewStatus === 'view';
    const hasCancelBtn = cancelBtn && viewStatus === 'edit';
    const hasFooter = hasEditBtn || hasSaveBtn || hasDelBtn || hasCancelBtn;
    if (!hasFooter) {
      return null;
    } else {
      return (
        <Fragment>
          {hasEditBtn && <Button onClick={this.handleEditClick}>编辑</Button>}
          {hasSaveBtn && <Button onClick={this.handleSaveClick}>保存</Button>}
          {hasCancelBtn && (
            <Button onClick={this.handleCancelClick}>取消</Button>
          )}
          {hasDelBtn && (
            <Popconfirm
              placement="top"
              title="你确定要删除这条记录吗？"
              onConfirm={this.handleDeleteClick}
              okText="确定"
              cancelText="取消"
            >
              <Button type="danger">删除</Button>
            </Popconfirm>
          )}
        </Fragment>
      );
    }
  };

  render() {
    const { viewStatus, loading } = this.state;
    return (
      <div className="lz-form-with-footer">
        <LzForm
          {...this.props}
          footer={this.renderFooter}
          viewStatus={viewStatus}
          Spin={loading}
        />
      </div>
    );
  }
}
