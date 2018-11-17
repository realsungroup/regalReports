import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox, Icon, message, Button, Spin } from 'antd';
import {
  getTasks,
  getModuleDefineData,
  getTaskData,
  getFormData,
  getButtons
} from 'Util/api';
import { wrapStr } from 'Util/stringUtil';
import './TaskNoticeBody.less';
import HalfPanel from '../../components/HalfPanel';
import classNames from 'classnames';
import LzForm from '../../../lib/unit-component/components/LzForm';
import dealControlArr from 'Util/controls';
import LzTabs from '../../../lib/unit-component/LzTabs';
import { extractAndDealBackendBtns } from '../../../util/backendBtns';
import LzBackendBtn from 'UnitComponent/components/LzBackendBtn';
import printJS from 'print-js';

const customLzTableStyle = {
  position: 'static',
  transform: 'none'
};
class TaskNoticeBody extends React.Component {
  constructor(props) {
    super(props);

    // 待处理
    this.todoPageSize = 10; // 每页条数
    this.todoCurrent = 0; // 当前页数（第一页为0）
    this.todoTotal = 0; // 数量
    this.todoTotalPage = 0; // 总页数

    // 已处理
    this.handledPageSize = 10; // 每页条数
    this.handledCurrent = 0; // 当前页数（第一页为0）
    this.handledTotal = 0; // 数量
    this.handledTotalPage = 0; // 总页数

    // resid
    this.todoResid = 576325914269;
    this.handledResid = 576413832454;

    // 被选择的任务
    this.selectedTasks = [];

    this.state = {
      taskLoading: true,

      todoTasks: [], // 待处理任务列表
      handledTasks: [], // 已处理任务列表

      todoRecid: '', // 待处理任务列表中被选中的任务的 recid
      handledRecid: '', // 已处理任务列表中被选中的任务的 recid

      headerTabName: 'todo', // 被选中的 tab 名称： 'todo' 待处理；'handled' 已处理

      detailTask: {}, // 显示在右侧的被选中的任务

      allTodoTasksChecked: false,
      record: {}, // 表头记录
      formFormData: {
        subTableArr: [],
        allControlArr: [],
        canOpControlArr: [],
        containerControlArr: []
      },
      tabPanes: [], // LzTabs 组件所需的 props

      todoBackEndBtnsMultiple: [], // 待处理 后端按钮
      handledBackEndBtnsMultiple: [], // 已处理 后端按钮
      checkedIndexArr: [], // 被选中任务的索引
      selectedTasks: [], // 被选中的任务
      isSelectedAll: false, // 是否全选中
      backEndBtnsSingle: [], // 某条记录的后端按钮
      mainHeadResid: 0, // 表头表单所对应的 resid
      scaleStatus: 'normal' // 缩放状态
    };
  }

  async componentDidMount() {
    await this.loadModuleDefineData();
    this.loadTasks(undefined, 'first');
    this.getBackendBtns();
  }

  getBackendBtns = async () => {
    let res;
    try {
      res = await Promise.all([
        getButtons(this.todoResid),
        getButtons(this.handledResid)
      ]);
    } catch (err) {
      message.error(err.message);
    }
    const {
      backEndBtnsMultiple: todoBackEndBtnsMultiple
    } = extractAndDealBackendBtns(res[0].data);
    const {
      backEndBtnsMultiple: handledBackEndBtnsMultiple
    } = extractAndDealBackendBtns(res[1].data);

    this.setState({ todoBackEndBtnsMultiple, handledBackEndBtnsMultiple });
  };

  handleSwitchHeaderTab = key => {
    this.setState(
      { headerTabName: key, selectedTasks: [], isSelectedAll: false },
      () => {
        const {
          headerTabName,
          todoRecid,
          handledRecid,
          todoTasks,
          handledTasks
        } = this.state;
        let recid, taskList;
        if (headerTabName === 'todo') {
          recid = todoRecid;
          taskList = todoTasks;
        } else if (headerTabName === 'handled') {
          recid = handledRecid;
          taskList = handledTasks;
        }
        const task = taskList.find(task => task.REC_ID === recid);
        this.chooseTask(task);
      }
    );
  };

  handleCheckTodoTask = ({ taskId, checked }) => {
    const { todoTasks, allTodoTasksChecked } = this.state;

    const nextTodoTasks = todoTasks.map(task => {
      if (task.REC_ID === taskId) {
        return { ...task, checked };
      }
      return task;
    });

    let allChecked = allTodoTasksChecked;
    if (!allChecked && nextTodoTasks.every(task => task.checked)) {
      allChecked = true;
    }
    if (allChecked && nextTodoTasks.some(task => !task.checked)) {
      allChecked = false;
    }

    this.setState({
      todoTasks: nextTodoTasks,
      allTodoTasksChecked: allChecked
    });
  };

  handleCheckAllTodoTasks = e => {
    const {
      target: { checked }
    } = e;
    const { todoTasks } = this.state;
    this.setState({
      allTodoTasksChecked: checked,
      todoTasks: todoTasks.map(task => ({ ...task, checked: checked }))
    });
  };

  findTodoTask = () => {
    const {
      todoTasks,
      recordTasks,
      activeTodoTask,
      activeRecordTask,
      headerTabName
    } = this.state;
    let tasks = todoTasks;
    let activeTask = activeTodoTask;
    if (headerTabName === 'record') {
      tasks = recordTasks;
      activeTask = activeRecordTask;
    }
    let targetTask = null;

    tasks.some(task => {
      targetTask = task;
      return task.REC_ID === activeTask;
    });

    return targetTask;
  };

  getCmswhere = () => {
    const {
      match: {
        params: { taskCatalog, taskType }
      }
    } = this.props;
    return `taskCatalog=${wrapStr(taskCatalog, "'")} and taskType=${wrapStr(
      taskType,
      "'"
    )}`;
  };

  /**
   * 加载任务
   *
   * @param {string} taskType 任务类型：'todo' 待处理，'handled' 已处理；如果不传，则表示获取两种类型的任务
   * @param {string} mode 加载任务数据的模式：'first' 第一次加载数据 | 'reload' 重新加载本页数据 | 'nextload' 加载下一页数据
   */
  loadTasks = async (taskType, mode = 'first') => {
    this.setState({ taskLoading: true });
    let isLoadTodoTasks = true,
      isLoadHandledTasks = true;
    if (taskType === 'handled') {
      isLoadTodoTasks = false;
    }
    if (taskType === 'todo') {
      isLoadHandledTasks = false;
    }
    const cmswhere = this.getCmswhere();
    // 获取待处理任务
    if (isLoadTodoTasks) {
      let res,
        pageSize = this.todoPageSize,
        current = this.todoCurrent;
      if (mode === 'reload') {
        current = 0;
        pageSize = (this.todoCurrent + 1) * this.todoPageSize;
      }
      if (mode === 'nextload') {
        current = this.todoCurrent + 1;
      }
      try {
        res = await getTasks(this.todoResid, cmswhere, current, pageSize);
      } catch (err) {
        message.error(err.message);
      }
      if (res.error) {
        return message.error('获取待处理任务出错');
      }
      if (mode === 'first') {
        this.todoTotal = res.total;
        this.todoTotalPage = Math.ceil(this.todoTotal / this.todoPageSize);
        const firstTask = res.data[0];
        this.setState({
          taskLoading: false,
          todoTasks: res.data,
          todoRecid: firstTask && firstTask.REC_ID
        });
        this.chooseTask(firstTask);
      } else if (mode === 'nextload') {
        this.todoCurrent++;
        this.todoTotal = res.total;
        this.todoTotalPage = Math.ceil(this.todoTotal / this.todoPageSize);
        this.setState({
          taskLoading: false,
          todoTasks: [...this.state.todoTasks, ...res.data]
        });
      } else if (mode === 'reload') {
        const firstTask = res.data[0];
        let todoRecid = this.state.todoRecid;
        if (!res.data.some(task => task.REC_ID === todoRecid)) {
          todoRecid = firstTask.REC_ID;
        }

        const selectedTask = res.data.find(item => item.REC_ID === todoRecid);
        this.chooseTask(selectedTask);

        this.setState({
          taskLoading: false,
          todoTasks: res.data,
          selectedTasks: [],
          todoRecid,
          isSelectedAll: false
        });
      }
    }

    // 获取已处理任务
    if (isLoadHandledTasks) {
      let res,
        pageSize = this.handledPageSize,
        current = this.handledCurrent;
      if (mode === 'reload') {
        current = 0;
        pageSize = (this.handledCurrent + 1) * this.handledPageSize;
      }
      if (mode === 'nextload') {
        current = this.handledCurrent + 1;
      }
      try {
        res = await getTasks(this.handledResid, cmswhere, current, pageSize);
      } catch (err) {
        message.error(err.message);
      }
      if (res.error) {
        return message.error('获取待处理任务出错');
      }
      if (mode === 'first') {
        this.handledTotal = res.total;
        this.handledTotalPage = Math.ceil(
          this.handledTotal / this.handledPageSize
        );
        const firstTask = res.data[0];
        this.setState({
          taskLoading: false,
          handledTasks: res.data,
          handledRecid: firstTask && firstTask.REC_ID
        });
        // this.chooseTask(firstTask);
      } else if (mode === 'nextload') {
        this.handledCurrent++;
        this.handledTotal = res.total;
        this.handledTotalPage = Math.ceil(
          this.handledTotal / this.handledPageSize
        );
        this.setState({
          taskLoading: false,
          handledTasks: [...this.state.handledTasks, ...res.data]
        });
      } else if (mode === 'reload') {
        const firstTask = res.data[0];
        let handledRecid = this.state.handledRecid;
        if (!res.data.some(task => task.REC_ID === handledRecid)) {
          handledRecid = firstTask.REC_ID;
        }
        this.setState({
          taskLoading: false,
          handledTasks: res.data,
          selectedTasks: [],
          handledRecid,
          isSelectedAll: false
        });
      }
    }
  };

  getStartIndexArr = (tasks, pageSize) => {
    const startIndexArr = [];
    const { selectedTasks } = this.state;
    selectedTasks.forEach(selectedTask => {
      let index;
      if (
        (index =
          tasks.findIndex(task => task.REC_ID === selectedTask.REC_ID) !== -1)
      ) {
        startIndexArr.push(Math.floor(index / pageSize));
      }
    });
    return startIndexArr;
  };

  /**
   * 获取任务列表
   *
   * @param {string} taskType 任务类型：'todo' 待处理，'handled' 已处理
   * @param {number} resid 表 id
   * @param {string} cmswhere 条件语句
   * @param {number} current 当前页数
   * @param {number} pageSize 每页条数
   */
  getTasks = async (
    taskType,
    resid,
    cmswhere,
    current,
    pageSize,
    isFirstLoad
  ) => {
    let res;
    try {
      res = await getTasks(resid, cmswhere, current, pageSize);
    } catch (err) {
      this.setState({
        taskLoading: false
      });
      return console.error(err);
    }
    if (!res.error) {
      const firstTask = res.data[0];
      if (taskType === 'todo') {
        this.todoCurrent++;
        this.todoTotal = res.total;
        this.todoTotalPage = Math.ceil(this.todoTotal / this.todoPageSize);
        this.setState({
          taskLoading: false,
          todoTasks: [...this.state.todoTasks, ...res.data],
          todoRecid:
            this.state.todoRecid || (firstTask && firstTask.REC_ID) || ''
        });
        // 如果是第一次加载，则默认选中第一个任务
        if (isFirstLoad) {
          this.chooseTask(firstTask);
          // 待处理
          this.todoPageSize = 10; // 每页条数
          this.todoCurrent = 0; // 当前页数（第一页为0）
          this.todoTotal = 0; // 数量
          this.todoTotalPage = 0; // 总页数
        }
      } else if (taskType === 'handled') {
        this.handledCurrent++;
        this.handledTotal = res.total;
        this.handledTotalPage = Math.ceil(
          this.handledTotal / this.handledPageSize
        );
        this.setState({
          taskLoading: false,
          handledTasks: [...this.state.handledTasks, ...res.data],
          handledRecid:
            this.state.handledRecid || (firstTask && firstTask.REC_ID) || ''
        });
      }
    }
  };

  // 加载模板定义数据
  moduleDefineData = []; // 模板定义数据
  loadModuleDefineData = async () => {
    const loadModuleDefineData = getModuleDefineData();
    // 获取模板定义数据
    try {
      const res = await loadModuleDefineData;
      this.moduleDefineData = res.data;
    } catch (err) {
      console.error(err);
    }
  };

  // 选择一个 task
  chooseTask = async task => {
    if (!task) {
      this.setState({ record: {}, tabPanes: [], backEndBtnsSingle: [] });
      return;
    }
    this.setState({ taskLoading: true });
    // 获取 task 业务数据（用于 LzForm 的 record props）
    let taskDataRes;
    try {
      taskDataRes = await getTaskData(task.hostResid, task.hostRecid);
    } catch (err) {
      return console.error(err);
    }

    // 找到该任务的模板定义
    const taskTmpId = task.taskTmpId;
    const moduleDefine = this.moduleDefineData.find(
      moduleDefine => moduleDefine.taskTmpId === taskTmpId
    );
    // 获取表头的窗体设计数据
    let formDataRes, res;
    const mainHeadResid = moduleDefine.mainHeadResid;
    const mainHeadFormName = moduleDefine.mainHeadFormName;
    try {
      res = await Promise.all([
        getFormData(mainHeadResid, mainHeadFormName),
        getButtons(mainHeadResid)
      ]);
    } catch (error) {
      return console.error(error);
    }
    formDataRes = res[0];
    const { backEndBtnsSingle } = extractAndDealBackendBtns(res[1].data);
    const formFormData = dealControlArr(formDataRes.data.columns);

    // 渲染子表
    const tablePropsList = moduleDefine['577032828607'];
    let tabPanes = [];

    // 本表的窗体设计数据（表单）
    const pArr = tablePropsList.map(tableProps => {
      return getFormData(tableProps.dataSourceResid, tableProps.dataSourceForm);
    });
    let pArrRes;
    try {
      pArrRes = await Promise.all(pArr);
    } catch (err) {
      console.error(err);
    }
    const formFormDataArr = pArrRes.map(item =>
      dealControlArr(item.data.columns)
    );

    if (!tablePropsList.length) {
      message.error('无本表和子表数据');
    } else {
      tablePropsList.forEach((tableProps, index) => {
        let obj = {
          tabName: tableProps.tabTitle
        };
        let componentInfo;
        if (tableProps.dataSourceType === '本表') {
          componentInfo = {
            name: 'LzForm',
            props: {
              formFormData: formFormDataArr[index],
              record: (taskDataRes.data.length && taskDataRes.data[0]) || {}
            }
          };
        } else if (tableProps.dataSourceType === '子表') {
          componentInfo = {
            name: 'LzTable',
            props: {
              resid: parseInt(task.hostResid, 10),
              formsName: tableProps.dataSourceForm,
              subresid: parseInt(tableProps.dataSourceResid, 10),
              hostrecid: parseInt(task.hostRecid, 10),
              dataMode: 'sub',
              style: customLzTableStyle,
              isBackEndBtnsVisible: true,
              pagination: {
                pageSize: 20,
                current: 0
              },
              hasRefresh: true
            }
          };
        }
        obj.componentInfo = componentInfo;
        tabPanes.push(obj);
      });
    }
    let obj;
    const { headerTabName } = this.state;
    if (headerTabName === 'todo') {
      obj = { todoRecid: task.REC_ID };
    } else if (headerTabName === 'handled') {
      obj = { handledRecid: task.REC_ID };
    }
    this.setState({
      record: (taskDataRes.data.length && taskDataRes.data[0]) || {},
      formFormData,
      tabPanes,
      taskLoading: false,
      backEndBtnsSingle,
      mainHeadResid,
      ...obj
    });
  };

  isSelected = task => {
    const { headerTabName, todoRecid, handledRecid } = this.state;
    if (headerTabName === 'todo') {
      if (task.REC_ID === todoRecid) {
        return true;
      }
    } else if (headerTabName === 'handled') {
      if (task.REC_ID === handledRecid) {
        return true;
      }
    }
    return false;
  };

  checkboxClick = (e, task) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    const selectedTasks = [...this.state.selectedTasks];
    if (isChecked) {
      selectedTasks.push(task);
    } else {
      selectedTasks.splice(
        selectedTasks.findIndex(
          selectedTask => selectedTask.REC_ID === task.REC_ID
        ),
        1
      );
    }
    this.setState({ selectedTasks });
  };

  getCurrentTasks = () => {
    const { headerTabName, todoTasks, handledTasks } = this.state;
    let taskList = todoTasks;
    if (headerTabName === 'handled') {
      taskList = handledTasks;
    }
    return taskList;
  };

  // 渲染任务列表
  renderTasks = taskList => {
    const { headerTabName, taskLoading, selectedTasks } = this.state;
    // 获取要渲染的任务列表
    let isMoreData = true;
    if (headerTabName === 'todo') {
      if (this.todoTotalPage === this.todoCurrent) {
        isMoreData = false;
      }
    } else if (headerTabName === 'handled') {
      if (this.handledTotalPage === this.handledCurrent) {
        isMoreData = false;
      }
    }
    return (
      <Spin spinning={taskLoading}>
        {taskList.map((task, index) => {
          return (
            <div
              className={classNames('task-item', {
                selected: this.isSelected(task)
              })}
              key={task.REC_ID + index}
              onClick={() => this.chooseTask(task)}
            >
              <div className="task-item-icon">
                <img
                  style={{ width: 35, height: 35 }}
                  src={task.iconUrl}
                  alt=""
                />
              </div>
              <div className="detail">
                <div className="title">{task.title}</div>
                <div className="text-wrap">
                  <div className="text">{task.descriptions}</div>
                </div>
              </div>
              <div className="checkbox">
                <Checkbox
                  checked={
                    !!selectedTasks.find(
                      selectedTask => selectedTask.REC_ID === task.REC_ID
                    )
                  }
                  onClick={e => this.checkboxClick(e, task)}
                />
              </div>
            </div>
          );
        })}
        <div className="load-more">
          {isMoreData ? (
            <Button
              block={true}
              onClick={() => this.loadTasks(headerTabName, 'nextload')}
            >
              加载更多
            </Button>
          ) : (
            <div className="no-more-data">没有更多数据了</div>
          )}
        </div>
      </Spin>
    );
  };

  onConfirm = () => {
    this.setState({ tabPanes: [] });
    this.loadTasks(this.state.headerTabName, 'reload');
  };

  renderBackendBtns = () => {
    const {
      headerTabName,
      todoBackEndBtnsMultiple,
      handledBackEndBtnsMultiple,
      selectedTasks
    } = this.state;
    let backendBtns = todoBackEndBtnsMultiple;
    let resid = this.todoResid;

    if (headerTabName === 'handled') {
      backendBtns = handledBackEndBtnsMultiple;
      resid = this.handledResid;
    }

    return (
      <Fragment>
        {backendBtns.map(btnInfo => (
          <LzBackendBtn
            key={btnInfo.Name1}
            btnInfo={btnInfo}
            onConfirm={this.onConfirm}
            resid={parseInt(resid, 10)}
            records={selectedTasks}
          />
        ))}
      </Fragment>
    );
  };

  selectAllChange = e => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      return this.setState({ selectedTasks: [], isSelectedAll: isChecked });
    }
    const taskList = this.getCurrentTasks();
    const selectedTasks = taskList;
    this.setState({ selectedTasks, isSelectedAll: isChecked });
  };

  scaleStatusChange = () => {
    const { scaleStatus } = this.state;
    this.setState({ scaleStatus: scaleStatus === 'normal' ? 'max' : 'normal' });
  };

  onPrint = () => {
    printJS('wrap-detail', 'html');
    // window.print();
  };

  render() {
    const {
      headerTabName,
      todoTasks,
      handledTasks,
      todoRecid,
      handledRecid,
      record,
      formFormData,
      tabPanes,
      backEndBtnsSingle,
      isSelectedAll,
      mainHeadResid,
      scaleStatus
    } = this.state;

    const lzFormStyle = {
      borderBottom: '1px solid #d4d4d4'
    };

    // get detailTitle
    let taskList, recid;
    if (headerTabName === 'todo') {
      taskList = todoTasks;
      recid = todoRecid;
    } else if (headerTabName === 'handled') {
      taskList = handledTasks;
      recid = handledRecid;
    }
    const task =
      taskList.length && taskList.find(task => task.REC_ID === recid);
    const detailTitle = (task && task.formTitle) || '';

    return (
      <div className="task-notice-body">
        <div className="task-notice-body-header">
          <i
            className="back-btn iconfont icon-back"
            onClick={() => this.props.history.goBack()}
          />
          <span className="task-notice-body-title">任务与通知</span>
        </div>
        <div className="task-notice-body-body">
          {/* 任务列表 */}
          <HalfPanel>
            <div className="wrap">
              <div className="wrap-header">
                <span
                  className={classNames('btn', 'wait-deal', {
                    selected: headerTabName === 'todo'
                  })}
                  onClick={() => {
                    this.handleSwitchHeaderTab('todo');
                  }}
                >
                  待处理
                </span>
                <span
                  className={classNames('btn', 'has-deal', {
                    selected: headerTabName === 'handled'
                  })}
                  onClick={() => {
                    this.handleSwitchHeaderTab('handled');
                  }}
                >
                  已处理
                </span>
              </div>
              <div className="task-list">
                <div className="task-list-header">
                  <span className="operation">{this.renderBackendBtns()}</span>
                  <span className="select-all">
                    <Checkbox
                      checked={isSelectedAll}
                      onChange={this.selectAllChange}
                    />
                    <span style={{ marginRight: 10 }}>全选</span>
                  </span>
                </div>
                <div className="task-list-body">
                  {this.renderTasks(taskList)}
                </div>
              </div>
            </div>
          </HalfPanel>
          {/* 任务详情 */}
          <HalfPanel>
            <div
              className={classNames('wrap', {
                max: scaleStatus === 'max'
              })}
            >
              <div className="wrap-header title">
                <div className="wrap-header-title">{detailTitle}</div>
                <div className="wrap-header-btns">
                  <i className="iconfont icon-print" onClick={this.onPrint} />
                  <i
                    className={classNames('iconfont', {
                      'icon-scale-max': scaleStatus === 'normal',
                      'icon-scale-normal': scaleStatus === 'max'
                    })}
                    onClick={this.scaleStatusChange}
                  />
                </div>
              </div>
              <div className="wrap-detail" id="wrap-detail">
                <div className="wrap-detail-btns">
                  {backEndBtnsSingle.map(btnInfo => (
                    <LzBackendBtn
                      key={btnInfo.Name1}
                      btnInfo={btnInfo}
                      onConfirm={this.onConfirm}
                      resid={parseInt(mainHeadResid, 10)}
                      records={[record]}
                    />
                  ))}
                </div>
                <div style={{ height: 260 }}>
                  {record.REC_ID && (
                    <LzForm
                      key={(task && task.REC_ID) || 0}
                      record={record}
                      formFormData={formFormData}
                      style={lzFormStyle}
                      viewStatus="view"
                    />
                  )}
                </div>
                <div className="detail-tabs">
                  <LzTabs
                    key={(task && task.REC_ID) || 0}
                    tabPanes={tabPanes}
                  />
                </div>
              </div>
            </div>
          </HalfPanel>
        </div>
      </div>
    );
  }
}

export default withRouter(TaskNoticeBody);
