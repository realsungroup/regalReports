import React from 'react'
import moment from 'moment'
import { Checkbox } from 'antd'
import './TaskCard.less'

export default class TaskCard extends React.Component {
  static defaultProps = {
    onCheck: () => {}
  }

  handleChange = (e) => {
    const {
      onCheck,
      data: { REC_ID },
    } = this.props
    const { target: { checked } } = e
    onCheck({taskId: REC_ID, checked })
  }

  render() {
    const {
      data: { iconUrl, descriptions, title, REC_EDTTIME, checked },
      withCheckBox,
      withFromNow,
    } = this.props

    const time = moment(REC_EDTTIME).format('YYYY-MM-DD HH:MM')
    const fromNow = moment(REC_EDTTIME)
      .locale('zh-cn')
      .fromNow()

    return (
      <div className="task-notice-card">
        <img className="task-notice-card-icon" src={iconUrl} alt="" />
        <div className="task-notice-card-content">
          <div className="task-notice-card-title">{title}</div>
          <div className="task-notice-card-desc">{descriptions}</div>
          <div className="task-notice-card-time">{time}</div>
          {withCheckBox && (
            <div className="task-notice-card-checkbox">
              <Checkbox checked={checked} onChange={this.handleChange} />
            </div>
          )}
          {withFromNow && <div className="task-notice-card-from-now">{fromNow}</div>}
        </div>
      </div>
    )
  }
}
