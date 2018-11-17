import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Steps, message } from 'antd';
import './LzStepsPi.less';
import classNames from 'classnames';
import ListWithSelect from '../ListWithSelect';
import LzSteps from '../LzSteps';
import moment from 'moment';
import { getMainTableData, addRecords } from 'Util/api';

const plResid = 593255133996; // 产线主表
const titleFieldName = 'C3_593254711841';
const NumFieldName = 'C3_593254658789';

const PlList = props => {
  const headerTitle = '产线列表';
  return <ListWithSelect {...props} headerTitle={headerTitle} />;
};

/**
 * 人员信息 批量添加记录
 */
export default class LzStepsPi extends React.Component {
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
      plList: [], // 班组列表
      selectedPl: {
        num: 0, // 班组编号
        text: '' // 班组名称
      }, // 选择的班组
      stepsLoading: false
    };
    this.stepList = [
      {
        stepTitle: '选择产线',
        renderContent: this.renderProductLine
      }
    ];
  }

  componentDidMount() {
    this.getPlList();
  }

  renderProductLine = current => {
    const { selectedPl, plList } = this.state;
    return (
      <div
        className={classNames('lz-steps-pi__2', {
          show: current === 1,
          hide: current !== 1
        })}
      >
        <div className="lz-steps-pi__team-list">
          <PlList data={plList} onSelect={this.handlePlSelect} />
        </div>
        <div className="lz-steps-pi__selected-pl">
          当前选择的产线：
          {selectedPl.text}
        </div>
      </div>
    );
  };

  getPlList = async () => {
    let res;
    try {
      res = await getMainTableData(plResid);
    } catch (err) {
      message.error(err.message);
    }
    res.data.forEach(item => (item.title = item[titleFieldName]));
    this.setState({ plList: res.data });
  };

  handleSelect = personList => {
    this.setState({ personList });
  };

  handleCalendarSelect = date => {
    this.setState({ currentDate: date.format('YYYY-MM-DD') });
  };

  handlePlSelect = (item, index) => {
    this.setState({
      selectedPl: { num: item[NumFieldName], text: item[titleFieldName] }
    });
  };

  handleComplete = async () => {
    if (!this.state.selectedPl.text) {
      return message.error('请选择产线');
    }
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
  };

  getParams = () => {
    const { personList, selectedPl, currentDate } = this.state;
    const params = personList.map(person => ({
      C3_305737857578: person.C3_305737857578, // 人员编号
      C3_227192472953: person.C3_227192472953, // 员工工号
      C3_227192484125: person.C3_227192484125, // 员工姓名
      HRUSER_DEPID: person.HRUSER_DEPID, // 部门编号
      C3_593255037926: selectedPl.text // 产线名称
    }));
    return params;
  };

  render() {
    const { stepsLoading } = this.state;
    return (
      <div className="lz-steps-pi">
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
