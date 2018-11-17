import React from 'react';
import { Popover, message, Button, Radio } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import RightBtns from './RightBtns';
import './PageHeader.less';
import ColorPicker from '../ColorPicker';
import Loading from 'react-fullscreen-loading';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import logoImg from '../../../assets/logo.png';
import { setThemeColor, setLanguage } from 'Util/api';

class PageHeader extends React.Component {
  state = {
    loading: false,
    isInTop: true // 页面滚动条是否处在最顶部
  };

  static defaultProps = {
    rightBtns: <RightBtns />
  };

  componentDidMount() {
    window.addEventListener('scroll', debounce(this.shadowChange, 200));
  }

  componentWillUnmount = () => {
    window.removeEventListener('scroll', this.shadowChange);
  };

  shadowChange = () => {
    const top = document.documentElement.scrollTop;
    let isInTop = true;
    if (top) {
      isInTop = false;
    }
    this.setState({ isInTop });
  };

  handleGoBack = () => {
    this.props.history.goBack();
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

  closePicker = e => {
    e.stopPropagation();
    this.setState({ pickerVisible: false });
  };

  closeLanguagePopover = e => {
    e.stopPropagation();
    this.setState({ languageVisible: false });
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

  render() {
    const { title, searchBox, reminderNum, lockScreenRef } = this.props;

    const {
      loading,
      pickerVisible,
      color,
      isInTop,
      language,
      languageVisible
    } = this.state;

    const rightBtns = (
      <RightBtns reminderNum={reminderNum} lockScreenRef={lockScreenRef} />
    );

    return (
      <div
        className={classNames('page-header-v2', {
          'in-top': isInTop
        })}
      >
        <div className="page-header-v2-logo">
          <Link to="/" className="iconfont icon-logo" />
        </div>
        {/* {searchBox && (
          <div className="page-header-v2-search-box">{searchBox}</div>
        )} */}
        <div className="page-header-v2-center-logo">
          <img src={logoImg} alt="logo" className="page-header-v2__logo-img" />
        </div>

        {rightBtns && (
          <div className="page-header-v2-right-btns">
            {Array.isArray(rightBtns) && rightBtns.length > 0 ? (
              rightBtns.map((btn, idx) => (
                <div key={idx} className="page-header-v2-right-btn">
                  {btn}
                </div>
              ))
            ) : (
              <div className="page-header-v2-right-btn">{rightBtns}</div>
            )}
            {/* <div
              className="page-header-v2-right-btn"
              onClick={() => this.setState({ pickerVisible: true })}
            >
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
                <i className="iconfont icon-theme" />
              </Popover>
            </div> */}
            {/* <div
              className="page-header-v2-right-btn"
              onClick={() => this.setState({ languageVisible: true })}
            >
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
                <i className="iconfont icon-language" />
              </Popover>
            </div> */}
          </div>
        )}
        {title && <div className="page-header-v2-title">{title}</div>}
        <Loading loading={loading} />
      </div>
    );
  }
}

export default withRouter(PageHeader);
