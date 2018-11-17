import React from 'react';
import PropTypes from 'prop-types';
import { message, Button, Popconfirm, Spin } from 'antd';

// import { LzForm } from '../../../loadableComponents';
import LzForm from '../components/LzForm';
import { getFormData } from '../../util/api';
import dealControlArr, { dealFormData } from 'Util/controls';
import { addRecord, getMainTableData } from '../../util/api';

import './LzFormUnitContainer.less';

/**
 * LzForm 的 [单元容器] 组件
 */
export default class LzFormUnitContainer extends React.Component {
  static propTypes = {
    /**
     * 表 id
     */
    resid: PropTypes.number,

    /**
     * bar 模式的表单 props
     * 默认：-
     */
    barFormProps: PropTypes.object
    // 例如：
    // {
    //   barMode: {
    //     count: 3,
    //     isLabelVisible: false,
    //     styles: [{ color: 'ff0000' },{ color: '00ff00' },{ color: '0000ff' }]
    //   },
    //   colCount: 2,
    //   // 等 其他 LzForm 的配置
    // }
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      formFormData: {
        subTableArr: [],
        allControlArr: [],
        canOpControlArr: [],
        containerControlArr: []
      },
      latestRecord: {}, // 最新一条添加的记录
      loading: false
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    this.setState({ loading: true });
    const { formName, resid } = this.props;
    let res;
    try {
      res = await Promise.all([
        getFormData(resid, formName),
        getMainTableData(resid, {
          current: 0,
          pageSize: 1
        })
      ]);
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    const formFormData = dealControlArr(res[0].data.columns);
    const latestRecord = res[1].data.length ? res[1].data[0] : {};
    this.setState({ formFormData, latestRecord, loading: false });
  };

  getLatestRecord = async () => {
    this.setState({ loading: true });

    let res;
    try {
      res = await getMainTableData(this.props.resid, {
        current: 0,
        pageSize: 1
      });
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    this.setState({ latestRecord: res.data[0], loading: false });
  };

  addRecord = form => {
    const { validateFieldsAndScroll, resetFields } = form;
    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { resid } = this.props;
        let res;
        dealFormData(values);
        try {
          res = await addRecord(resid, values);
        } catch (err) {
          return message.error(err.message);
        }
        message.success('录入成功！');
        resetFields();
        this.getLatestRecord();
      }
    });
  };

  reset = form => {
    form.resetFields();
  };

  renderLzFormFooter = form => {
    return (
      <div className="form-footer">
        <Button
          type="primary"
          onClick={() => this.addRecord(form)}
          className="footer-btn"
        >
          录入
        </Button>
        <Popconfirm
          placement="top"
          title="你确定要重置吗？"
          onConfirm={() => {
            form.resetFields();
          }}
          okText="确定"
          cancelText="取消"
        >
          <Button className="footer-btn">重置</Button>
        </Popconfirm>
      </div>
    );
  };

  render() {
    const { formFormData, latestRecord, loading } = this.state;
    const { colCount, record, resid } = this.props;
    console.log('formFormData:', formFormData);
    return (
      <Spin spinning={loading}>
        <div className="lz-form-unit">
          {latestRecord.REC_ID && (
            <LzForm
              formFormData={formFormData}
              operation="check"
              record={latestRecord}
              {...this.props.barFormProps}
            />
          )}
          <LzForm
            colCount={colCount}
            record={record}
            resid={resid}
            formFormData={formFormData}
            footer={this.renderLzFormFooter}
            operaction="add"
          />
        </div>
      </Spin>
    );
  }
}
