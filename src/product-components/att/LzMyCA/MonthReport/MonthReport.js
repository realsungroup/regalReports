import React from 'react';
import { message, Radio, Spin, Tabs, Form } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getMainTableData, getFormData } from 'Util/api';
import LzForm from '../../../../lib/unit-component/components/LzForm';
import dealControlArr from '../../../../util/controls';
import './MonthReport.less';
const { TabPane } = Tabs;
const FormItem = Form.Item;

/**
 * 考勤月报
 */
class MonthReport extends React.Component {
  static propTypes = {
    cmswhere: PropTypes.string.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      mRRecord: {},
      formFormData: [],
      loading: false
    };
  }

  componentDidMount() {
    this.getMRRecordAndFormData(this.props.cmswhere);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.cmswhere !== nextProps.cmswhere) {
      this.getMRRecordAndFormData(nextProps.cmswhere);
    }
  }

  getMRRecordAndFormData = async cmswhere => {
    this.setState({ loading: true });
    let res;
    try {
      res = await Promise.all([
        getMainTableData(593257182832, {
          cmswhere
        }),
        getFormData(593257182832, 'default')
      ]);
    } catch (err) {
      message.error(err.message);
      this.setState({ loading: false });
    }
    let mRRecord;
    if (res[0].data.length) {
      mRRecord = res[0].data[0];
    } else {
      mRRecord = {};
    }
    const formFormData = dealControlArr(res[1].data.columns);
    this.setState({ mRRecord, formFormData, loading: false });
  };

  render() {
    const { mRRecord, formFormData, loading } = this.state;
    const hasMRData = !!Object.keys(mRRecord).length;

    return (
      <div className="month-report">
        {(function() {
          if (loading) {
            return <div style={{ textAlign: 'center' }}>加载中...</div>;
          } else {
            return hasMRData ? (
              <LzForm
                displayMod="classify"
                viewStatus="view"
                colCount={2}
                record={mRRecord}
                formFormData={formFormData}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>暂无数据</div>
            );
          }
        })()}
      </div>
    );
  }
}
export default Form.create({})(MonthReport);
