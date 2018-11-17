import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, message, Spin } from 'antd';
import './LzStepsCTS.less';
import classNames from 'classnames';
import LzCalendar from '../LzCalendar';
import LzSelectPersons from '../LzSelectPersons';
import TeamList from '../TeamList';
import LzSteps from '../LzSteps';
import moment from 'moment';
import { getMainTableData, addRecords } from 'Util/api';
const Step = Steps.Step;
const teamResid = 593017031990; // 班组主表
const titleFieldName = 'DESCP';
const teamNumFieldName = 'SHIFTID';

/**
 * 调班管理
 */
export default class LzStepsCTS extends React.Component {
  static propTypes = {
    resid: PropTypes.number
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      currentDate: moment().format('YYYY-MM-DD'),
      personList: [], // 选择的人员列表
      teamList: [], // 班组列表
      selectedTeam: {
        num: 0, // 班组编号
        text: '' // 班组名称
      }, // 选择的班组
      stepsLoading: false
    };
    this.stepList = [
      {
        stepTitle: '选择日期',
        renderContent: this.renderSelectDate
      },
      {
        stepTitle: '选择班组',
        renderContent: this.renderTeam
      }
    ];
  }

  componentDidMount() {
    this.getTeamList();
  }

  renderSelectDate = current => {
    const { currentDate } = this.state;
    return (
      <div
        className={classNames('lz-steps-cts__2', {
          show: current === 1,
          hide: current !== 1
        })}
      >
        <LzCalendar onSelect={this.handleCalendarSelect} />
        <div
          className="lz-steps-cts__selected-date"
          style={{ textAlign: 'center' }}
        >
          当前选择日期：
          {currentDate}
        </div>
      </div>
    );
  };

  renderTeam = current => {
    const { selectedTeam, teamList } = this.state;
    return (
      <div
        className={classNames('lz-steps-cts__3', {
          show: current === 2,
          hide: current !== 2
        })}
      >
        <div className="lz-steps-cts__team-list">
          <TeamList data={teamList} onSelect={this.handleTeamSelect} />
        </div>
        <div className="lz-steps-cts__selected-team">
          当前选择班组：
          {selectedTeam.text}
        </div>
      </div>
    );
  };

  getTeamList = async () => {
    let res;
    try {
      res = await getMainTableData(teamResid);
    } catch (err) {
      message.error(err.message);
    }
    res.data.forEach(item => (item.title = item[titleFieldName]));
    this.setState({ teamList: res.data });
  };

  handleSelect = personList => {
    this.setState({ personList });
  };

  handleCalendarSelect = date => {
    this.setState({ currentDate: date.format('YYYY-MM-DD') });
  };

  handleTeamSelect = (item, index) => {
    this.setState({
      selectedTeam: { num: item[teamNumFieldName], text: item[titleFieldName] }
    });
  };

  handleComplete = async () => {
    if (!this.state.selectedTeam.text) {
      return message.error('请选择班组');
    }
    this.setState({ stepsLoading: true });
    const params = this.getParams();
    let res;
    try {
      res = await addRecords(592739481145, params, 'PNID,STARTDATE');
    } catch (err) {
      message.error(err.message);
    }
    message.success('添加成功');
    this.props.onClose && this.props.onClose();
  };

  getParams = () => {
    const { personList, selectedTeam, currentDate } = this.state;
    const params = personList.map(person => ({
      PNID: person['C3_305737857578'],
      STARTDATE: currentDate,
      DAOBAN_ID: selectedTeam.num
    }));
    return params;
  };

  render() {
    const { stepsLoading } = this.state;
    return (
      <div className="lz-steps-cts">
        <LzSteps
          stepList={this.stepList}
          onComplete={this.handleComplete}
          onSelectPerson={this.handleSelect}
          stepsLoading={stepsLoading}
        />
      </div>
    );
  }
}
