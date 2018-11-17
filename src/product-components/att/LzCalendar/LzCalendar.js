import React from 'react';
import { Calendar } from 'antd';
import './LzCalendar.less';

/**
 * 日历
 */
export default class LzCalendar extends React.Component {
  render() {
    return (
      <div className="lz-calendar">
        <Calendar fullscreen={false} onSelect={this.props.onSelect} />
      </div>
    );
  }
}
