import React from 'react'

const Filter = ({ className, style, activeKeys, activeKey, multi, onSelect, children }) => (
  <div className={className} style={style}>
    {children &&
      React.Children.map(children, tabItem => (
        React.cloneElement(tabItem, { activeKeys, activeKey, multi, onSelect })
      ))}
  </div>
)

export default Filter
