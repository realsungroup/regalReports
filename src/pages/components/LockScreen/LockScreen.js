import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './LockScreen.less';

function noop() {}

export default class LockScreen extends React.Component {
  static propTypes = {
    /**
     * 触发锁屏的时间
     */
    time: PropTypes.number.isRequired,

    /**
     * 层级
     * 默认：1000
     */
    zIndex: PropTypes.number,

    /**
     * 遮罩出现时的回调函数
     * 默认：noop
     */
    maskShow: PropTypes.func,

    /**
     * 遮罩隐藏时的回调函数
     * 默认：noop
     */
    maskHide: PropTypes.func
  };

  static defaultProps = {
    zIndex: 1000,
    maskShow: noop,
    maskHide: noop
  };

  // 通过调用 ref.current.removeLockScreen 来关闭 LockScreen 组件
  removeLockScreen = () => {
    this.setState({ visible: false });
    this.subscribe();
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
  }

  componentDidMount = () => {
    this.subscribe();
    // this.bindShortcut();
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  bindShortcut = () => {
    document.addEventListener('keydown', this.bindShortcutCallback);
  };

  bindShortcutCallback(e) {
    console.log(e);
  }

  // 订阅事件、定时器
  subscribe = () => {
    this.setTimeoutFn();
    document.addEventListener('click', this.callback);
    document.addEventListener('mousemove', this.callback);
    document.addEventListener('keydown', this.callback);
    document.addEventListener('mousewheel', this.callback);
  };

  // 取消订阅事件、定时器
  unsubscribe = () => {
    clearTimeout(this.timer);
    document.removeEventListener('click', this.callback);
    document.removeEventListener('mousemove', this.callback);
    document.addEventListener('keydown', this.callback);
    document.addEventListener('mousewheel', this.callback);
  };

  // 锁屏
  lockScreen = () => {
    this.setState({ visible: true });
    this.props.maskShow();
    this.unsubscribe();
  };

  // 设置新的定时器
  setTimeoutFn = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // 等待时间到，进行锁屏
      this.lockScreen();
    }, this.props.time * 1000);
  };

  // 事件回调函数
  callback = () => {
    this.setTimeoutFn();
  };

  render() {
    const { children, zIndex, className } = this.props;
    const { visible } = this.state;
    const childrenDom = (
      <div className={`lock-screen ${className}`} style={{ zIndex }}>
        {children}
      </div>
    );
    if (visible) {
      return ReactDOM.createPortal(childrenDom, document.body);
    }
    return null;
  }
}
