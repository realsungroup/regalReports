import React, { Fragment } from 'react';
import { Calendar } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './LzCalendar.less';

/**
 * 日历组件
 */
export default class LzCalendar extends React.Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onSelect = date => {
    console.log('date:', date);
  };

  render() {
    return <Calendar onSelect={this.onSelect} />;
  }
}
