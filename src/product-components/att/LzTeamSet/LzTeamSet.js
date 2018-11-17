import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, message, Spin, Tooltip, Calendar, Popconfirm } from 'antd';
import './LzTeamSet.less';
import classNames from 'classnames';
import LzTCList from '../LzTCList';
import {
  getMainTableData,
  getWorkdayByWorkperiodid,
  getFormData,
  delRow
} from 'Util/api';
import moment from 'moment';
import LzModal from '../../../lib/unit-component/components/LzModal';
import LzFormModalContainer from '../../../lib/unit-component/components/LzFormModalContainer';
import dealControlArr from 'Util/controls.js';

const resid = 593017031990;
const subresid = 594210947914;
const formTabsSubTableProps = [
  {
    tabName: '班次', // 标题
    componentInfo: {
      name: 'LzTable', // 组件名称
      props: {
        subresid, // 必传
        startColumnAdd: {
          mode: 'multiple'
        },
        customColumnWidth: {
          班次序号: 70,
          班次名称: 100,
          说明: 100,
          班组编号: 100,
          周班组: 130
        },
        tableInnerHeight: 352,
        editableRow: {
          mode: 'multiple'
        },
        btnsVisible: {
          edit: true,
          save: false,
          cancel: true
        },
        pagination: {
          current: 0,
          pageSize: 10
        },
        opWidth: 100
      }
    }
  }
];

/**
 * 班组设置
 */
export default class LzTeamSet extends React.Component {
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
      calendarModalVisible: false,
      calendarData: [],
      calendarValue: moment(),
      calendarLoading: false,
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

  _record = {}; // 某条班组记录
  viewTeamCalendar = (record, startDate, endDate) => {
    this.setState({ calendarModalVisible: true });
    this.getCanendarData(record, startDate, endDate);
  };

  getCanendarData = async (record, startDate, endDate) => {
    this.setState({ calendarLoading: true });
    this._record = record;
    let res;
    try {
      res = await getWorkdayByWorkperiodid(record.SHIFTID, startDate, endDate);
    } catch (err) {
      this.setState({ calendarLoading: false });
      return message.error(err.message);
    }
    this.setState({
      calendarData: res.data,
      calendarLoading: false,
      calendarValue: moment(startDate)
    });
  };

  handlePanelChange = date => {
    if (this.state.calendarValue.format('YYYY-MM') === date.format('YYYY-MM')) {
      return;
    }
    this.getCanendarData(
      this._record,
      date.startOf('month').format('YYYY-MM-DD'),
      date.endOf('month').format('YYYY-MM-DD')
    );
  };

  renderExtra = record => {
    return (
      <div className="lz-team-set__extra">
        <span className="lz-team-set__date">
          {moment(record.STARTDATES).format('YYYY-MM-DD')}
        </span>
        <Popconfirm
          title="你确定要删除该班组吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => this.delRecord(record)}
        >
          <i className="iconfont icon-del" />
        </Popconfirm>
        <Tooltip title="班组日历">
          <i
            className="iconfont icon-rili"
            onClick={() =>
              this.viewTeamCalendar(
                record,
                moment()
                  .startOf('month')
                  .format('YYYY-MM-DD'),
                moment()
                  .endOf('month')
                  .format('YYYY-MM-DD')
              )
            }
          />
        </Tooltip>
        <Tooltip title="修改班组">
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
            'lz-team-set__type': true,
            'lz-team-set__type--rest': data.workdayname === '休息',
            'lz-team-set__type--work': data.workdayname !== '休息'
          })}
        >
          {data.workdayname}
        </div>
      );
    }
  };

  renderHeaderExtra = () => {
    return (
      <div className="lz-team-set__header-extra">
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

  handleFormModalConfirm = () => {};

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
      <div className="lz-team-set">
        <Spin spinning={loading}>
          <LzTCList
            title="班组列表"
            titleFieldName="DESCP"
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
            formTabsSubTableProps={formTabsSubTableProps}
            formFormData={formFormData}
            modalWidth="100%"
            onConfirm={this.onConfirm}
            isGetFormDefaultValues
          />
        )}
      </div>
    );
  }
}
