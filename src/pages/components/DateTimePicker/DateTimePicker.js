import React from 'react';
import { DatePicker, TimePicker } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';

/**
 * 日期时间选择器
 */
export default class DateTimePicker extends React.Component {
  static propTypes = {
    /**
     * 日期显示格式化
     * 默认：'YYYY-MM-DD'
     */
    dateFormat: PropTypes.string,

    /**
     * 时间显示格式化
     * 默认：'HH:mm'
     */
    timeFormat: PropTypes.string,

    /**
     * 组件间的间隔
     * 默认：4
     */
    space: PropTypes.number,

    /**
     * date picker props
     */
    datePickerProps: PropTypes.object,

    /**
     * time picker props
     */
    timePickerProps: PropTypes.object
  };

  static defaultProps = {
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    space: 4
  };

  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const value = props.value;
    this.state = {
      value
    };
  }

  handleDateChange = date => {
    if (!('value' in this.props)) {
      this.setState({ value: date });
    }
    this.triggerChange(date);
  };

  handleTimeChange = time => {
    if (!('value' in this.props)) {
      this.setState({ time });
    }
    this.triggerChange(time);
  };

  triggerChange = changedValue => {
    const { onChange } = this.props;
    onChange && onChange(changedValue);
  };

  render() {
    const { value } = this.state;
    const {
      dateFormat,
      timeFormat,
      space,
      datePickerProps,
      timePickerProps
    } = this.props;
    return (
      <div className="date-time-picker">
        <DatePicker
          value={value}
          onChange={this.handleDateChange}
          format={dateFormat}
          style={{ marginRight: space }}
          {...datePickerProps}
        />
        <TimePicker
          value={value}
          onChange={this.handleTimeChange}
          format={timeFormat}
          {...timePickerProps}
        />
      </div>
    );
  }
}
