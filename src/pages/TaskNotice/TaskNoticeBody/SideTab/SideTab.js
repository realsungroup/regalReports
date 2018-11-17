import React from 'react'
import { Filter, FilterOption, FilterOptionView } from '../../../components/Filter'
import TaskCard from './TaskCard'
import './SideTab.less'

export default class SideTab extends React.Component {
  static defaultProps = {
    onSwitch: () => {}
  }

  handleSelect = key => {
    this.props.onSwitch(key)
  }

  render() {
    const { options, activeTab, withCheckbox, withFromNow, onCheck } = this.props

    return (
      <Filter className="task-notice-side-tab" activeKey={activeTab} onSelect={this.handleSelect}>
        {options.map((option, idx) => (
          <FilterOption
            className="task-notice-side-option"
            key={option.REC_ID}
            eventKey={option.REC_ID}
          >
            <FilterOptionView
              className="task-notice-side-option-view"
              activeClassName="task-notice-side-option-view-active"
              inactiveClassName="task-notice-side-option-view-inactive"
            >
              <TaskCard
                data={option}
                onCheck={onCheck}
                withCheckBox={withCheckbox}
                withFromNow={withFromNow}
              />
            </FilterOptionView>
          </FilterOption>
        ))}
      </Filter>
    )
  }
}
