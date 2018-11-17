import React, { Fragment } from 'react';
import dealControlArr, {
  getControlStyle,
  giveControlAddCustomType,
  dealFormData
} from 'Util/controls';
import './LzFormModalContainer.less';

import { Modal, message, Button, Popconfirm } from 'antd';
import PropTypes from 'prop-types';
import LzForm from '../LzForm';
import LzFormWithFooter from '../LzFormWithFooter';
import { addRecord, addSubRecord, modRecord } from '../../../util/api';

/**
 * LzFormWithFooter 组件的 [模态框容器] 组件
 */
export default class LzFormModalContainer extends React.Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  // // 点击 cancel 按钮
  // onCancel = cb => {
  //   cb && cb();
  // };

  // // 点击 confirm 按钮
  // onConfirm = async confirmCb => {
  //   const {
  //     operation,
  //     resid,
  //     subresid,
  //     dataMode,
  //     formSubTablesProps,
  //     hostrecid
  //   } = this.props;
  //   let id;
  //   if (dataMode === 'main') {
  //     id = resid;
  //   } else if (dataMode === 'sub') {
  //     id = subresid;
  //   }
  //   // return;
  //   switch (operation) {
  //     // 添加
  //     case 'add': {
  //       // 有子表时，同时保存记录和子表数据
  //       if (formSubTablesProps) {
  //         this.saveRecordAndSubTable('add');
  //       } else {
  //         // 无子表时，只保存记录
  //         const { getFieldsValue, validateFieldsAndScroll } = this.form;
  //         validateFieldsAndScroll(async (err, values) => {
  //           if (!err) {
  //             const formData = getFieldsValue();
  //             dealFormData(formData);
  //             let res;
  //             try {
  //               if (dataMode === 'main') {
  //                 res = await addRecord(resid, formData);
  //               } else if (dataMode === 'sub') {
  //                 res = await addSubRecord(
  //                   resid,
  //                   hostrecid,
  //                   subresid,
  //                   formData
  //                 );
  //               }
  //             } catch (err) {
  //               return message.error(err.message);
  //             }
  //             confirmCb && confirmCb(operation, this.state.record, 0);
  //           }
  //         });
  //       }
  //       break;
  //     }
  //     // 修改
  //     case 'mod': {
  //       // 有子表时，同时修改记录和子表数据
  //       if (formSubTablesProps) {
  //         this.saveRecordAndSubTable('mod');
  //       } else {
  //         // 无子表时，只修改记录
  //         const { getFieldsValue, validateFieldsAndScroll } = this.form;
  //         const { record } = this.props;
  //         validateFieldsAndScroll(async (err, values) => {
  //           if (!err) {
  //             const formData = getFieldsValue();
  //             formData.REC_ID = record.REC_ID;
  //             dealFormData(formData);
  //             try {
  //               await modRecord(id, formData);
  //             } catch (err) {
  //               return message.error(err.message);
  //             }
  //             confirmCb &&
  //               confirmCb(operation, this.state.record, this.props.rowIndex);
  //           }
  //         });
  //       }

  //       break;
  //     }
  //     //查看
  //     case 'check':
  //       this.checkRecord(confirmCb);
  //   }
  // };

  // 渲染表单 footer
  // renderFormFooter = form => {
  //   this.form = form;
  //   const { operation, onConfirm, formSubTablesProps, onCancel } = this.props;
  //   const { resetFields, getFieldsError, isFieldsTouched } = form;
  //   let fieldsError;
  //   if (operation === 'add' || formSubTablesProps) {
  //     fieldsError = false;
  //   } else {
  //     if (!isFieldsTouched()) {
  //       // 没有修改过字段值，不能进行保存操作
  //       fieldsError = true;
  //     } else {
  //       fieldsError = getFieldsError();
  //     }
  //   }
  //   return (
  //     <div className="lz-form-container-footer">
  //       {operation !== 'check' && (
  //         <Button
  //           type="primary"
  //           disabled={canConfirm(fieldsError)}
  //           onClick={() => {
  //             this.onConfirm(onConfirm);
  //           }}
  //           className="footer-btn"
  //         >
  //           {confirmText[operation]}
  //         </Button>
  //       )}
  //       {(operation === 'mod' || operation === 'add') &&
  //         !formSubTablesProps && (
  //           <Popconfirm
  //             placement="top"
  //             title="你确定要重置吗？"
  //             onConfirm={() => {
  //               resetFields();
  //             }}
  //             okText="确定"
  //             cancelText="取消"
  //           >
  //             <Button className="footer-btn">重置</Button>
  //           </Popconfirm>
  //         )}
  //       {onCancel && (
  //         <Button
  //           className="footer-btn"
  //           onClick={() => {
  //             this.onCancel(onCancel);
  //           }}
  //         >
  //           关闭
  //         </Button>
  //       )}
  //     </div>
  //   );
  // };

  render() {
    const {
      formFormName,
      operation,
      modalWidth,
      onCancel,
      onConfirm,
      ...restProps
    } = this.props;
    const hasEditBtn = operation !== 'check';
    return (
      <Modal
        closable={true}
        maskClosable={false}
        cancelText={'关闭'}
        title={null}
        footer={null}
        visible={true}
        width={modalWidth || 600}
        destroyOnClose={true}
        className="lz-form-container"
        onCancel={onCancel}
        style={{ borderRadius: 10 }}
      >
        <LzFormWithFooter
          cancelCb={onCancel}
          saveCb={onConfirm}
          header={formFormName}
          saveFormMode={operation}
          operation={operation}
          viewStatus={operation === 'check' ? 'view' : 'edit'}
          editBtn={hasEditBtn}
          cancelBtn={true}
          delBtn={false}
          cancelBtn={false}
          {...restProps}
        />
      </Modal>
    );
  }
}
