import React from 'react';
import { message, Calendar, Spin } from 'antd';
import PropTypes from 'prop-types';
import { getDailyRpt } from 'Util/api';
import cloneDeep from 'lodash.clonedeep';
import classNames from 'classnames';
import moment from 'moment';
import './CurMonSchedule.less';

/**
 * 当月排班
 */
export default class CurMonSchedule extends React.Component {
  static propTypes = {
    /**
     * 人员编号
     */
    pnid: PropTypes.number.isRequired,

    /**
     * 当前月份(moment 实例对象)
     */
    curMonth: PropTypes.object.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      calendarData: []
    };
  }

  componentDidMount() {
    this.getScheduleData(cloneDeep(this.props.curMonth));
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.curMonth !== this.props.curMonth) {
      this.getScheduleData(cloneDeep(nextProps.curMonth));
    }
  };

  getScheduleData = async curMonth => {
    this.setState({ loading: true });
    const { pnid } = this.props;
    const startDate = curMonth.startOf('month').format('YYYY-MM-DD');
    const endDate = curMonth.endOf('month').format('YYYY-MM-DD');
    let res;
    try {
      res = await getDailyRpt(pnid, startDate, endDate);
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    res.data.forEach(item => {
      item.WORKSTARTTIME = moment(item.WORKSTARTTIME).format('HH:mm');
      item.WORKENDTIME = moment(item.WORKENDTIME).format('HH:mm');
    });
    this.setState({ calendarData: res.data, loading: false });
  };

  renderDateCell = cellDate => {
    const { calendarData } = this.state;
    const cellDateStr = cellDate.format('YYYYMMDD');
    const curCellDate = calendarData.find(item => item.DATES === cellDateStr);
    if (curCellDate) {
      return (
        <div>
          <div
            className={classNames('cur-mon-schedule__type', {
              'cur-mon-schedule__type--rest':
                curCellDate.C3_375377576828 === '休息',
              'cur-mon-schedule__type--work':
                curCellDate.C3_375377576828 !== '休息'
            })}
          >
            {curCellDate.C3_375377576828}
          </div>
          <div className="cur-mon-schedule__time">
            {`${curCellDate.WORKSTARTTIME} - ${curCellDate.WORKENDTIME}`}
          </div>
        </div>
      );
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <div className="cur-mon-schedule">
        <Spin spinning={loading}>
          <Calendar
            dateCellRender={this.renderDateCell}
            value={this.props.curMonth}
          />
        </Spin>
      </div>
    );
  }
}
