import React from 'react';
import { Form, message } from 'antd';
import { EditableContext } from '../LzEditableFormRow';
import LzFormControl from '../../components/LzFormControl';
import { isEmptyObj } from '../../../util/util';
import { getRules } from 'Util/controls';

const FormItem = Form.Item;

/**
 * 可编辑的单元格
 */
export default class EditableCell extends React.Component {
  constructor() {
    super();
  }
  // 获取高级字典中对应的数据
  getAdvDictionaryVal = values => {
    const { setFieldsValue } = this.form;
    values.forEach(value => {
      setFieldsValue({
        [value.innerFieldName]: value.value
      });
    });
    message.success('选择成功');
  };
  // 返回高级字典中过滤字段的值
  retFilterFieldValues = innerFieldNames => {
    const { getFieldValue } = this.form;
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
  form = {};
  render() {
    const {
      rowIndex,
      record,
      controlData,
      editing,
      talbeRef,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {form => {
          const { getFieldDecorator } = form;
          // 存储高级字典所需要用到的 form 对象
          if (!isEmptyObj(form.getFieldsValue()) && this.form !== form) {
            this.form = form;
          }
          // 编辑时，存储 form 对象
          /**if (
            talbeRef &&
            !isEmptyObj(form.getFieldsValue()) &&
            talbeRef.tempForm !== form &&
            talbeRef.mode === 'edit'
          ) {
            form.REC_ID = record.REC_ID;
            form.index = tableRef.tempFormArr.length;
            talbeRef.tempForm = form;
          }*/

          if (talbeRef && !isEmptyObj(form.getFieldsValue())) {
            // 添加记录时，存储 form 对象
            if (talbeRef.mode === 'add') {
              if (
                talbeRef.addFormCount > talbeRef.addFormArr.length &&
                talbeRef.addFormArr.every(
                  tempForm => tempForm.REC_ID !== record.REC_ID
                )
              ) {
                form.REC_ID = record.REC_ID;
                form.index = talbeRef.addFormArr.length;
                form._state = 'added';
                talbeRef.addFormArr.push(form);
              }
            }
            // 编辑记录时，存储 form 对象
            else if (talbeRef.mode === 'edit') {
              if (
                talbeRef.formCount > talbeRef.tempFormArr.length &&
                talbeRef.tempFormArr.every(
                  tempForm => tempForm.REC_ID !== record.REC_ID
                ) &&
                record.REC_ID > 0
              ) {
                form.REC_ID = record.REC_ID;
                form.index = talbeRef.tempFormArr.length;
                form._state = 'modified';
                talbeRef.tempFormArr.push(form);
              }
            }
          }

          /**if (
            talbeRef &&
            !isEmptyObj(form.getFieldsValue()) &&
            talbeRef.mode === 'add'
          ) {
            if (talbeRef.formCount > talbeRef.tempFormArr.length) {
              form.REC_ID = record.REC_ID;
              form.index = talbeRef.tempFormArr.length;
              talbeRef.tempFormArr.push(form);
            }
          }*/
          return (
            <td {...restProps}>
              {editing && controlData ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(controlData.ColName, {
                    initialValue: record && record[controlData.ColName],
                    rules: getRules(controlData)
                  })(
                    <LzFormControl
                      controlData={controlData}
                      record={record}
                      rowIndex={rowIndex}
                      readOnly={
                        !!(controlData.FrmReadonly || controlData.ColIsReadOnly)
                      }
                      placeholder={controlData.ColTooltip}
                      viewStatus="edit"
                      getAdvDictionaryVal={this.getAdvDictionaryVal}
                      retFilterFieldValues={this.retFilterFieldValues}
                    />
                  )}
                </FormItem>
              ) : (
                restProps.children
              )}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
  numToStr = value => {
    if (typeof value === 'undefined' || (typeof value === 'object' && !value)) {
      return '';
    }
    return value + '';
  };
}
