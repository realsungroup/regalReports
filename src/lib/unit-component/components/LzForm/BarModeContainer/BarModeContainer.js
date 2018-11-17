import React from 'react';
import PropTypes from 'prop-types';
import { LzFormItem } from '../../../../../loadableComponents';
import classNames from 'classnames';
import './BarModeContainer.less';
import cloneDeep from 'lodash.clonedeep';

export default class BarModeContainer extends React.Component {
  static propTypes = {
    /**
     * bar 上的控件数组
     */
    barControlArr: PropTypes.array,

    /**
     * label 是否显示
     * 可选：true | false
     * 默认：true
     */
    isLabelVisible: PropTypes.bool,

    /**
     * 是否展开
     * 可选：true | false
     * 默认：false
     */
    isExpand: PropTypes.bool
  };

  static defaultProps = {
    isExpand: false
  };

  constructor(props) {
    super(props);
    const { isLabelVisible, barControlArr, isExpand, styles } = props;
    const newArr = cloneDeep(barControlArr);
    console.log('isLabelVisible:', isLabelVisible);

    // 隐藏 bar 上的 label
    if (!isLabelVisible) {
      newArr.forEach(item => {
        item.isLabelVisible = false;
      });
    }

    this.state = {
      isExpand, // 是否是展开状态
      barControlArr: newArr,
      styles
    };
  }

  componentWillReceiveProps = nextProps => {
    const { isLabelVisible, barControlArr, styles } = nextProps;
    const newArr = cloneDeep(barControlArr);
    // 隐藏 bar 上的 label
    if (!isLabelVisible) {
      newArr.forEach(item => {
        item.isLabelVisible = false;
      });
    }
    this.setState({ barControlArr: newArr, styles });
  };

  expandChange = () => {
    const { isExpand } = this.state;
    this.setState({ isExpand: !isExpand });
  };

  render() {
    const { children, isLabelVisible, ...restProps } = this.props;
    const { isExpand, barControlArr, styles } = this.state;
    return (
      <div className="lz-form-bar-mode-container">
        <div className="bar-mode-header">
          <div className="bar-mode-header-fields">
            {barControlArr.map((barControl, index) => {
              return (
                <LzFormItem
                  key={barControl.FrmColResID + index}
                  controlData={barControl}
                  style={styles && styles[index]}
                  {...restProps}
                />
              );
            })}
          </div>
          <div className="bar-mode-header-operations">
            {isExpand ? (
              <i
                className="iconfont icon-pack-up expand-btn"
                onClick={this.expandChange}
              />
            ) : (
              <i
                className="iconfont icon-expand expand-btn"
                onClick={this.expandChange}
              />
            )}
          </div>
        </div>
        <div
          className={classNames('bar-mode-body', {
            hide: !isExpand,
            show: isExpand
          })}
        >
          {children}
        </div>
      </div>
    );
  }
}
