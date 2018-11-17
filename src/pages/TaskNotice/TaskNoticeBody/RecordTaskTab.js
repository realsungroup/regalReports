import React from 'react'
import SideTab from './SideTab'

const RecordTaskTab = ({ onSwitch, options, activeTab }) => {
  return <SideTab onSwitch={onSwitch} options={options} activeTab={activeTab} />
}

export default RecordTaskTab
