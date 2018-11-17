import React from 'react'
import './Application.less'

export default class Application extends React.Component {
  static defaultProps = {
    appData: {},
    active: true,
    withTitle: true,
  }

  render() {
    const {
      appData: { DeskiconCls, title },
      style,
      iconWrapperStyle,
      iconStyle,
      titleStyle,
      active,
      withTitle,
    } = this.props
    return (
      <div className={`app ${active ? 'app-active' : ''}`} style={style}>
        <div className="app-icon-wrapper" style={iconWrapperStyle}>
          <div className="app-icon">
            <i className={`iconfont icon-${DeskiconCls || 'wdkq_icon'}`} style={iconStyle} />
          </div>
        </div>
        {withTitle &&
          title && (
            <div className="app-title-wrapper" style={titleStyle}>
              <div className="app-title">{title}</div>
            </div>
          )}
      </div>
    )
  }
}
