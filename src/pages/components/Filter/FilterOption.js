import React from 'react'

export default class FilterOption extends React.Component {
  static defaultProps = {
    onSelect: () => {},
  }

  handleSelect = () => {
    const { eventKey, onSelect } = this.props
    onSelect(eventKey)
  }

  selected = () => {
    const { activeKey, activeKeys, eventKey } = this.props
    if (activeKey && activeKeys) {
      console.warn(
        'Filter usage warning: either "activeKey" or "activeKeys" is required as a prop.',
        'If both are supplied, "activeKeys" will be chosen, "activeKey" will be invalid.'
      )
    }

    if (Array.isArray(activeKeys)) {
      return activeKeys.includes(eventKey)
    }

    if (activeKey) {
      return activeKey === eventKey
    }

    console.error('Filter usage error: either "activeKey" or "activeKeys" is required as a prop')
    return false
  }

  render() {
    const { children, style, className } = this.props

    return (
      <div style={style} className={className}>
        {React.cloneElement(children, {
          selected: this.selected(),
          onSelect: this.handleSelect
        })}
      </div>
    )
  }
}
