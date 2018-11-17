import React from 'react';
import {
  message,
  DatePicker,
  Form,
  Progress,
  Button,
  Icon,
  Checkbox
} from 'antd';
import './LzDataAnalyse.less';
import classNames from 'classnames';
import LzSteps from '../LzSteps';
import {
  processDailyReportService,
  processDailyReportPost,
  getProcessStatus,
  terminateTask
} from 'Util/api';
import PropTypes from 'prop-types';

const { RangePicker, MonthPicker } = DatePicker;
const FormItem = Form.Item;
/**
 * 数据分析
 */
class LzDataAnalyse extends React.Component {
  static propTypes = {
    resid: PropTypes.number,
    pnidcolname: PropTypes.string
  };

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      stepsLoading: false,
      hasTaskRunning: false,
      taskId: 0, // 正在进行处理任务的 id
      isLoaded: false, // 是否获取了初始化的数据
      percent: 0, // 进度
      total: 0, // 总数
      completeCount: 0, // 完成的数量
      isTaskComplete: false, // 任务是否完成
      timeConsume: 0, // 耗时
      errMessage: '', // 错误信息

      // 状态：
      // 'selectType' 选择类型状态；
      // 'selectPartPerson' 选择部分人员状态；
      // 'selectAllPerson' 选择全部人员状态；
      // 'taskRunning' 正在处理任务状态
      status: 'selectType',

      errMsgVisible: false // 错误信息是否显示
    };
    this.stepList = [
      {
        stepTitle: '选择日期',
        renderContent: this.renderForm
      }
    ];
  }

  componentDidMount = () => {
    this.getIsHasTaskRunning();
  };

  componentWillUnmount = () => {
    console.log('analyse will un mount');
    this.getTaskStatus = null;
  };

  getIsHasTaskRunning = async () => {
    let res;
    try {
      res = await processDailyReportService();
    } catch (err) {
      message.error(err.message);
    }
    if (res.Error !== 0) {
      return message.error('出错');
    }

    // 没有任务
    if (!res.data.length) {
      return this.setState({
        taskId: 0,
        hasTaskRunning: false,
        isLoaded: true,
        status: 'selectType'
      });
    }
    const pArr = res.data.map(taskId => getProcessStatus(taskId));

    let pArrRes;
    try {
      pArrRes = await Promise.all(pArr);
    } catch (err) {
      return message.error(err.message);
    }

    // 有未完成的任务
    const unFinishedTaskIndex = pArrRes.findIndex(res => !res.data.IsCompleted);
    if (unFinishedTaskIndex !== -1) {
      const taskId = res.data[unFinishedTaskIndex];
      this.setState({
        taskId,
        hasTaskRunning: true,
        isLoaded: true,
        status: 'taskRunning'
      });
      this.getTaskStatus(taskId);

      // 没有未完成的任务
    } else {
      this.setState({
        taskId: 0,
        hasTaskRunning: false,
        isLoaded: true
      });
    }
  };

  renderForm = current => {
    return (
      <div
        className={classNames('lz-data-analyse__2', {
          show: current === 1,
          hide: current !== 1
        })}
      >
        {this.renderFormContent()}
      </div>
    );
  };

  renderFormContent = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <FormItem label="开始结束日期">
          {getFieldDecorator('startEndDate', {
            rules: [{ required: true, message: '请选择开始结束日期' }]
          })(<RangePicker />)}
        </FormItem>
        <FormItem label="年月">
          {getFieldDecorator('yearMonth')(<MonthPicker />)}
        </FormItem>
      </Form>
    );
  };

  handleSelect = personList => {
    this.setState({ personList });
  };

  getTaskStatus = taskId => {
    if (taskId === 0) {
      return;
    }
    this.timer = setTimeout(async () => {
      let res;
      try {
        res = await getProcessStatus(taskId);
      } catch (err) {
        window.clearTimeout(this.timer);
        return message.error(err.message);
      }
      if (res.Error !== 0) {
        return message.error(res.message);
      }
      this.setState({
        total: res.data.TotalNumber,
        completeCount: res.data.CallbackCounts,
        errMessage: res.data.ErrMessage,
        timeConsume: res.data.TimeOfSecondsTaken
      });
      if (!res.data.IsCompleted) {
        this.getTaskStatus && this.getTaskStatus(this.state.taskId);
      } else {
        message.success('任务已完成！');
        this.setState({
          isTaskComplete: true,
          completeCount: this.state.total
        });
      }
    }, 1000);
  };

  handleComplete = () => {
    const { validateFields } = this.props.form;
    validateFields(async (err, values) => {
      if (!err) {
        this.setState({ stepsLoading: true });
        const params = this.getParams(values);
        let res;
        try {
          res = await processDailyReportPost(params);
        } catch (err) {
          return message.error(err.message);
        }
        if (res.Error === 0) {
          this.setState({
            taskId: res.data,
            hasTaskRunning: true,
            status: 'taskRunning',
            stepsLoading: false,
            total: 0,
            completeCount: 0,
            isTaskComplete: false
          });
          this.getTaskStatus(res.data);
        }
      }
    });
  };

  getParams = values => {
    const { status } = this.state;
    const date1 = values.startEndDate[0].format('YYYY-MM-DD');
    const date2 = values.startEndDate[1].format('YYYY-MM-DD');
    const yearmonth = values.yearMonth && values.yearMonth.format('YYYYMM');
    let pnids, isall;

    // 选择部分人
    if (status === 'selectPartPerson') {
      const { personList } = this.state;
      pnids = personList.map(person => person.C3_305737857578).join(',');
      // 选择所有人
    } else if (status === 'selectAllPerson') {
      isall = 'Y';
      pnids = '111';
    }

    const { resid, pnidcolname } = this.props;

    return {
      ...(pnids ? { pnids } : null),
      ...(yearmonth ? { yearmonth } : null),
      ...(isall ? { isall } : null),
      ...(resid ? { resid } : null),
      ...(pnidcolname ? { pnidcolname } : null),
      date1,
      date2,
      batchsize: 10
    };
  };

  terminateTask = async () => {
    const { taskId } = this.state;
    let res;
    try {
      res = await terminateTask(taskId);
    } catch (err) {
      return message.error(err.message);
    }
    if (res.Error !== 0) {
      return message.error(res.message);
    }
    message.success('成功终止任务');
    clearTimeout(this.timer);
    this.setState({ hasTaskRunning: false, taskId: 0, status: 'selectType' });
  };

  handleSelectPartPerson = () => {
    this.setState({ status: 'selectPartPerson' });
  };

  handleSelectAllPerson = () => {
    this.setState({ status: 'selectAllPerson' });
  };

  handleBack = () => {
    this.setState({ status: 'selectType' });
  };

  handleCheckboxChange = e => {
    this.setState({ errMsgVisible: e.target.checked });
  };

  renderContent = () => {
    const { status } = this.state;

    // 处于选择部分还是全部的状态
    if (status === 'selectType') {
      return (
        <div className="lz-data-analyse__select-type">
          <Button type="primary" onClick={this.handleSelectPartPerson}>
            选择部分人员
          </Button>
          <Button type="primary" onClick={this.handleSelectAllPerson}>
            选择全部人员
          </Button>
        </div>
      );
    }

    // 处于选择部分人员状态
    if (status === 'selectPartPerson') {
      const { stepsLoading } = this.state;
      return (
        <div className="lz-data-analyse__select-part">
          <Button
            onClick={this.handleBack}
            className="lz-data-analyse__back-btn"
          >
            返回
          </Button>
          <LzSteps
            stepList={this.stepList}
            onComplete={this.handleComplete}
            onSelectPerson={this.handleSelect}
            stepsLoading={stepsLoading}
          />
        </div>
      );
    }

    // 处于选择所有人员状态
    if (status === 'selectAllPerson') {
      return (
        <div className="lz-data-analyse__select-all">
          <Button
            onClick={this.handleBack}
            className="lz-data-analyse__back-btn"
          >
            返回
          </Button>
          <div className="lz-data-analyse__select-all-form">
            <Button type="primary">
              <Icon type="check" theme="outlined" />
              已选择全部人员
            </Button>
            {this.renderFormContent()}
            <Button type="primary" onClick={this.handleComplete}>
              完成
            </Button>
          </div>
        </div>
      );
    }

    // 处于正在选择任务状态
    if (status === 'taskRunning') {
      const {
        completeCount,
        total,
        isTaskComplete,
        errMessage,
        timeConsume,
        errMsgVisible
      } = this.state;
      let percent = 0;
      if (total) {
        percent = Math.floor((completeCount / total) * 100);
      }
      let status = 'active';
      if (percent === 100) {
        status = 'success';
      }
      return (
        <div className="lz-data-analyse__progress-wrap">
          <div style={{ marginBottom: 20 }}>
            <span className="lz-data-analyse__time-consume">
              耗时：
              {timeConsume < 0 ? 0 : timeConsume} 秒
            </span>
          </div>
          <Progress
            width={240}
            type="circle"
            percent={percent}
            status={status}
            strokeColor={'#5b3c7c'}
          />
          <div style={{ marginTop: 20 }}>
            {completeCount} / {total}
          </div>
          {isTaskComplete ? (
            <Button
              style={{ marginTop: 20 }}
              type="primary"
              onClick={() =>
                this.setState({
                  hasTaskRunning: false,
                  taskId: 0,
                  isTaskComplete: false,
                  status: 'selectType',
                  timeConsume: 0
                })
              }
            >
              继续
            </Button>
          ) : (
            <Button
              style={{ marginTop: 20 }}
              type="primary"
              onClick={this.terminateTask}
            >
              终止任务
            </Button>
          )}
          <div style={{ marginTop: 20 }}>
            <Checkbox
              value={errMsgVisible}
              onChange={this.handleCheckboxChange}
            >
              显示错误信息
            </Checkbox>
          </div>

          {errMsgVisible && <div>{errMessage}</div>}
        </div>
      );
    }
  };

  render() {
    if (!this.state.isLoaded) {
      return (
        <div className="lz-data-analyse">
          <div style={{ textAlign: 'center' }}>加载中...</div>
        </div>
      );
    }
    return <div className="lz-data-analyse">{this.renderContent()}</div>;

    // // 有任务正在处理
    // if (this.state.hasTaskRunning) {
    //   const {
    //     completeCount,
    //     total,
    //     isTaskComplete,
    //     errMessage,
    //     timeConsume
    //   } = this.state;
    //   let percent = 0;
    //   if (total) {
    //     percent = Math.floor((completeCount / total) * 100);
    //   }
    //   let status = 'active';
    //   if (percent === 100) {
    //     status = 'success';
    //   }
    //   return (
    //     <div className="lz-data-analyse">
    //       <div className="lz-data-analyse__progress-wrap">
    //         <div style={{ marginBottom: 20 }}>
    //           <span className="lz-data-analyse__time-consume">
    //             耗时：
    //             {timeConsume} 秒
    //           </span>
    //         </div>
    //         <Progress
    //           width={240}
    //           type="circle"
    //           percent={percent}
    //           status={status}
    //           strokeColor={'#5b3c7c'}
    //         />
    //         <div style={{ marginTop: 20 }}>
    //           {completeCount} / {total}
    //         </div>
    //         {isTaskComplete ? (
    //           <Button
    //             style={{ marginTop: 20 }}
    //             type="primary"
    //             onClick={() =>
    //               this.setState({
    //                 hasTaskRunning: false,
    //                 taskId: 0,
    //                 isTaskComplete: false
    //               })
    //             }
    //           >
    //             继续选择
    //           </Button>
    //         ) : (
    //           <Button
    //             style={{ marginTop: 20 }}
    //             type="primary"
    //             onClick={this.terminateTask}
    //           >
    //             终止任务
    //           </Button>
    //         )}
    //         <div>{errMessage}</div>
    //       </div>
    //     </div>
    //   );

    //   // 没有任务正在处理
    // } else {
    //   return (
    //     <div className="lz-data-analyse">
    //       <LzSteps
    //         stepList={this.stepList}
    //         onComplete={this.handleComplete}
    //         onSelectPerson={this.handleSelect}
    //         stepsLoading={this.state.stepsLoading}
    //       />
    //     </div>
    //   );
    // }
  }
}
export default Form.create()(LzDataAnalyse);
