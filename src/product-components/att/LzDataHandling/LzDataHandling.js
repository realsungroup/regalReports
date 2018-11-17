import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { message, List, Tooltip, Progress, Button } from 'antd';
import './LzDataHandling.less';
import {
  getAutoImportStatus,
  retrieveAutoImports,
  runAutoImport
} from 'Util/api';
// import EChartsOfReact from './EChartsOfReact';

/**
 * 数据处理
 */
export default class LzDataHandling extends React.Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      taskList: [], // 任务列表
      taskId: 0, // 当前正在进行的任务 id
      // 状态：
      // 'nonTaskRunning' 没有任务正在进行处理；
      // 'taskRunning' 有任务正在进行处理
      // 'taskComplete' 任务已完成
      status: 'nonTaskRunning',
      loaded: true, // 数据是否加载完毕

      curTaskTitle: '', // 当前正在处理任务的标题
      totalIndex: 0, // 任务总进度
      curIndex: 0, // 当前任务进度
      isTaskComplete: false // 当前任务是否已完成
    };
  }

  async componentDidMount() {
    this.setState({ loaded: false });
    await this.getRunningTask();
    this.setState({ loaded: true });
  }

  componentWillUnmount = () => {
    this.timer = null;
    this.getTaskInfo = null;
  };

  getRunningTask = async () => {
    let res;
    try {
      res = await getAutoImportStatus();
    } catch (err) {
      return message.error(err.message);
    }

    // 没有任务正在进行处理
    if (res.error !== 0 || res.IsComplete) {
      return this.getTaskList();

      // 有任务正在进行处理
    } else {
      this.setState({
        loaded: true,
        status: 'taskRunning',
        taskId: res.data.UniID,
        totalIndex: res.data.Total,
        curIndex: res.data.Index,
        curTaskTitle: res.data.Title
      });

      this.getTaskInfo();
    }
  };

  getTaskList = async () => {
    let res;
    try {
      res = await retrieveAutoImports();
    } catch (err) {
      return message.error(err.message);
    }
    if (res.error === 0) {
      this.setState({
        status: 'nonTaskRunning',
        taskList: res.data
      });
    }
  };

  handleStartDealTask = async taskId => {
    let res;
    try {
      res = await runAutoImport(taskId);
    } catch (err) {
      return message.error(err.message);
    }
    if (res.error !== 0) {
      return message.error(res.message);
    }
    if (res.error === 0) {
      message.success('开始处理该任务');
      this.setState({ status: 'taskRunning' });
      this.getTaskInfo();
    }
  };

  getTaskInfo = async () => {
    let res;
    try {
      res = await getAutoImportStatus();
    } catch (err) {
      return message.error(err.message);
    }
    if (res.error !== 0) {
      return message.error(res.message);
    }
    // 当前任务已完成
    if (res.IsComplete) {
      message.success('已完成');
      this.setState({
        isTaskComplete: true,
        curIndex: this.state.totalIndex,
        status: 'taskRunning'
      });
      // 当前任务未完成
    } else {
      this.setState({
        totalIndex: res.data.Total,
        curIndex: res.data.Index,
        curTaskTitle: res.data.Title
      });
      this.timer = setTimeout(async () => {
        if (this.getTaskInfo) {
          await this.getTaskInfo();
        }
      }, 1000);
    }
  };

  handleNextClick = () => {
    this.setState({
      status: 'nonTaskRunning',
      isTaskComplete: false,
      curIndex: 0,
      totalIndex: 0,
      taskId: 0,
      curTaskTitle: ''
    });
    this.getTaskList();
  };

  renderContent = () => {
    if (!this.state.loaded) {
      return <div className="lz-data-handling__loading">加载中...</div>;
    }

    const { status } = this.state;
    // 当前没有正在处理的任务，显示任务列表
    if (status === 'nonTaskRunning') {
      return this.renderList();
    }
    // 有正在处理的任务，显示该任务进度条
    if (status === 'taskRunning') {
      return this.renderTaskProgress();
    }
  };

  renderList = () => {
    const { taskList } = this.state;
    return (
      <div className="lz-data-handling__task-list">
        <List
          itemLayout="horizontal"
          bordered
          dataSource={taskList}
          renderItem={task => (
            <List.Item>
              <List.Item.Meta title={task.AUTOI_TITLE} />
              <Tooltip title="开始处理任务">
                <i
                  className="iconfont icon-kaishi"
                  onClick={() => this.handleStartDealTask(task.AUTOI_ID)}
                />
              </Tooltip>
            </List.Item>
          )}
        />
      </div>
    );
  };

  renderTaskProgress = () => {
    const { totalIndex, curIndex, isTaskComplete, curTaskTitle } = this.state;

    let percent = 0;
    if (totalIndex) {
      percent = Math.floor((curIndex / totalIndex) * 100);
    }
    return (
      <div className="lz-data-handling__dealing">
        <h2 style={{ marginBottom: 20 }}>{curTaskTitle}</h2>
        <Progress width={240} type="circle" percent={percent} />
        <div style={{ marginTop: 20 }}>
          {curIndex} / {totalIndex}
        </div>
        {isTaskComplete && (
          <Button
            style={{ marginTop: 20 }}
            type="primary"
            onClick={this.handleNextClick}
          >
            继续
          </Button>
        )}
      </div>
    );
  };

  render() {
    return <div className="lz-data-handling">{this.renderContent()}</div>;
  }
}
