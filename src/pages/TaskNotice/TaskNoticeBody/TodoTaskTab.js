import React from 'react'
import SideTab from './SideTab'

const TodoTaskTab = ({ onCheck, onSwitch, options, activeTab }) => {
  return (
    <SideTab
      onCheck={onCheck}
      onSwitch={onSwitch}
      options={options}
      activeTab={activeTab}
      withFromNow
      withCheckbox
    />
  )
}

export default TodoTaskTab
