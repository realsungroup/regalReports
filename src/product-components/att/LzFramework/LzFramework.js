import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { getMainTableData, delRow, addRecords } from 'Util/api';
import { message, Modal } from 'antd';

import './LzFramework.less';
import cloneDeep from 'lodash.clonedeep';

const getOrgChart = window.getOrgChart;
/**
 * 组织架构
 */
export default class LzFramework extends React.Component {
  static propTypes = {
    resid: PropTypes.number
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    this.getData();
  };

  updateNode = async (sender, args) => {
    console.log(args);
    const formData = { ...args.data };
    delete formData.secondManager;
    formData.parentId = args.pid;
    let res;
    try {
      res = await addRecords(this.props.resid, [formData], 'id');
    } catch (err) {
      return message.error(err.message);
    }

    if (res.data.length) {
      message.success('修改成功');
      const keys = Object.keys(args.data);
      keys.push('parentId');
      keys.push('image');
      const newRecord = {};
      keys.forEach(key => (newRecord[key] = res.data[0][key]));
      this.data.push(newRecord);
    }
  };

  removeNode = (sender, args) => {
    this.args = args;
    const result = window.confirm('您确定要删除吗？');
    if (result) {
      return this.removeRecord(sender, args);
    }
    return false;
  };

  removeRecord = async (sender, args) => {
    const record = this.data.find(item => {
      if (item.id + '' === args.id) {
        return true;
      }
    });

    if (!record) {
      return;
    }

    let res;
    try {
      res = await delRow(this.props.resid, record.REC_ID);
    } catch (err) {
      this.orgChart.loadFromJSON(cloneDeep(this.data));
      return message.error(err.message);
    }
    this.data = cloneDeep(this.data).filter(item => item.id + '' === args.id);
    message.success('删除成功');
  };

  getData = async () => {
    let res;
    try {
      res = await getMainTableData(this.props.resid, {
        cmscolumns: [
          'id',
          'parentId',
          'name',
          'title',
          'phone',
          'mail',
          'image',
          'secondManager',
          'color',
          'theme'
        ].join(',')
      });
    } catch (err) {
      return message.error(err.message);
    }
    this.data = cloneDeep(res.data);

    // color/theme
    const customize = {};
    res.data.forEach(
      item => (customize[item.id] = { color: item.color, theme: item.theme })
    );

    // init
    const peopleElement = document.getElementById('people');
    this.orgChart = new window.getOrgChart(peopleElement, {
      removeNodeEvent: this.removeNode,
      updateNodeEvent: this.updateNode,
      // insertNodeEvent: this.inserNode,
      idField: 'id',
      parentIdField: 'parentId',
      secondParentIdField: 'secondManager',
      photoFields: ['image'],
      primaryFields: ['name', 'title', 'phone', 'mail', 'secondManager'],
      expandToLevel: 5,
      enableExportToImage: true,
      dataSource: res.data,
      customize,
      boxSizeInPercentage: {
        minBoxSize: {
          width: 20,
          height: 20
        },
        boxSize: {
          width: 20,
          height: 20
        },
        maxBoxSize: {
          width: 30,
          height: 30
        }
      }
    });
  };

  render() {
    return (
      <div className="lz-framework">
        <div id="people" />
      </div>
    );
  }
}
