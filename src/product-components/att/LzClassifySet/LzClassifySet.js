import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { message, Spin, Tooltip, Calendar, Popconfirm } from 'antd';
import './LzClassifySet.less';
import classNames from 'classnames';
import LzTCList from '../LzTCList';
import { getMainTableData, getFormData, delRow } from 'Util/api';
import moment from 'moment';
import LzModal from '../../../lib/unit-component/components/LzModal';
import LzFormModalContainer from '../../../lib/unit-component/components/LzFormModalContainer';
import dealControlArr from 'Util/controls.js';

const subresid = 592745383956;
const resid = 592745383956;

/**
 * 班次设置
 */
export default class LzClassifySet extends React.Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        onChange: this.pageChange
      },
      loading: false,
      formModalVisible: false,
      record: { REC_ID: 0 },
      operation: '', // 'add' | 'mod'
      formFormData: {
        subTableArr: [], // 子表控件
        allControlArr: [], // 所有控件
        canOpControlArr: [], // 可操作的控件（如 input）
        containerControlArr: [] // 容器控件
      }
    };
  }

  componentDidMount = () => {
    this.getData(this.state.pagination.current);
    this.getFormData();
  };

  getData = async pageIndex => {
    this.setState({ loading: true });
    let res;
    try {
      res = await getMainTableData(resid, {
        current: pageIndex - 1,
        pageSize: 10
      });
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    this.setState({
      data: res.data,
      pagination: {
        ...this.state.pagination,
        current: pageIndex,
        total: res.total
      },
      loading: false
    });
  };

  getFormData = async () => {
    this.setState({ loading: true });
    let res;
    try {
      res = await getFormData(resid, 'default');
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    const formFormData = dealControlArr(res.data.columns);
    this.setState({ formFormData });
  };

  pageChange = (page, pageSize) => {
    this.getData(page);
  };

  delRecord = async record => {
    let res;
    try {
      res = await delRow(resid, record.REC_ID);
    } catch (err) {
      message.error(err.message);
    }
    message.success('删除成功');
    this.getData(this.state.pagination.current);
  };

  renderExtra = record => {
    return (
      <div className="lz-classify-set__extra">
        <span className="lz-classify-set__date">
          {moment(record.STARTDATES).format('YYYY-MM-DD')}
        </span>
        <Popconfirm
          title="你确定要删除该班次吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => this.delRecord(record)}
        >
          <i className="iconfont icon-del" />
        </Popconfirm>

        <Tooltip title="修改班次">
          <i
            className="iconfont icon-forward"
            onClick={() =>
              this.setState({
                record,
                formModalVisible: true,
                operation: 'mod'
              })
            }
          />
        </Tooltip>
      </div>
    );
  };

  renderDateCell = curDate => {
    const { calendarData } = this.state;
    const data = calendarData.find(
      item => item.date === curDate.format('YYYY-MM-DD')
    );
    if (data) {
      return (
        <div
          className={classNames({
            'lz-classify-set__type': true,
            'lz-classify-set__type--rest': data.workdayname === '休息',
            'lz-classify-set__type--work': data.workdayname !== '休息'
          })}
        >
          {data.workdayname}
        </div>
      );
    }
  };

  renderHeaderExtra = () => {
    return (
      <div className="lz-classify-set__header-extra">
        <i
          className="iconfont icon-add"
          onClick={() =>
            this.setState({
              formModalVisible: true,
              record: { REC_ID: 0 },
              operation: 'add'
            })
          }
        />
      </div>
    );
  };

  // 点击模态框中的确认按钮
  onConfirm = operation => {
    switch (operation) {
      // 添加
      case 'add': {
        this.getData(1);
        this.setState({
          formModalVisible: false
        });
        message.success('添加成功！');
        break;
      }
      // 修改
      case 'mod': {
        this.getData(this.state.pagination.current);
        this.setState({ formModalVisible: false });
        message.success('修改成功！');
        break;
      }

      default:
        this.setState({ formModalVisible: false });
    }
  };

  render() {
    const {
      data,
      pagination,
      loading,
      calendarModalVisible,
      calendarValue,
      calendarLoading,
      formModalVisible,
      record,
      operation,
      formFormData
    } = this.state;
    return (
      <div className="lz-classify-set">
        <Spin spinning={loading}>
          <LzTCList
            title="班次列表"
            titleFieldName="NAME"
            data={data}
            pageChange={this.pageChange}
            pagination={pagination}
            bordered={true}
            renderExtra={this.renderExtra}
            headerExtra={this.renderHeaderExtra()}
          />
        </Spin>
        {calendarModalVisible && (
          <LzModal
            onClose={() => this.setState({ calendarModalVisible: false })}
          >
            <Spin spinning={calendarLoading}>
              <div style={{ widht: '100%', height: '100%', overflow: 'auto' }}>
                <Calendar
                  dateCellRender={this.renderDateCell}
                  onPanelChange={this.handlePanelChange}
                  value={calendarValue}
                />
              </div>
            </Spin>
          </LzModal>
        )}
        {formModalVisible && (
          <LzFormModalContainer
            onCancel={() => {
              this.setState({ formModalVisible: false });
            }}
            onConfirm={this.handleFormModalConfirm}
            resid={resid}
            dataMode="sub"
            subresid={subresid}
            record={record}
            hostrecid={record.REC_ID}
            operation={operation}
            formFormData={formFormData}
            displayMod="classify"
            onConfirm={this.onConfirm}
          />
        )}
      </div>
    );
  }
}
