import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LzTabs from '../LzTabs';
import LzFormControl from '../components/LzFormControl';
import { Tabs, message, Form, Row, Col, Spin, Button, Popconfirm } from 'antd';
import { getRecord, getColumnsDefine, modRecord } from '../../util/api';
import { addPropsToControl, getRules } from 'Util/controls';

import './LzClassifyFieldTabs.less';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

/**
 * 分类字段 tabs
 */
class LzClassifyFieldTabs extends React.Component {
  static propTypes = {
    /**
     * 主表id
     * 默认：-
     */
    resid: PropTypes.number,
    /**
     * 主表某条记录id
     * 默认：-
     */
    hostrecid: PropTypes.number,
    /**
     * form 表单控件布局
     * 可选：'default' | 'custom'
     * 默认：'default'
     */
    formLayout: PropTypes.oneOf(['default', 'custom']),
    /**
     * 表单列数
     * 默认：2
     */
    colCount: PropTypes.number
  };
  static defaultProps = {
    resid: 585080536053,
    hostrecid: 565804477532,
    formLayout: 'default',
    colCount: 2
  };

  constructor() {
    super();
  }

  state = {
    record: {},
    classes: [],
    viewStatus: 'view', // 视图状态： 'view' 表示显示；'edit' 表示编辑
    loading: true
  };

  async componentDidMount() {
    await this.getColumnsDefine();
    this.getRecord();
  }

  // 获取高级字典中对应的数据
  getAdvDictionaryVal = values => {
    const { setFieldsValue } = this.props.form;
    values.forEach(value => {
      setFieldsValue({
        [value.innerFieldName]: value.value
      });
    });
    message.success('选择成功');
  };

  // 返回高级字典中过滤字段的值
  retFilterFieldValues = innerFieldNames => {
    const { getFieldValue } = this.props.form;
    const colValues = [];
    innerFieldNames.forEach(innerFieldName => {
      colValues.push({
        col1: innerFieldName.col1,
        col1Value: getFieldValue(innerFieldName.col1),
        col2: innerFieldName.col2
      });
    });
    return colValues;
  };
  // 获取记录数据
  getRecord = async () => {
    const { resid, hostrecid } = this.props;
    let res;
    try {
      res = await getRecord(resid, hostrecid);
    } catch (err) {
      return message.error(err.message);
    }
    const record = res.data && res.data[0];
    this.setState({ record, loading: false });
  };

  classes = [];
  // 获取列定义数据
  getColumnsDefine = async () => {
    const { resid } = this.props;
    let res;
    try {
      res = await getColumnsDefine(resid);
    } catch (err) {
      return message.error();
    }
    let classes = [];
    const data = res.data;
    Object.keys(data).forEach(item => {
      if (data[item].ColResDataSort) {
        if (
          classes.some((klass, index) => {
            if (klass.name === data[item].ColResDataSort) {
              return classes[index].list.push(data[item]);
            }
          })
        ) {
        } else {
          classes.push({
            name: data[item].ColResDataSort,
            list: [data[item]]
          });
        }
      }
    });

    // 添加属性
    classes.forEach(klass => {
      addPropsToControl(klass.list);
    });

    this.setState({
      classes
    });
  };

  // 转变为编辑状态
  toEditStatus = () => {
    this.setState({
      viewStatus: 'edit'
    });
  };

  // 转变为查看状态
  toViewStatus = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      viewStatus: 'view'
    });
  };

  save = () => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        let res;
        try {
          values.REC_ID = this.state.record.REC_ID;
          res = await modRecord(this.props.resid, values);
        } catch (err) {
          return message.error(err.message);
        }
        message.success('保存成功');
        this.setState({ viewStatus: 'view' });
      }
    });
  };

  render() {
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    };
    const { record, viewStatus, classes, loading } = this.state;
    const { formLayout, colCount } = this.props;
    const {
      getFieldDecorator,
      getFieldsError,
      isFieldsTouched,
      resetFields
    } = this.props.form;

    return (
      <div className="lz-classify-field-tabs">
        <Spin spinning={loading}>
          <Form>
            <Tabs defaultActiveKey="0" type="card">
              {classes.map((klass, index) => {
                return (
                  <TabPane tab={klass.name} key={index}>
                    <Row>
                      {klass.list.map((controlData, index) => {
                        return (
                          <Col
                            span={24 / colCount}
                            key={controlData.FrmColResID + index}
                          >
                            <FormItem
                              {...(formLayout === 'default'
                                ? { label: controlData.ColDispName }
                                : {})}
                              {...formItemLayout}
                            >
                              {getFieldDecorator(controlData.ColName, {
                                initialValue:
                                  record && record[controlData.ColName],
                                rules: getRules(controlData)
                              })(
                                <LzFormControl
                                  controlData={controlData}
                                  record={record}
                                  getAdvDictionaryVal={this.getAdvDictionaryVal}
                                  retFilterFieldValues={
                                    this.retFilterFieldValues
                                  }
                                  formLayout={formLayout}
                                  readOnly={
                                    !!(
                                      controlData.FrmReadonly ||
                                      controlData.ColIsReadOnly
                                    )
                                  }
                                  placeholder={controlData.ColTooltip}
                                  viewStatus={viewStatus}
                                />
                              )}
                            </FormItem>
                          </Col>
                        );
                      })}
                    </Row>
                  </TabPane>
                );
              })}
            </Tabs>
          </Form>
          <div className="btns">
            {viewStatus === 'view' ? (
              <Button onClick={this.toEditStatus}>编辑</Button>
            ) : (
              <React.Fragment>
                <Button onClick={this.save}>保存</Button>
                <Popconfirm
                  placement="top"
                  title="你确定要取消修改的数据吗？"
                  onConfirm={this.toViewStatus}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button>取消</Button>
                </Popconfirm>
              </React.Fragment>
            )}
          </div>
        </Spin>
      </div>
    );
  }
}
export default Form.create({})(LzClassifyFieldTabs);
