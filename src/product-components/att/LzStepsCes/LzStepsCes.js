import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, message, Spin, DatePicker } from 'antd';
import './LzStepsCes.less';
import classNames from 'classnames';
import LzCalendar from '../LzCalendar';
import LzSelectPersons from '../LzSelectPersons';
import ListWithSelect from '../ListWithSelect';
import moment from 'moment';
import LzSteps from '../LzSteps';
import { getMainTableData, addRecords } from 'Util/api';
import cloneDeep from 'lodash.clonedeep';

const Step = Steps.Step;
const { RangePicker } = DatePicker;

const cesResid = 592745383956; // 班次主表
const titleFieldName = 'WORKDAYID'; // 班次
const teamNumFieldName = 'SHIFTID';

// 班次列表
const CesList = props => {
  const headerTitle = '班次调整';
  return <ListWithSelect {...props} headerTitle={headerTitle} />;
};

/**
 * 班次调整
 */
export default class LzStepsCes extends React.Component {
  static propTypes = {
    resid: PropTypes.number
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      currentDateArr: [],
      personList: [], // 选择的人员列表
      cesList: [], // 班次列表
      selectedCes: {
        num: 0, // 班次编号
        text: '' // 班次名称
      }, // 选择的班次
      stepsLoading: false
    };
    this.stepList = [
      {
        stepTitle: '选择日期',
        renderContent: this.renderSelectDate,
        canToNext: () => {
          if (!this.state.currentDateArr.length) {
            message.error('请选择日期');
            return false;
          }
          return true;
        }
      },
      {
        stepTitle: '选择班次',
        renderContent: this.renderSelectCes
      }
    ];
  }

  componentDidMount() {
    this.getCesList();
  }

  renderSelectCes = current => {
    const { selectedCes, cesList } = this.state;
    return (
      <div
        className={classNames('lz-steps-ces__3', {
          show: current === 2,
          hide: current !== 2
        })}
      >
        <div className="lz-steps-ces__ces-list">
          <CesList data={cesList} onSelect={this.handleCesSelect} />
        </div>
        <div className="lz-steps-ces__selected-ces">
          当前选择班次：
          {selectedCes.text}
        </div>
      </div>
    );
  };

  renderSelectDate = current => {
    return (
      <div
        className={classNames('lz-steps-ces__2', {
          show: current === 1,
          hide: current !== 1
        })}
      >
        <RangePicker onChange={this.handleRangeChange} />
        <div
          className="lz-steps-ces__selected-date"
          style={{ textAlign: 'center' }}
        >
          <div>当前调整日期：</div>
          <div>
            {this.state.currentDateArr.map(date => {
              const dateString = date.format('YYYY-MM-DD');
              return <div key={dateString}>{dateString}</div>;
            })}
          </div>
        </div>
      </div>
    );
  };

  getCesList = async () => {
    let res;
    try {
      res = await getMainTableData(cesResid);
    } catch (err) {
      message.error(err.message);
    }
    res.data.forEach(item => (item.title = item['NAME']));
    this.setState({ cesList: res.data });
  };

  handleSelect = personList => {
    this.setState({ personList });
  };

  handleRangeChange = dates => {
    if (dates.length) {
      const startDate = cloneDeep(dates[0]);
      const endDate = cloneDeep(dates[1]);

      const distance = endDate.diff(startDate, 'days');
      const currentDateArr = [];
      for (let i = 0, len = distance; i <= len; i++) {
        currentDateArr.push(cloneDeep(startDate).add(i, 'day'));
      }
      this.setState({ currentDateArr });
    } else {
      this.setState({ currentDateArr: [] });
    }
  };

  handleCesSelect = (item, index) => {
    this.setState({
      selectedCes: { num: item['WORKDAYID'], text: item['NAME'] }
    });
  };

  handleComplete = async () => {
    if (!this.state.selectedCes.text) {
      return message.error('请选择班次');
    }
    const params = this.getParams();
    this.setState({ stepsLoading: true });
    let res;
    try {
      res = await addRecords(this.props.resid, params, 'PNID,C3_423664325432');
    } catch (err) {
      message.error(err.message);
    }
    message.success('添加成功');
    this.props.onClose && this.props.onClose();
  };

  getParams = () => {
    const { personList, selectedCes, currentDateArr } = this.state;
    const params = [];
    personList.forEach(person => {
      currentDateArr.forEach(date => {
        params.push({
          PNID: person['C3_305737857578'], // 人员编号
          C3_423664325432: date.format('YYYY-MM-DD'), // 调整日期
          WORKDAYID: selectedCes.num // 班次编号
        });
      });
    });
    return params;
  };

  render() {
    const stepList = this.stepList;
    return (
      <div className="lz-steps-ces">
        <LzSteps
          stepList={stepList}
          onComplete={this.handleComplete}
          onSelectPerson={this.handleSelect}
          stepsLoading={this.state.stepsLoading}
        />
      </div>
    );
  }
}
