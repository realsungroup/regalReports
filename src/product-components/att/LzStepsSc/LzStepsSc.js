import React from 'react';
import PropTypes from 'prop-types';
import { message, DatePicker, Form, Input, TimePicker } from 'antd';
import './LzStepsSc.less';
import classNames from 'classnames';
import LzSteps from '../LzSteps';
import { addRecords } from 'Util/api';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

/**
 * 刷卡登记批量添加
 */
class LzStepsSc extends React.Component {
  static propTypes = {
    resid: PropTypes.number.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      personList: [], // 选择的人员列表
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      BZ: '', // 说明
      stepsLoading: false
    };
    this.stepList = [
      {
        stepTitle: '填写信息',
        renderContent: this.renderFillInInfo
      }
    ];
  }

  componentDidMount() {}

  startDateChange = date => {
    this.setState({ startDate: date });
  };
  startTimeChange = time => {
    this.setState({ startTime: time });
  };
  endDateChange = date => {
    this.setState({ endDate: date });
  };
  endTimeChange = time => {
    this.setState({ endTime: time });
  };
  textAraeChange = e => {
    this.setState({ BZ: e.target.value });
  };

  renderFillInInfo = current => {
    const { BZ, startDate, startTime, endDate, endTime } = this.state;
    return (
      <div
        className={classNames('lz-steps-sc__3', {
          show: current === 1,
          hide: current !== 1
        })}
      >
        <Form>
          <FormItem label="上班刷卡时间">
            <div>
              <DatePicker value={startDate} onChange={this.startDateChange} />
              <TimePicker value={startTime} onChange={this.startTimeChange} />
            </div>
          </FormItem>
          <FormItem label="上班刷卡时间">
            <div>
              <DatePicker value={endDate} onChange={this.endDateChange} />
              <TimePicker value={endTime} onChange={this.endTimeChange} />
            </div>
          </FormItem>
          <FormItem label="说明">
            <TextArea value={BZ} onChange={this.textAraeChange} />
          </FormItem>
        </Form>
      </div>
    );
  };

  handleSelect = personList => {
    this.setState({ personList });
  };

  isValid = () => {
    const { BZ, startDate, startTime, endDate, endTime } = this.state;
    if ((startDate && startTime) || (endDate && endTime)) {
      return true;
    }
    return false;
  };

  handleComplete = async () => {
    if (this.isValid()) {
      this.setState({ stepsLoading: true });
      const params = this.getParams();
      let res;
      try {
        res = await addRecords(this.props.resid, params);
      } catch (err) {
        message.error(err.message);
      }
      message.success('添加成功');
      this.props.onClose && this.props.onClose();
    } else {
      message.error('开始刷卡时间和结束刷卡时间至少选择一项');
    }
  };

  getParams = () => {
    const { personList } = this.state;
    const { BZ, startDate, startTime, endDate, endTime } = this.state;
    const params = [];
    personList.forEach(person => {
      if (startDate) {
        params.push({
          PNID: person['C3_305737857578'],
          TIMES:
            startDate.format('YYYY-MM-DD') + ' ' + startTime.format('HH:mm:ss'),
          BZ
        });
      }
      if (endDate) {
        params.push({
          PNID: person['C3_305737857578'],
          TIMES:
            endDate.format('YYYY-MM-DD') + ' ' + endTime.format('HH:mm:ss'),
          BZ
        });
      }
    });
    return params;
  };

  render() {
    const stepList = this.stepList;
    return (
      <div className="lz-steps-sc">
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
export default Form.create()(LzStepsSc);
