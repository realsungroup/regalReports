import React from 'react'
import maleImg from './images/male.png'
import femaleImg from './images/female.png'
import './WorkbenchHeader.less'

export default class WorkbenchHeader extends React.PureComponent {
  state = {
    cycleType: '新鲜周期',
    cycleNumber: 3,
    fertilizationMode: 'IVF',
    ARTMode: '体外受精',
    treatmentMethod: '拮抗剂',
    cycleState: '当前/关闭',
  }

  render() {
    const {
      cycleType,
      cycleNumber,
      fertilizationMode,
      ARTMode,
      treatmentMethod,
      cycleState,
    } = this.state

    return (
      <div className="home-workbench-header">
        <div className="home-workbench-header-left">
          <div className="home-workbench-sex">
            <img className="home-workbench-sex-icon" src={femaleImg} alt="" />
            <div className="home-workbench-sex-text">女患者</div>
          </div>
          <div className="home-workbench-sex">
            <img className="home-workbench-sex-icon" src={maleImg} alt="" />
            <div className="home-workbench-sex-text">男患者</div>
          </div>
        </div>
        <div className="home-workbench-header-right">
          <div className="home-workbench-header-data">周期类型：{cycleType}</div>
          <div className="home-workbench-header-data">ART方式：{ARTMode}</div>
          <div className="home-workbench-header-data">周期序号：{cycleNumber}</div>
          <div className="home-workbench-header-data">治疗方式：{treatmentMethod}</div>
          <div className="home-workbench-header-data">受精方式：{fertilizationMode}</div>
          <div className="home-workbench-header-data">周期状态：{cycleState}</div>
        </div>
      </div>
    )
  }
}
