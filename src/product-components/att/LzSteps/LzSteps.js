import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, message, Spin } from 'antd';
import './LzSteps.less';
import classNames from 'classnames';
import LzSelectPersons from '../LzSelectPersons';
const Step = Steps.Step;

/**
 * 步骤条添加多条记录
 */
export default class LzSteps extends React.Component {
  static propTypes = {
    /**
     * 第二步以及之后的步骤
     * 默认：[]
     */
    stepList: PropTypes.array,
    // [
    //   {
    //     stepTitle: '选择日期',
    //     renderContent: (current) => {},
    //     canToNext: () => true // 能够进入下一步的验证
    //   }
    // ]

    /**
     * 点击完成
     * 例如：() => {}
     */
    onComplete: PropTypes.func.isRequired,

    /**
     * 选择人员
     * 例如：(personList) => {}
     */
    onSelectPerson: PropTypes.func.isRequired,

    /**
     * LzSteps 是否处于加载状态
     * 默认：false
     */
    stepsLoading: PropTypes.bool
  };

  static defaultProps = {
    stepList: [],
    stepsLoading: false
  };

  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      stepsLoading: false
    };
  }
  _personList = [];
  handleSelect = personList => {
    this._personList = personList;
    this.props.onSelectPerson(personList);
  };

  renderContent = () => {
    const { current } = this.state;
    const { stepList } = this.props;
    return (
      <Fragment>
        <div
          className={classNames('lz-steps__1', {
            show: current === 0,
            hide: current !== 0
          })}
        >
          <LzSelectPersons onSelect={this.handleSelect} />
        </div>
        {stepList.map(step => (
          <Fragment key={step.stepTitle}>
            {step.renderContent(current)}
          </Fragment>
        ))}
      </Fragment>
    );
  };

  toNextStep = () => {
    const { current, personList } = this.state;
    // 第一步
    if (current === 0) {
      if (!this._personList.length) {
        return message.error('请先选择人员');
      }
      this.setState({ current: current + 1 });

      // 第二步以及之后
    } else {
      const { stepList } = this.props;
      if (
        !stepList[current - 1].canToNext ||
        stepList[current - 1].canToNext()
      ) {
        this.setState({ current: ++this.state.current });
      }
    }
  };

  toPreStep = () => {
    this.setState({ current: --this.state.current });
  };

  complete = async () => {
    this.props.onComplete();
  };

  render() {
    const { current } = this.state;
    const { stepList, stepsLoading } = this.props;
    const lastIndex = stepList.length;
    return (
      <div className="lz-steps">
        <Spin spinning={stepsLoading}>
          <Steps current={current}>
            <Step title="选择人员" />
            {stepList.map(step => (
              <Step key={step.stepTitle} title={step.stepTitle} />
            ))}
          </Steps>
          <div className="lz-steps__content">{this.renderContent()}</div>
          <div className="lz-steps__btns">
            <Button
              type="primary"
              onClick={this.complete}
              disabled={current !== lastIndex}
            >
              完成
            </Button>
            <Button
              type="primary"
              onClick={this.toPreStep}
              disabled={current === 0}
            >
              上一步
            </Button>
            <Button
              type="primary"
              onClick={this.toNextStep}
              disabled={current === lastIndex}
            >
              下一步
            </Button>
          </div>
        </Spin>
      </div>
    );
  }
}
