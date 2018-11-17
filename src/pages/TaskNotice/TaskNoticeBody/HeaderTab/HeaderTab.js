import React from 'react'
import { Filter, FilterOption, FilterOptionView } from '../../../components/Filter'
import './HeaderTab.less'

export default class HeaderTab extends React.Component {
  static defaultProps = {
    onSwitch: () => {}
  }

  handleSelect = key => {
    this.props.onSwitch(key)
  }

  render() {
    const { options, activeTab } = this.props

    return (
      <Filter
        className="task-notice-header-tab"
        activeKey={activeTab}
        onSelect={this.handleSelect}
      >
        {options.map(({ value, label }) => (
          <FilterOption className="task-notice-header-option" key={label} eventKey={value}>
            <FilterOptionView
              className="task-notice-header-option-view"
              activeClassName="task-notice-header-option-view-active"
              inactiveClassName="task-notice-header-option-view-inactive"
            >
              {label}
            </FilterOptionView>
          </FilterOption>
        ))}
      </Filter>
    )
  }
}
