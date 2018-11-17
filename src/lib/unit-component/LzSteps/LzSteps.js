import React from 'react';
import PropTypes from 'prop-types';
import { Steps, Button } from 'antd';
import { LzTabs, LzCalendar, LzList } from '../../../loadableComponents';
import './LzSteps.less';
const Step = Steps.Step;

/**
 * LzSteps 组件
 */
export default class LzSteps extends React.Component {
  static propTypes = {
    /**
     * 主表 id
     */
    resid: PropTypes.number,

    /**
     * 步骤
     * 默认：-
     */
    steps: PropTypes.array.isRequired,

    /**
     * 匹配字段
     */
    mateFields: PropTypes.object
  };
  static defaultProps = {
    mateFields: [
      {
        tableFieldName: 'a1',
        stepFieldName: 'b1'
      },
      {
        tableFieldName: 'a2',
        stepFieldName: 'b2'
      },
      {
        tableFieldName: 'a3',
        stepFieldName: 'b3'
      }
    ],
    steps: [
      {
        title: '选择人员',
        component: {
          name: 'LzTabs',
          props: {
            type: 'card',
            tabPanes: [
              {
                tabName: '按部门添加',
                componentInfo: {
                  name: 'LzSelectRecords',
                  props: {
                    mainViewMode: 'tree',
                    resid: 592742244497,
                    subresid: 592742369617,
                    currentNameTree: 'DEP_ID',
                    parentNameTree: 'DEP_PID',
                    titleNameTree: 'DEP_NAME',
                    titleNameSub: 'C3_227192472953',
                    descNameSub: 'C3_227192484125',
                    contentNamesSub: ['C3_227212499515'],
                    style: {
                      height: 600,
                      overflow: 'auto'
                    }
                  }
                }
              },
              {
                tabName: '按班组添加',
                componentInfo: {
                  name: 'LzSelectRecords',
                  props: {
                    mainViewMode: 'list',
                    resid: 593017031990,
                    subresid: 592742369617,
                    titleNameList: 'DESCP',
                    titleNameSub: 'C3_227192472953',
                    descNameSub: 'C3_227192484125',
                    contentNamesSub: ['C3_227212499515'],
                    listTitle: '班组列表'
                  }
                }
              }
            ]
          }
        }
      },
      {
        title: '选择日期',
        component: {
          name: 'LzCalendar',
          props: {}
        }
      },
      {
        title: '选择班组',
        component: {
          name: 'LzList',
          props: {
            dataMode: 'main',
            resid: 593017031990,
            titleFieldName: 'DESCP'
          }
        }
      }
    ]
  };

  constructor(props) {
    super(props);
    const formData = this.getFormData(props.mateFields);
    this.state = {
      current: 0,
      formData
    };
  }

  getFormData = mateFields => {
    const obj = {};
    mateFields.forEach(mateField => {
      obj[mateField.tableFieldName] = null;
    });
    return obj;
  };

  onRecordsSelect = records => {
    if (!records.length) {
      return;
    }
    const { mateFields } = this.props;

    records.forEach(record => {});

    this.setState({ current: ++this.state.current });
  };

  renderListContent = item => {
    return (
      <a href="javascript:;" onClick={() => this.onRecordsSelect(item)}>
        选择
      </a>
    );
  };

  renderStepContent = () => {
    const { current } = this.state;
    const { steps } = this.props;
    const step = steps[current];

    const name = step.component.name;
    const props = step.component.props;
    switch (name) {
      case 'LzTabs': {
        return <LzTabs {...props} onRecordsSelect={this.onRecordsSelect} />;
      }
      case 'LzCalendar': {
        return <LzCalendar {...props} />;
      }
      case 'LzList': {
        return (
          <LzList
            {...props}
            content={this.renderListContent}
            hasSearch={false}
          />
        );
      }
    }
  };

  render() {
    const { current } = this.state;
    const { steps } = this.props;
    return (
      <div className="lz-steps">
        <Steps current={current}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <div className="lz-steps__step-content">
          <div
            className="lz-steps__content-wrap"
            style={{ height: 600, overflow: 'auto' }}
          >
            {this.renderStepContent()}
          </div>

          <div className="lz-steps__footer">
            <Button type="danger">取消</Button>
            {current !== 0 ? (
              <Button
                type="primary"
                onClick={() => this.setState({ current: --this.state.current })}
              >
                上一步
              </Button>
            ) : null}
            {current !== steps.length - 1 ? (
              <Button
                type="primary"
                onClick={() => this.setState({ current: ++this.state.current })}
              >
                下一步
              </Button>
            ) : null}
            {current === steps.length - 1 ? (
              <Button type="primary" onClick={() => {}}>
                添加
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
