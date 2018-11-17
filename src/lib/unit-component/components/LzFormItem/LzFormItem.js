import React from 'react';
import './LzFormItem.less';
import { Form } from 'antd';
import { getRules } from 'Util/controls';
import PropTypes from 'prop-types';
import LzFormControl from '../LzFormControl';

const FormItem = Form.Item;

/**
 * LzFormItem 组件：由 “label 标签” 和 “control 控件” 两部分组成
 */
export default class LzFormItem extends React.Component {
  static propTypes = {
    /**
     * 控件数据
     */
    controlData: PropTypes.object.isRequired,

    /**
     * 控件的布局
     * 可选值：'default' | 'custom'
     * 默认值：'default'
     * 描述：'default' 表示从上到下布局；'custom' 表示根据后台数据来绝对定位布局
     */
    formLayout: PropTypes.string,

    /**
     * this.props.form
     */
    form: PropTypes.object,

    /**
     * 记录
     * 可选值：-
     * 默认值：-
     * 描述：表的某一条记录数据
     */
    record: PropTypes.object
  };
  static defaultProps = {};

  getLabel = () => {
    const { formLayout, controlData } = this.props;
    if (formLayout === 'default' && controlData.isLabelVisible) {
      return { label: controlData.ColDispName };
    }
  };

  render() {
    const { record, controlData, form, style } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 14
      }
    };
    let formItemStyle = {};
    if (controlData.isVisible) {
      formItemStyle.display = 'block';
    } else {
      formItemStyle.display = 'none';
    }
    formItemStyle = { ...style, ...formItemStyle };
    return (
      <FormItem {...this.getLabel()} {...formItemLayout} style={formItemStyle}>
        {getFieldDecorator(controlData.ColName, {
          initialValue: record && record[controlData.ColName],
          rules: getRules(controlData)
        })(
          <LzFormControl
            readOnly={!!(controlData.FrmReadonly || controlData.ColIsReadOnly)}
            {...this.props}
          />
        )}
      </FormItem>
    );
  }
}
