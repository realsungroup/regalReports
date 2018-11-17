import React from 'react'
import './Panel.less'

const Panel = ({ className, style, children }) => (
  <div className={className}>{children}</div>
)

Panel.defaultProps = {
  className: 'common-panel'
}

export default Panel
