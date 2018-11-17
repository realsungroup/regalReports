import React from 'react'

export default class FilterOptionView extends React.Component {
  handleClick = () => {
    const { catalog, onSelect } = this.props
    onSelect(catalog)
  }

  render() {
    const {
      selected,
      children,
      className,
      activeClassName,
      inactiveClassName,
      style,
      activeStyle,
      inactiveStyle
    } = this.props

    const selectedStyle = selected ? activeStyle : inactiveStyle
    return (
      <div
        style={{ ...style, ...selectedStyle }}
        className={`${className} ${selected ? activeClassName : inactiveClassName}`}
        onClick={this.handleClick}
      >
        {children}
      </div>
    )
  }
}
