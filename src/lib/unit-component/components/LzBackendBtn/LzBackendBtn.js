import React from 'react';
import PropTypes from 'prop-types';
import { Popconfirm } from 'antd';
import { message, Button } from 'antd';
import { dealButton, getFormData } from 'Util/api';
import dealControlArr, { dealFormData } from 'Util/controls';

/**
 * 后端按钮
 */
export default class LzBackendBtn extends React.Component {
  static propTypes = {
    /**
     * 后端按钮信息
     */
    btnInfo: PropTypes.object.isRequired,

    /**
     * 点击后端按钮的回调函数，Type 的值不同，传给 onConfirm 的参数也不一样：
     * 当 Type =
     * 1 时：onConfirm(1, records)； // 1 为 Type 的值；records 为记录
     * 4 时：onConfirm(4, records)； // 4 为 Type 的值；records 为记录
     * 5 时：onConfirm(4, records)； // 5 为 Type 的值；records 为记录
     * 6 时：onConfirm(6, records, formData, defaultRecord) // 6 为 Type 的值；records 为记录；formData defaultRecord 为 btnInfo 中预设的记录默认值
     * 7 时：onConfirm(7, records, formData, defaultRecord) // 7 为 Type 的值；records 为记录；formData defaultRecord 为 btnInfo 中预设的记录默认值
     * 8 时：onConfirm(8, records, formData, defaultRecord) // 8 为 Type 的值；records 为记录；formData 为请求到的窗体数据
     */
    onConfirm: PropTypes.func.isRequired,

    /**
     * 后端按钮所在表的 resid
     */
    resid: PropTypes.number.isRequired,

    /**
     * 后端按钮所操作的记录（当 btnInfo.isUsePopconfirm 为 true 时，这是一个必传的参数）
     */
    records: function(props, propName, componentName) {
      if (props.btnInfo.isUsePopconfirm && !Array.isArray(props[propName])) {
        return new Error(
          `在 ${componentName} 中，当 btnInfo.isUsePopconfirm 为 true 时，${propName} 必传，且类型为 array`
        );
      }
    },

    /**
     * 当 btnInfo.Type 为 4 时，打开新的页面的地址（当 btnInfo.Type 为 4 时，必传）
     */
    url: function(props, propName, componentName) {
      if (props.btnInfo.Type === 4 && typeof props[propName] === 'string') {
        return new Error(
          `在 ${componentName} 中，当 btnInfo.Type 为 4 时，${propName} 必传，且类型为 string`
        );
      }
    }
  };

  getDefaultRecord = btnInfo => {
    const record = {};
    if (btnInfo.ColName1) {
      record[btnInfo.ColName1] = btnInfo.ColVal1;
    }
    if (btnInfo.ColName2) {
      record[btnInfo.ColName2] = btnInfo.ColVal2;
    }
    if (btnInfo.ColName3) {
      record[btnInfo.ColName3] = btnInfo.ColVal3;
    }
    if (btnInfo.ColName4) {
      record[btnInfo.ColName4] = btnInfo.ColVal4;
    }
    return record;
  };

  onConfirm = async () => {
    const { resid, records, onConfirm, btnInfo } = this.props;
    const { Code, OkMsgCn, FailMsgCn, Type } = btnInfo;

    // 点击后端按钮，请求后台
    if (Type === 1 || Type === 5) {
      let res,
        recids = '';
      if (!records.length) {
        return message.error('请勾选记录');
      }
      records.forEach((record, index) => {
        records.length - 1 === index
          ? (recids += record.REC_ID)
          : (recids += record.REC_ID + ',');
      });
      try {
        res = await dealButton(resid, recids, Code);
      } catch (err) {
        return message.error(FailMsgCn);
      }
      message.success(OkMsgCn);
      onConfirm && onConfirm(Type, records);

      // 跳转地址的按钮
    } else if (Type === 4) {
      const { url } = this.props;
      window.open(url, '_blank');
      onConfirm && onConfirm(Type);

      // 打开指定的 formName 的表单进行 编辑（6）/ 查看（7）/ 添加（8）
    } else if (Type === 6 || Type === 7 || Type === 8) {
      let res;
      try {
        res = await getFormData(resid, btnInfo.FormName || 'default');
      } catch (err) {
        return message.error(err.message);
      }
      const formData = dealControlArr(res.data.columns);
      const defaultRecord = this.getDefaultRecord(btnInfo);
      onConfirm && onConfirm(Type, records, formData, defaultRecord);
    }
  };

  render() {
    const { btnInfo } = this.props;
    // 有 Popconfirm 组件
    if (btnInfo.isUsePopconfirm) {
      return (
        <Popconfirm
          key={btnInfo.Name1}
          placement="top"
          title={btnInfo.ConfirmMsgCn}
          onConfirm={this.onConfirm}
          okText="确定"
          cancelText="取消"
        >
          <Button className="operation-btn" size="small">
            {btnInfo.Name1}
          </Button>
        </Popconfirm>
      );

      // 无 Popconfirm 组件
    } else {
      return (
        <Button className="operation-btn" size="small" onClick={this.onConfirm}>
          {btnInfo.Name1}
        </Button>
      );
    }
  }
}
