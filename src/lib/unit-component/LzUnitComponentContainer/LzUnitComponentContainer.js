import React from 'react';
import PropTypes from 'prop-types';
import './LzUnitComponentContainer.less';
import classNames from 'classnames';

const maxFullStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  marginLeft: 0,
  width: 'auto',
  height: 'auto',
  transform: 'none'
};

const maxParentStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  marginLeft: 0,
  width: 'auto',
  height: 'auto',
  transform: 'none'
};

/**
 * 单元组件的容器组件
 * 本组件拥有所有单元组件所通用的一些功能：
 * 1.缩放
 */
export default class LzUnitComponentContainer extends React.Component {
  static propTypes = {
    /**
     * 缩放类型
     * 可选：'parent' 缩放到父元素宽高大小 | 'full' 缩放到全屏大小
     * 默认：'parent'
     */
    scaleType: PropTypes.oneOf(['parent', 'full']),

    /**
     * 缩放状态
     * 可选：'normal' 无缩放 | 'max' 放大
     * 默认：'normal'
     */
    scaleStatus: PropTypes.oneOf(['normal', 'max'])
  };

  static defaultProps = {
    scaleType: 'parent',
    scaleStatus: 'normal'
  };

  constructor(props) {
    super(props);
    const { scaleStatus } = props;
    this.state = {
      scaleStatus
    };
  }

  scaleWindow = () => {
    let { scaleStatus } = this.state;
    scaleStatus = scaleStatus === 'normal' ? 'max' : 'normal';
    this.setState({ scaleStatus });
  };

  changeZIndex = zIndex => {
    let unitOne;
    if ((unitOne = document.querySelector('.unit-one'))) {
      unitOne.style.zIndex = zIndex;
    }
  };

  render() {
    const { children, style, scaleType } = this.props;
    const { scaleStatus } = this.state;
    let newStyle;
    if (scaleStatus === 'normal') {
      newStyle = style;
      this.changeZIndex(10);
    } else if (scaleStatus === 'max') {
      if (scaleType === 'full') {
        newStyle = { ...style, ...maxFullStyle };
        this.changeZIndex(14);
      } else if (scaleType === 'parent') {
        newStyle = { ...style, ...maxParentStyle };
      }
    }
    return (
      <div
        className={classNames('lz-unit-component-container', {
          'max-style': scaleStatus === 'max'
        })}
        style={newStyle}
      >
        <span
          className={classNames('scale-btn', 'iconfont', {
            'icon-scale-max': scaleStatus === 'normal',
            'icon-scale-normal': scaleStatus === 'max'
          })}
          onClick={this.scaleWindow}
        />
        {children}
      </div>
    );
  }
}
