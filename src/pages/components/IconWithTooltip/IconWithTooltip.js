import React from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';

export default class IconWithTooltip extends React.Component {
  static propTypes = {
    /**
     * 提示信息
     */
    tip: PropTypes.string.isRequired,

    /**
     * 字体图标类名
     */
    iconClass: PropTypes.string.isRequired
  };

  render() {
    const {
      tip,
      iconClass,
      style,
      className,
      placement = 'top',
      ...restProps
    } = this.props;
    return (
      <Tooltip title={tip} placement={placement}>
        <i
          className={`iconfont ${iconClass} ${className}`}
          {...restProps}
          style={{ cursor: 'pointer', ...style }}
        />
      </Tooltip>
    );
  }
}
