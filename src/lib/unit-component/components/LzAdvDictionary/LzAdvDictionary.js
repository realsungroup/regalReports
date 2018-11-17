import React from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import LzTable from '../../LzTable';
import './LzAdvDictionary.less';
import cloneDeep from 'lodash.clonedeep';

export default class LzAdvDictionary extends React.Component {
  static propTypes = {
    advDictionatyData: PropTypes.object, // 高级字典数据所在的对象
    onClose: PropTypes.func, // 高级字典关闭时的回调函数
    btnsVisible: PropTypes.object // 表格按钮显示
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { advDicTableProps = {} } = props;
    console.log('advDicTableProps:', advDicTableProps);
    this.state = {
      advDicTableProps: cloneDeep(advDicTableProps)
    };
  }

  customBtns = [
    {
      text: '选择',
      onClick: record => {
        this.onChooseRecord(record);
      }
    }
  ];

  onChooseRecord = record => {
    const { getAdvDictionaryVal, advDictionatyData, onClose } = this.props;
    const advData = advDictionatyData.AdvDictionaryListData[0];
    // 匹配字段
    const matchFileds = advData.MatchAndReferenceCols.filter(item => {
      return item.CDZ2_TYPE === 0;
    });
    const values = [];
    matchFileds.forEach(item => {
      values.push({
        value: record[item.CDZ2_COL2],
        innerFieldName: item.CDZ2_COL1
      });
    });
    getAdvDictionaryVal(values, advDictionatyData);
    onClose();
  };

  componentDidMount() {}

  // 获取 cmscolumns 查询语句
  getCmscolumns = advData => {
    let str = '';
    const len = advData.MatchAndReferenceCols.length;

    advData.MatchAndReferenceCols.forEach((item, index) => {
      index === len - 1
        ? (str += item.CDZ2_COL2)
        : (str += item.CDZ2_COL2 + ',');
    });
    return str;
  };

  // 获取由过滤字段组合成的 cmswhere 查询语句
  getCmswhere = (advData, retFilterFieldValues) => {
    const innerFieldNames = advData.DictionaryFilterCol.map(item => {
      return { col1: item.Column1, col2: item.Column2 };
    });
    if (!retFilterFieldValues || innerFieldNames.length === 0) {
      return;
    }
    const colValues = retFilterFieldValues(innerFieldNames);
    let where = '';
    colValues.forEach((colValue, index) => {
      if (index === colValues.length - 1) {
        colValue.col1Value &&
          (where += colValue.col2 + "='" + colValue.col1Value + "'"); // 需要用单引号将字段值括起来
      } else {
        colValue.col1Value &&
          (where += colValue.col2 + "='" + colValue.col1Value + "'" + ' and ');
      }
    });
    return where;
  };

  render() {
    const { onClose, advDictionatyData, retFilterFieldValues } = this.props;
    const advData = advDictionatyData.AdvDictionaryListData[0];
    const resid = advData.ResID2;
    const cmscolumns = this.getCmscolumns(advData);
    const cmswhere = this.getCmswhere(advData, retFilterFieldValues);
    const tableProps = {
      resid,
      opIsFixed: true,
      pagination: {
        current: 0,
        pageSize: 10
      },
      cmswhere,
      customBtns: this.customBtns,
      cmscolumns,
      ...this.state.advDicTableProps
    };
    return (
      <Modal
        title="高级字典"
        width={
          (tableProps.lzTableStyle && tableProps.lzTableStyle.width) || 800
        }
        destroyOnClose={true}
        visible={true}
        keyboard={true}
        maskClosable={true}
        footer={[
          <Button key={1} onClick={onClose}>
            关闭
          </Button>
        ]}
        className="lz-adv-dictionary"
        onCancel={() => {
          onClose();
        }}
      >
        <LzTable {...tableProps} />
      </Modal>
    );
  }
}
