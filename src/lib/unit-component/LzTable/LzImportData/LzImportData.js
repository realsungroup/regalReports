import React, { Fragment } from 'react';
import {
  message,
  List,
  Modal,
  Button,
  Upload,
  Progress,
  Icon,
  Tooltip
} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import { clone } from '../../../util/util';
import classNames from 'classnames';
import {
  getImportConfigs,
  uploadFile,
  importFile,
  importingService
} from 'Util/api';
import './LzImportData.less';
/**
 * 数据导入
 */
export default class LzImportData extends React.Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      errMsgItem: {},
      errMsgModalVisible: false
    };
  }

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount = () => {
    this.getTaskStatus = null;
  };

  getData = async () => {
    let res;
    try {
      res = await getImportConfigs(594818574040);
    } catch (err) {
      return message.error(err.message);
    }
    res.data.forEach(item => {
      item.opViewStatus = 'chooseFile'; // 操作视图状态：'chooseFile' 选择文件状态；'opBtns' 有操作按钮状态
      item.dealStatus = ''; // 后端正在处理时的状态：'deal' 正在处理；'pause' 暂停；'terminate' 中断
    });
    this.setState({ list: res.data });
  };

  selectedItem; //
  importFile = (resid, cfgid, fileInfo, item) => {
    const file = fileInfo.file;
    // 为什么不用 async/await：https://github.com/ant-design/ant-design/issues/10122
    importFile(resid, cfgid, undefined, file)
      .then(res => {
        if (res.error !== 0) {
          return message.error(res.message);
        }
        item.taskId = res.data;
        item.opViewStatus = 'opBtns';
        item.dealStatus = 'deal';
        item.curIndex = 0;
        item.totalIndex = 0;
        item.percent = 0;
        this.setStateList(item);
        this.getTaskStatus && this.getTaskStatus(item);
      })
      .catch(err => {
        console.error(err);
      });
  };

  getTaskStatus = item => {
    item.timer = setTimeout(async () => {
      let res;
      try {
        res = await importingService(item.taskId, 'GetImportStatus');
      } catch (err) {
        return message.error(err.message);
      }
      if (res.error !== 0) {
        return message.error(res.message);
      }
      item.curIndex = res.data.GetEditNumber;
      item.totalIndex = res.data.GetTotalNumber;
      item.isCompleted = res.data.IsCompleted;
      item.percent = Math.floor(
        (res.data.GetEditNumber / res.data.GetTotalNumber) * 100
      );
      item.errMsg = res.data.GetImportTip;
      if (res.data.IsCompleted) {
        item.opViewStatus = 'chooseFile';
        item.dealStatus = '';
        this.setStateList(item);
        // 本任务已完成
        if (!res.data.GetImportTip) {
          message.success('导入完成');
        } else {
          message.error('导入出错');
        }
      } else {
        this.setStateList(item);
        this.getTaskStatus && this.getTaskStatus(item);
      }
    }, 1000);
  };

  setStateList = item => {
    const { list } = this.state;
    const index = list.findIndex(
      listItem => listItem.IMOUT_ID === item.IMOUT_ID
    );
    list.splice(index, 1, item);
    this.setState({ list });
  };

  handlePause = async item => {
    let res;
    try {
      res = await importingService(item.taskId, 'PauseImport');
    } catch (err) {
      return message.error(err.message);
    }
    if (res.error !== 0) {
      return message.error(res.message);
    }
    clearTimeout(item.timer);
    item.dealStatus = 'pause';
    this.setStateList(item);
    message.success('已暂停');
  };

  handleShowErrMsg = item => {
    this.setState({ errMsgItem: item, errMsgModalVisible: true });
  };

  handleStart = async item => {
    let res;
    try {
      res = await importingService(item.taskId, 'ResumeImport');
    } catch (err) {
      return message.error(err.message);
    }
    if (res.error !== 0) {
      return message.error(res.message);
    }
    this.getTaskStatus(item);
    item.dealStatus = 'deal';
    this.setStateList(item);
    message.success('已开始');
  };

  handleTerminate = async item => {
    let res;
    try {
      res = await importingService(item.taskId, 'TerminateImport');
    } catch (err) {
      return message.error(err.message);
    }
    if (res.error !== 0) {
      return message.error(res.message);
    }
    clearTimeout(item.timer);
    item.opViewStatus = 'chooseFile';
    item.dealStatus = '';
    this.setStateList(item);
    message.success('已终止');
  };

  renderProgress = item => {
    // 正在处理
    if (item.dealStatus) {
      return (
        <Fragment>
          <Progress percent={item.percent} />
          <div>
            {item.curIndex} / {item.totalIndex}
          </div>
        </Fragment>
      );
    }
  };

  renderOpArea = item => {
    // 选择文件
    if (item.opViewStatus === 'chooseFile') {
      return (
        <Fragment>
          {item.errMsg && (
            <Button
              style={{ marginLeft: 10 }}
              onClick={() => this.handleShowErrMsg(item)}
              type="danger"
            >
              错误信息
            </Button>
          )}
          <Upload
            customRequest={file =>
              this.importFile(item.IMOUT_RESID, item.IMOUT_ID, file, item)
            }
            showUploadList={false}
          >
            <Button type="primary">选择文件</Button>
          </Upload>
        </Fragment>
      );
    }

    // 暂停、开始、中断按钮
    if (item.opViewStatus === 'opBtns') {
      let BtnIcon;
      if (item.dealStatus === 'deal') {
        BtnIcon = (
          <Tooltip title="暂停">
            <Icon
              style={{ fontSize: 30, marginLeft: 10, cursor: 'pointer' }}
              type="pause-circle"
              onClick={() => this.handlePause(item)}
            />
          </Tooltip>
        );
      } else if (item.dealStatus === 'pause') {
        BtnIcon = (
          <Tooltip title="开始">
            <Icon
              style={{ fontSize: 30, marginLeft: 10, cursor: 'pointer' }}
              type="play-circle"
              onClick={() => this.handleStart(item)}
            />
          </Tooltip>
        );
      }

      return (
        <Fragment>
          {BtnIcon}
          <Tooltip title="终止">
            <Icon
              type="stop"
              style={{ fontSize: 30, marginLeft: 10, cursor: 'pointer' }}
              onClick={() => this.handleTerminate(item)}
            />
          </Tooltip>
        </Fragment>
      );
    }
  };

  render() {
    const { list, errMsgModalVisible, errMsgItem } = this.state;
    return (
      <Fragment>
        <Modal
          visible={true}
          footer={''}
          width={800}
          className="lz-import-data"
          closable
          footer={
            <div style={{ textAlign: 'right' }}>
              关闭后窗口后不会中断数据的导入
              <Button style={{ marginLeft: 10 }} onClick={this.props.onClose}>
                关闭
              </Button>
            </div>
          }
          closable={false}
        >
          <List
            dataSource={list}
            renderItem={item => (
              <List.Item>
                <div className="lz-import-data__item-wrap">
                  <span className="lz-import-data__title">
                    {item.IMOUT_NAME}
                  </span>
                  <div className="lz-import-data__progress">
                    {this.renderProgress(item)}
                  </div>
                  <div className="lz-import-data__op-area">
                    {this.renderOpArea(item)}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Modal>
        <Modal
          visible={errMsgModalVisible}
          footer={''}
          onCancel={() => this.setState({ errMsgModalVisible: false })}
        >
          {errMsgItem.errMsg}
        </Modal>
      </Fragment>
    );
  }
}
