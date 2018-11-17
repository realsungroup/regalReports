import React from 'react'
import { Filter, FilterOption } from '../../../../components/Filter'
import TaskFilterOption from './TaskFilterOption'
import './TaskFilter.less'

export default class TaskFilter extends React.Component {
  static defaultProps = {
    colNum: 4,
    maxRowNum: 0,
  }

  handleSelect = eventKey => {
    this.props.onSelect(eventKey)
  }

  render() {
    const { options, colNum, catalogs } = this.props
    const optionNum = options.length
    const rowNum = Math.ceil(optionNum / colNum)
    const style = {
      display: 'inline-block',
      height: `${(99 / rowNum)}%`,
      width: `${99 / colNum}%`
    }

    return (
      <Filter
        className="home-task-filter"
        activeKeys={catalogs}
        onSelect={this.handleSelect}
      >
        {options.map(({ catalog, iconClsSelected, iconClsUnselected }) => (
          <FilterOption style={style} key={catalog} eventKey={catalog}>
            <TaskFilterOption
              catalog={catalog}
              iconClsSelected={iconClsSelected}
              iconClsUnselected={iconClsUnselected}
            />
          </FilterOption>
        ))}
      </Filter>
    )
  }
}
