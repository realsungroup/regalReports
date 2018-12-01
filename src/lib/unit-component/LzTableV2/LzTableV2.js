import React from 'react';
import PropTypes from 'prop-types';
import { Table, message, DatePicker, Input } from 'antd';
import './LzTableV2.less';
import { getProcedure } from 'Util/api';
import moment from 'moment';
import IconWithTooltip from '../../../pages/components/IconWithTooltip';
import exportJsonExcel from 'js-export-excel';

const { RangePicker } = DatePicker;
const Search = Input.Search;

/**
 * LzSteps 组件
 */
export default class LzTableV2 extends React.Component {
  static propTypes = {
    resid: PropTypes.number.isRequired,
    title: PropTypes.string,
    procedure: PropTypes.string.isRequired,
    paranames: PropTypes.string.isRequired,
    paratypes: PropTypes.string.isRequired,
    pagination: PropTypes.object.isRequired
  };
  static defaultProps = {
    title: 'LzTableV2'
  };

  constructor(props) {
    super(props);
    const pagination = { ...props.pagination, total: 0 };
    const startDate = moment().startOf('day');
    const endDate = moment().endOf('day');

    this.state = {
      tableData: [],
      columns: [],
      startDate,
      endDate,
      loading: false,
      pagination,
      searchVal: ''
    };
  }

  componentDidMount = () => {
    this.getData();
  };

  getData = async (pageindex = 0, pagesize = 10) => {
    const { resid, procedure, paranames, paratypes } = this.props;
    const paravalues = this.getParaValues();

    if (!paravalues) {
      return message.error('请选择时间段');
    }
    this.setState({ loading: true });
    let res;
    try {
      res = await getProcedure(
        resid,
        procedure,
        paranames,
        paratypes,
        paravalues,
        pageindex,
        pagesize
      );
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    const columns = this.getColumns(res.cmscolumninfo);
    const tableData = res.data;
    const total = res.total;
    const newPagination = {
      pageSize: pagesize,
      current: pageindex + 1,
      total
    };
    this.setState({
      columns,
      tableData,
      loading: false,
      pagination: newPagination
    });
  };

  getAllData = async () => {
    this.setState({ loading: true });
    const { resid, procedure, paranames, paratypes } = this.props;
    const paravalues = this.getParaValues();
    let res;
    try {
      res = await getProcedure(
        resid,
        procedure,
        paranames,
        paratypes,
        paravalues,
        0,
        0
      );
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    const columns = this.getColumns(res.cmscolumninfo);
    const tableData = res.data;
    this.setState({ loading: false });
    return { columns, tableData };
  };

  getColumns = columns => {
    let arr = [];
    // 数据栏
    columns.forEach(column => {
      const opt = {
        title: column.text,
        dataIndex: column.id,
        key: column.id,
        width: 200,
        align: 'left'
      };
      arr.push(opt);
    });
    return arr;
  };

  getParaValues = () => {
    const { startDate, endDate, searchVal } = this.state;
    if (!startDate || !endDate) {
      return;
    }
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userCode = userInfo.UserCode;
    const str =
      startDate.format('YYYYMMDD') +
      ',' +
      endDate.format('YYYYMMDD') +
      ',' +
      userCode +
      ',' +
      searchVal;
    return str;
  };

  handleRangePickerChange = dates => {
    if (!dates[0] || !dates[1]) {
      return;
    }
    let startDate = null,
      endDate = null;
    if (dates) {
      startDate = dates[0];
      endDate = dates[1];
    }
    const pagination = {
      ...this.state.pagination,
      current: 0,
      total: 0
    };
    this.setState({ startDate, endDate, pagination }, () => {
      this.getData();
    });
  };

  getScrollX = () => {
    const { columns } = this.state;
    return columns.length * 200;
  };

  handleTableChange = async pagination => {
    this.getData(pagination.current - 1, pagination.pageSize);
  };

  handleExportBtnClick = async () => {
    const { tableData, columns } = await this.getAllData();

    const sheetHeader = columns.map(column => column.title);
    const dataIndex = columns.map(column => column.dataIndex);

    const sheetData = tableData.map(record =>
      dataIndex.map(item => record[item])
    );

    const columnWidths = columns.map(() => 10);
    const option = {
      datas: [
        {
          sheetHeader,
          sheetName: this.props.title,
          sheetData,
          columnWidths
        }
      ]
    };
    const toExcel = new exportJsonExcel(option);
    toExcel.saveExcel();
  };

  handleSearch = value => {
    this.setState({ searchVal: value }, () => {
      this.getData(0, this.state.pagination.pageSize);
    });
  };

  render() {
    const {
      tableData,
      pagination,
      columns,
      startDate,
      endDate,
      loading
    } = this.state;

    return (
      <div className="lz-table-v2">
        <div className="lz-table-v2__op">
          <IconWithTooltip
            tip="导出"
            iconClass="icon-export"
            className="lz-table-v2__export-btn"
            onClick={this.handleExportBtnClick}
          />
        </div>
        <div>
          <Search
            style={{ width: 200, margin: '0 10px' }}
            placeholder="请输入值"
            onSearch={this.handleSearch}
            enterButton="搜索"
          />
          <RangePicker
            onChange={this.handleRangePickerChange}
            style={{ marginBottom: 20 }}
            value={[startDate, endDate]}
          />
        </div>
        <Table
          pagination={pagination ? pagination : false}
          loading={loading}
          bordered={true}
          rowKey="REC_ID"
          columns={columns}
          dataSource={tableData}
          onChange={this.handleTableChange}
          size="small"
          scroll={{
            x: this.getScrollX(),
            y: 350
          }}
          locale={{
            emptyText: <div className="iconfont icon-default-nodata" />
          }}
        />
      </div>
    );
  }
}
