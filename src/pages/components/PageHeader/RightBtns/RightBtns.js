import React from 'react';
import { withRouter } from 'react-router-dom';
import { logout, changePassword } from '../../../../util/auth';
import { clearCache } from '../../../../util/api';
import { removeItem } from '../../../../util/localCache';
import HeaderBtn from '../HeaderBtn';
import {
  Button,
  Input,
  message,
  Form,
  Icon,
  Popconfirm,
  Popover,
  Radio,
  Modal,
  Checkbox
} from 'antd';
import './RightBtns.less';
import ColorPicker from '../../ColorPicker';
import classNames from 'classnames';

import { setThemeColor, setLanguage } from 'Util/api';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class RightBtns extends React.Component {
  state = {
    messageCount: 20,
    visible: false,
    oldpass: '',
    newpass: '',
    newpass2: '',
    confirmDirty: false,
    pickerVisible: false,
    color: '', // 当前主题色
    languageVisible: false,
    language: JSON.parse(localStorage.getItem('userInfo')).UserInfo
      .EMP_LANGUAGE, // 语言
    isRotate: false,
    aboutModalVisible: false,
    checked: true
  };

  handleMessageBtnClick = () => {
    this.redirectTo('/reminder');
  };

  handleReportTableBtnClick = () => {
    this.redirectTo('/report-table');
  };

  clearCacheBtnClick = async () => {
    try {
      const response = await clearCache();
      removeItem('formsData');
      if (response === 'ok') {
        message.success('清除缓存成功');
      }
    } catch (error) {
      message.error('清除缓存失败');
    }
  };

  handleSettingBtnClick = () => {
    this.redirectTo('/workbench-setting');
  };

  handleModifyPasswordBtnClick = () => {
    this.setState({
      visible: true
    });
  };

  handleAboutClick = () => {
    this.setState({ aboutModalVisible: true });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  handleLogoutBtnClick = () => {
    logout();
    this.props.history.push('/');
  };

  handleLockBtnClick = () => {
    this.props.lockScreenRef.current.lockScreen();
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
    if (
      this.props.form.getFieldValue('password2') !== undefined &&
      this.props.form.getFieldValue('password2') !== '' &&
      this.props.form.getFieldValue('password1') ===
        this.props.form.getFieldValue('password2')
    ) {
      try {
        const response = await changePassword(
          this.props.form.getFieldValue('password'),
          this.props.form.getFieldValue('password1')
        );
        const result = response.message;

        if (result === '密码修改成功!') {
          message.success('密码修改成功!');
          this.setState({
            oldpass: '',
            newpass: '',
            newpass2: '',
            visible: false
          });
        }
        if (result === '原密码不正确') {
          message.error('原密码不正确!');
          this.setState({
            visible: true
          });
        }

        const form = this.props.form;
        if (
          result === '修改密码失败，修改后的密码不能与原来密码相同。' &&
          form.getFieldValue('password1') != ''
        ) {
          message.error('修改后的密码不能与原来密码相同!');
          this.setState({
            visible: true
          });
        }
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;

    if (value && value.length < 6) {
      callback('输入的长度不能小于6位数！');
    }
    if (value && this.state.confirmDirty) {
      form.validateFields(['password2'], { force: true });
    }
    if (
      value &&
      value !== form.getFieldValue('password1') &&
      value.length > 6
    ) {
      callback('两次输入的密码不一致！');
    } else {
      callback();
    }
    callback();
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (
      value &&
      value !== form.getFieldValue('password1') &&
      value.length > 6
    ) {
      callback('两次输入的密码不一致！');
    } else {
      callback();
    }
  };

  redirectTo = url => {
    if (this.props.match.url !== url) {
      this.props.history.push(url);
    }
  };

  vars = { '@primary-color': '' };
  handleChangeComplete = (val, color) => {
    const rbga = color.rgb;
    this.vars = {
      '@primary-color': `rgba(${rbga.r},${rbga.g},${rbga.b},${rbga.a})`
    };
    this.setState({ color: rbga });
  };

  renderSelectedColor = async () => {
    this.setState({ loading: true });
    setTimeout(() => {
      window.less
        .modifyVars(this.vars)
        .then(() => {
          this.setState({ loading: false, pickerVisible: false });
          message.success('修改主题成功');
        })
        .catch(err => {
          this.setState({ loading: false });
          message.error(err.message);
        });
    }, 200);
    let res;
    try {
      res = await setThemeColor(this.vars['@primary-color']);
    } catch (err) {
      return message.error(err.message);
    }
    this.modUserInfoThemColor(this.vars['@primary-color']);
  };

  modUserInfoThemColor = color => {
    let userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        userInfo = JSON.parse(userInfo);
      } catch (err) {
        return;
      }
      userInfo.UserInfo.EMP_Color = color;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  };

  handleRadioGroupChange = async e => {
    const value = e.target.value;
    this.setState({ language: value });
    let res;
    try {
      res = await setLanguage(value);
    } catch (err) {
      return message.error(err.message);
    }
    if (res.OpResult === 'Y') {
      this.modLanguage(value);
      message.success('切换语言成功，即将重新加载本页');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  modLanguage = language => {
    let userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        userInfo = JSON.parse(userInfo);
      } catch (err) {
        return;
      }
      userInfo.UserInfo.EMP_LANGUAGE = language;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  };

  handleSeparateBtnClick = () => {
    this.setState({
      isRotate: !this.state.isRotate
    });
  };

  render() {
    const {
      visible,
      color,
      language,
      separateIconClass,
      isRotate,
      aboutModalVisible
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { reminderNum } = this.props;
    return (
      <React.Fragment>
        <div
          className={classNames('right-btns__left-btns', {
            'to-more-btns-status': isRotate
          })}
        >
          <HeaderBtn
            iconClass="icon-message"
            text={reminderNum}
            onClick={this.handleMessageBtnClick}
            tip="提醒"
          />
          <HeaderBtn
            iconClass="icon-report-table"
            onClick={this.handleReportTableBtnClick}
            tip="报表"
          />
          <Popconfirm
            placement="bottomRight"
            title={'您确定要锁定屏幕吗？'}
            onConfirm={this.handleLockBtnClick}
            okText="确定"
            cancelText="取消"
          >
            <HeaderBtn iconClass="icon-lock-screen" tip="锁屏" />
          </Popconfirm>

          <HeaderBtn
            iconClass="icon-setting"
            onClick={this.handleSettingBtnClick}
            tip="设置"
          />
          <Popconfirm
            placement="bottomRight"
            title={'您确定要退出登录吗？'}
            onConfirm={this.handleLogoutBtnClick}
            okText="确定"
            cancelText="取消"
          >
            <HeaderBtn iconClass="icon-signout" tip="退出登录" />
          </Popconfirm>
          {/* ======= */}
          <HeaderBtn
            iconClass={classNames(
              'icon-more-btns right-btns__to-more-btns-icon',
              {
                'right-btns__to-less-btns-icon': isRotate
              }
            )}
            onClick={this.handleSeparateBtnClick}
          />
          {/* ======= */}
        </div>

        <div
          className={classNames('right-btns__right-btns', {
            'to-more-btns-status': isRotate
          })}
        >
          <HeaderBtn
            iconClass="icon-mod-password"
            onClick={this.handleModifyPasswordBtnClick}
            tip="修改密码"
          />
          <HeaderBtn
            iconClass="icon-clear-cache"
            onClick={this.clearCacheBtnClick}
            tip="清除缓存"
          />

          <Popover
            placement="bottomRight"
            title={<div style={{ textAlign: 'right' }}>选择主题色</div>}
            trigger="click"
            content={
              <React.Fragment>
                <ColorPicker
                  color={color}
                  onChangeComplete={this.handleChangeComplete}
                />
                <div className="color-picker-btns">
                  <Button
                    size="small"
                    className="color-picker-btn"
                    onClick={this.renderSelectedColor}
                  >
                    确定
                  </Button>
                </div>
              </React.Fragment>
            }
            trigger="click"
          >
            <HeaderBtn
              iconClass="icon-theme"
              onClick={() => this.setState({ pickerVisible: true })}
              tip="更换主题色"
            />
          </Popover>

          <Popover
            placement="bottomRight"
            title={<div style={{ textAlign: 'right' }}>选择语言</div>}
            trigger="click"
            content={
              <React.Fragment>
                <Radio.Group
                  value={language}
                  onChange={this.handleRadioGroupChange}
                >
                  <Radio.Button value="中文">中文</Radio.Button>
                  <Radio.Button value="English">English</Radio.Button>
                </Radio.Group>
              </React.Fragment>
            }
            trigger="click"
          >
            <HeaderBtn
              iconClass="icon-language"
              onClick={() => this.setState({ languageVisible: true })}
              tip="更换语言"
            />
          </Popover>
          <HeaderBtn
            iconClass="icon-about"
            onClick={this.handleAboutClick}
            tip="关于"
          />
        </div>

        <Modal
          visible={aboutModalVisible}
          width={'500px'}
          title={
            <div className="right-btns__about-modal">
              <i className="iconfont icon-logo" />
              <div>Power Works</div>
            </div>
          }
          closable={false}
          footer={''}
          destroyOnClose={true}
          onCancel={() => this.setState({ aboutModalVisible: false })}
        >
          <div className="right-btns__about-modal-content">
            <Checkbox
              style={{ marginLeft: 12 }}
              checked={this.state.checked}
              disabled={this.state.disabled}
              onChange={() => this.setState({ checked: true })}
            />
            <div style={{ marginLeft: 30 }}>
              <strong>Power Works</strong>
              <strong>版本：10.0.1</strong>
            </div>
            <div />
          </div>
        </Modal>

        <Modal
          visible={visible}
          maskClosable={false}
          width={'400px'}
          title={'修改密码'}
          footer={''}
          destroyOnClose={true}
          onCancel={this.handleCancel}
        >
          <Form className="input-pass1" onSubmit={this.handleSubmit}>
            <FormItem className="pass1">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入原密码！' }]
              })(
                <Input
                  className="input-pass"
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  type="password"
                  placeholder="原密码"
                />
              )}
            </FormItem>
            <FormItem className="pass">
              {getFieldDecorator('password1', {
                rules: [
                  { required: true, message: '请输入新密码！' },
                  {
                    validator: this.validateToNextPassword
                  }
                ]
              })(
                <Input
                  className="input-pass"
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  type="password"
                  placeholder="新密码"
                />
              )}
            </FormItem>
            <FormItem className="pass">
              {getFieldDecorator('password2', {
                rules: [
                  { required: true, message: '请再次输入新密码！' },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(
                <Input
                  className="input-pass"
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  type="password"
                  onChange={this.newpassChange2}
                  placeholder="新密码"
                  onBlur={this.handleConfirmBlur}
                />
              )}
            </FormItem>

            <FormItem>
              <Button
                className="btn-submit"
                type="primary"
                htmlType="submit"
                // disabled={hasErrors(getFieldsError())}
              >
                提交
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
const RightBtn = Form.create()(RightBtns);
export default withRouter(RightBtn);
