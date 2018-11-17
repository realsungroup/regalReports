import React from 'react'
import printIcon from './images/print.png'
import fullScreenIcon from './images/full-screen.png'
import outFullScreenIcon from './images/out-full-screen.png'
import './TaskDetail.less'

export default class TaskDetail extends React.Component {
  state = {
    isFullScreen: false,
  }

  toggleFullScreen = () => {
    this.setState({ isFullScreen: !this.state.isFullScreen })
  }

  handlePrint = () => {}

  render() {
    const { data } = this.props
    const { isFullScreen } = this.state
    const { title, descriptions } = data || {}

    return (
      <div className={`task-notice-detail ${isFullScreen ? 'task-notice-detail-full-screen' : ''}`}>
        <div className="task-notice-detail-top-panel">
          <div className="task-notice-detail-top-title">{title}</div>
          <div className="task-notice-detail-top-desc">{descriptions}</div>
        </div>
        <div className="task-notice-detail-bottom-panel">{''}</div>
        <img
          className="task-notice-detail-print-btn"
          src={printIcon}
          alt=""
          onClick={this.handlePrint}
        />
        <img
          className="task-notice-detail-full-screen-btn"
          src={isFullScreen ? outFullScreenIcon : fullScreenIcon}
          alt=""
          onClick={this.toggleFullScreen}
        />
      </div>
    )
  }
}
