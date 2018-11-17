import React from 'react';
import './SwiperOfReact.less';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

export default class SwiperOfReact extends React.Component {
  static propTypes = {
    /**
     * swiper 选项
     * 默认：{}
     */
    options: PropTypes.object
  };

  static defaultProps = {};

  componentDidMount = () => {
    const { className, id, options } = this.props;
    let selector = '.swiper-container';
    if (className) {
      selector = className.split(' ')[0];
    }
    // id 的优先级最高
    if (id) {
      selector = `#${id}`;
    }
    this.mySwiper = new Swiper(selector, options);
  };

  componentWillReceiveProps = (nextProps) => {
    
  }
  

  render() {
    const { className, ...restProps } = this.props;
    <div className={`swiper-container ${className}`} {...restProps}>
      <div className="swiper-wrapper">{this.props.children}</div>
    </div>;
  }
}
