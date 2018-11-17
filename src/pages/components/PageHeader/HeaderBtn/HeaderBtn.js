import React from 'react';
import './HeaderBtn.less';
import { Tooltip } from 'antd';

export default class HeaderBtn extends React.PureComponent {
  render() {
    const { iconClass, text, onClick, tip } = this.props;
    return (
      <div className="page-header-v2-btn" onClick={onClick}>
        {tip ? (
          <Tooltip placement="bottom" title={tip}>
            <span
              className={`page-header-v2-btn-icon iconfont-theme iconfont ${iconClass}`}
            />
          </Tooltip>
        ) : (
          <span
            className={`page-header-v2-btn-icon iconfont-theme iconfont ${iconClass}`}
          />
        )}

        {!!text && <div className="page-header-v2-btn-text">{text}</div>}
      </div>
    );
  }
}
