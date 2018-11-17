import React, { Fragment } from 'react';
import PageBody from '../components/PageBody';
import HalfPanel from '../components/HalfPanel';
import './PersonCenter.less';
import { Tabs, message, Button, Spin, Popconfirm } from 'antd';
import { getFormData, getTableData, modRecord } from '../../util/api';
import dealControlArr from 'Util/controls';
import { clone } from '../../util/util';
import LzFormWithFooter from '../../lib/unit-component/components/LzFormWithFooter';
import { clearCache } from 'Util/api';

const TabPane = Tabs.TabPane;

// 本页面的配置信息在 public/business.js 文件中
const tabsConfig = window.personCenterResIds;

export default class PersonCenter extends React.Component {
  constructor() {
    super();
    this.state = {
      tabsConfig,
      formPropsArr: [], // 传给 LzForm 组件需的 props
      activeKey: '0',
      mod: 'view', // 模式：'view' 表示查看模式；'edit' 表示编辑模式
      spinning: true
    };
  }

  componentDidMount() {
    this.getData(this.state.activeKey);
  }

  getData = async activeKey => {
    this.setState({ spinning: true, mod: 'view', operation: 'check' });
    const tabConfig = this.state.tabsConfig[activeKey];
    const resid = tabConfig.resid,
      formName = tabConfig.formName || 'default';
    let resTableData, resFormData, res;
    try {
      res = await Promise.all([
        getTableData(resid),
        getFormData(resid, formName)
      ]);
      resTableData = res[0];
      resFormData = res[1];
    } catch (err) {
      return message.error(err.message);
    }
    const record = resTableData.data[0];
    const formFormData = dealControlArr(resFormData.data.columns);

    const { formPropsArr } = this.state;
    formPropsArr[activeKey] = {
      record,
      formFormData,
      resid
    };
    this.setState({ formPropsArr, activeKey, spinning: false });
  };

  onChange = activeKey => {
    this.getData(activeKey);
  };

  toEdit = () => {
    this.setState({ mod: 'edit', operation: 'mod' });
  };

  toView = () => {
    const { activeKey } = this.state;
    const form = this[`formRef${activeKey}`].props.form;
    form.resetFields();
    this.setState({ mod: 'view', operation: 'check' });
  };

  save = (form, record) => {
    const { activeKey, tabsConfig } = this.state;
    form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({ spinning: true });
        const resid = tabsConfig[activeKey].resid;
        values.REC_ID = record.REC_ID;
        try {
          await modRecord(resid, values);
        } catch (err) {
          this.setState({ spinning: false });
          return message.error(err.message);
        }
        message.success('修改成功');
        this.setState({ spinning: false, mod: 'view', operation: 'check' });
      }
    });
  };

  saveCallback = async () => {
    let res;
    try {
      res = await clearCache();
    } catch (err) {
      return message.error(err.message);
    }
    if (res !== 'ok') {
      message.error('清除缓存失败');
    }
  };

  render() {
    const { tabsConfig, activeKey, formPropsArr, spinning } = this.state;
    const lzFormProps = formPropsArr[activeKey];

    return (
      <PageBody>
        <HalfPanel title="个人中心" className="person-center-halfpanel">
          <div className="person-center-tabs">
            <Spin spinning={spinning}>
              <Tabs type="card" onChange={this.onChange} activeKey={activeKey}>
                {tabsConfig &&
                  tabsConfig.length > 0 &&
                  tabsConfig.map((tabConfig, index) => (
                    <TabPane tab={tabConfig.title} key={index}>
                      {lzFormProps && (
                        <LzFormWithFooter
                          ref={`lzForm${activeKey}`}
                          wrappedComponentRef={inst =>
                            (this[`formRef${activeKey}`] = inst)
                          }
                          displayMod="classify"
                          record={lzFormProps.record}
                          formFormData={lzFormProps.formFormData}
                          resid={lzFormProps.resid}
                          height={500}
                          cancelBtn
                          delBtn={false}
                          operation={'mod'}
                          dataMode="main"
                          saveCallback={this.saveCallback}
                        />
                      )}
                    </TabPane>
                  ))}
              </Tabs>
            </Spin>
          </div>
        </HalfPanel>
      </PageBody>
    );
  }
}
