import React from 'react'
import './OptionalApp.css'

export default class OptionalApp extends React.Component {
  handleChange = e => {
    const { checked, value } = e.target
    this.props.onChange({ value, checked })
  }

  render() {
    const {
      appData: { RES_ID, RES_NAME },
    } = this.props

    return (
      <div className="workbench-setting-optional-app">
        <input
          className="workbench-setting-optional-app-checkbox"
          type="checkbox"
          value={RES_ID}
          onChange={this.handleChange}
        />
        <label className="workbench-setting-optional-app-label">{RES_NAME}</label>
      </div>
    )
  }
}
