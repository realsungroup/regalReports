import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  message,
  DatePicker,
  Input,
  Button,
  Switch,
  Modal,
  Checkbox
} from 'antd';
import moment from 'moment';
import echarts from 'echarts';

import { getColumnsDefine, getMainTableData } from '../../util/api';
import { clone, triggerResize } from '../../util/util';
import LzAdvDictionary from '../components/LzAdvDictionary';
import './LzTableChart.less';
import classNames from 'classnames';

const Search = Input.Search;
const { MonthPicker } = DatePicker;

/**
 * lzTableChart
 */
export default class LzTableChart extends React.Component {
  static propTypes = {
    /**
     * resid
     */
    resid: PropTypes.number,

    /**
     * 标题
     */
    title: PropTypes.string,

    /**
     * 病历号字段
     */
    keyColumn: PropTypes.string,

    /**
     * 病人名称字段
     */
    nameColumn: PropTypes.string,

    /**
     * 日期匹配字段
     */
    dateColumn: PropTypes.string.isRequired,

    /**
     * x 轴上的单位所对应的内部字段名
     */
    xColumn: PropTypes.string.isRequired,

    /**
     * 单位
     * 可选：'date' : 'month'
     * 默认：'date'
     * 图表横轴的单位
     */
    unit: PropTypes.string, // 单位

    /**
     * 是否有缩放按钮
     * 可选：true | false
     * 默认：true
     */
    hasScaleBtn: PropTypes.bool,

    /**
     * 标准线配置
     * 默认：[]
     * 例如：
     * [
     *   {
     *     title: '标准头围', // 字段名称
     *     color: 'red', // 虚线颜色
     *     label: '3rd' // 标注文字
     *   },
     *   {
     *     title: '标准身高',
     *     color: 'green',
     *     label: '3rd'
     *   },
     *   {
     *     title: '标准体重',
     *     color: 'yellow',
     *     label: '3rd'
     *   }
     * ]
     */
    standardLine: PropTypes.array,

    /**
     * 配置 y 轴参数：是否显示 | 最大值
     * 默认：-，全部显示
     * 例如：
     * [
     *   { name: '体重', max: 100, show: true },
     *   { name: '身高', max: 200, show: false } // 同一类型最大值需要配一样大
     * ]
     */
    yAxis: PropTypes.array,

    /**
     * 缩放状态
     * 可选：'normal' : 'max'
     * 默认：'max'
     */
    scaleStatus: PropTypes.oneOf(['normal', 'max']),

    /**
     * 图表的大小
     * 默认：-
     * 例如：
     * {
     *   width: 400,
     *   height: 600
     * }
     */
    chartSize: PropTypes.object,
    
    /**
     * 图表距离上面的距离
     * 默认：-
     */
    gridTop: PropTypes.number
  };
  static defaultProps = {
    title: '无标题',
    hasScaleBtn: true,
    unit: 'date',
    standardLine: [],
    scaleStatus: 'max',
  };

  calcTableContentHeight = height => {
    return height === 'auto' ? 0 : parseInt(height, 10) - 100;
  };

  constructor(props) {
    super(props);

    const { height, scaleStatus } = this.props;
    let contentHeight;
    if (scaleStatus === 'max') {
      contentHeight = 0;
    } else {
      contentHeight = this.calcTableContentHeight(height);
    }
    this.state = {
      loading: false,
      columnsDefineDate: [],
      originColumnsData: [], // 没有处理的列数据
      columnsData: [
        // 处理之后（调用了 this.mergeCols()）的列数据
        {
          title: '',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: '单位',
          dataIndex: 'unit',
          key: 'unit'
          // align: 'center'
        }
      ],
      tableData: [], // 需要显示的 table 数据
      allTableData: [], // 所有的 talbe 数据
      advDicVisible: false, // 高级字典表是否显示
      searchValue: '', // 高级字典搜索框显示的值
      isBordered: true, // 是否显示边框
      isModalVisible: false, // modal 是否显示
      contentHeight, // 表格 + 图表的高度
      // modal 中的 table 的数据
      modalColumnsData: [
        {
          title: '字段',
          dataIndex: 'name',
          align: 'center',
          key: 'name'
        },
        {
          title: '表格显示',
          dataIndex: 'table',
          align: 'center',
          key: 'table',
          render: (text, record, rowIndex) => {
            return (
              <Checkbox
                checked={text}
                onChange={e =>
                  this.checkboxChange(
                    'table',
                    e.target.checked,
                    text,
                    record,
                    rowIndex
                  )
                }
              />
            );
          }
        },
        {
          title: '图形显示',
          dataIndex: 'graph',
          align: 'center',
          key: 'graph',
          render: (text, record, rowIndex) => {
            return (
              <Checkbox
                checked={text}
                onChange={e =>
                  this.checkboxChange(
                    'graph',
                    e.target.checked,
                    text,
                    record,
                    rowIndex
                  )
                }
              />
            );
          }
        }
      ],
      modalTableData: [],
      scaleStatus, // 缩放状态：'normal'（正常）：'max'（最大化）
      chartScaleStatus: 'normal', // 图表缩放状态：'normal'（正常）：'max'（最大化）
      chartHeight: 600 // 图表高度
    };
  }

  echartInstance = null; // echarts 实例
  chartDom = React.createRef(); // 图标 dom
  chartWrapRef = React.createRef(); // LzTableChart 组件 dom
  componentDidMount() {
    this.setEchartDomWidth(this.chartDom.current);

    this.getColumnsDefine();
    this.getEchartInstance();
    // 用于使chart自适应高度和宽度
    window.onresize = () => {
      // 重置容器高宽
      this.setEchartDomWidth(this.chartDom.current);
      this.echartInstance.resize();
    };
  }

  // 设置 echart dom 的宽度
  setEchartDomWidth = function(dom) {
    const { chartSize } = this.props;
    if (!this.chartWrapRef.current) {
      return;
    }
    if (chartSize) {
      dom.style.width = chartSize.width + 'px';
      dom.style.height = chartSize.height + 'px';
      return;
    }
    dom.style.width = this.chartWrapRef.current.clientWidth - 50 + 'px';
    let chartHeight;
    if (this.state.chartScaleStatus === 'normal') {
      chartHeight = 600;
    } else {
      chartHeight = this.chartWrapRef.current.clientHeight + 'px';
    }
    this.setState({ chartHeight });
  };

  getEchartInstance = () => {
    this.echartInstance = echarts.init(this.chartDom.current);
  };

  colors = [
    '#c23531',
    '#2f4554',
    '#61a0a8',
    '#d48265',
    '#91c7ae',
    '#749f83',
    '#ca8622',
    '#bda29a',
    '#6e7074',
    '#546570',
    '#c4ccd3'
  ];

  tableData = [];
  legend = [];
  getChartData = () => {
    const { standardLine } = this.props;
    const legend = this.legend;
    const containerData = [],
      yAxisData = [],
      series = [];
    this.tableData.forEach(data => {
      if (data.type === 'item') {
        const arr = [];
        this.xArr.forEach(item => {
          arr.push(data[item]);
        });
        containerData.push(arr);
      }
    });
    // yAxisData, series
    let index = 0;
    for (let i = 0; i < legend.length; i++) {
      let name = legend[i];
      let tempStandard;
      const yAxisDataObj = {
        show: false, // 默认 Y 轴都是隐藏的
        boundaryGap: [0, '50%'],
        type: 'value',
        name,
        position: 'left',
        splitLine: { show: false }
      };
      const seriesObj = {
        name,
        type: 'line',
        smooth: true,
        data: containerData[i],
        yAxisIndex: i
      };

      let tempYAxis;
      if (!this.props.yAxis) {
        yAxisDataObj.show = true;
      } else {
        // 显示配置好的 y 轴
        if ((tempYAxis = this.props.yAxis.find(item => item.name === name))) {
          yAxisDataObj.show = tempYAxis.show;
          yAxisDataObj.max = tempYAxis.max || null;
          if (tempYAxis.show) {
            yAxisDataObj.offset = index * 50;
            index++;
          }
        }
      }

      // 标准线标注
      if (
        (tempStandard = standardLine.find(standard => standard.title === name))
      ) {
        seriesObj.lineStyle = {
          normal: {
            color: tempStandard.color,
            type: 'dashed'
          }
        };
        const xName = this.xArr[this.xArr.length - 1];
        const yValue = containerData[i][containerData[i].length - 1];
        seriesObj.markPoint = {
          data: [
            {
              coord: [xName + '', yValue],
              value: tempStandard.label,
              itemStyle: {
                color: tempStandard.color
              }
            }
          ]
        };
        yAxisDataObj.axisLine = {
          label: { show: true },
          lineStyle: {
            color: tempStandard.color,
            type: 'dashed'
          }
        };
      } else {
        yAxisDataObj.axisLine = {
          lineStyle: {
            color: this.colors[i % 11]
          }
        };
      }
      series.push(seriesObj);
      yAxisData.push(yAxisDataObj);
    }
    return { legend, yAxisData, series, xAxisData: this.xArr };
  };

  renderChart = () => {
    const { legend, yAxisData, series, xAxisData } = this.getChartData();
    const { yAxis, gridTop } = this.props;
    const filterArr = yAxisData.filter(item => item.show)
    const len = filterArr.length || yAxisData.length;
    
    this.echartInstance.setOption(
      {
        grid: {
          left: 50 * len,
          top: gridTop || 0
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100,
            // backgroundColor:'#d'
            textStyle: {
              color: '#ffffff'
            }
          },
          {
            type: 'inside',
            realtime: true,
            start: 5,
            end: 85
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: false,
            label: {
              backgroundColor: '#0D4286'
            }
          }
        },
        legend: {
          data: legend
        },
        xAxis: {
          data: xAxisData
        },
        yAxis: yAxisData,
        series: series
      },
      true
    );
  };

  // checkbox 状态切换时
  checkboxChange = (type, checked, text, record, rowIndex) => {
    const { modalTableData } = this.state;
    // 要显示的 tableData 的索引
    const showIndexs = [];
    // 全选
    if (record.name === '全选') {
      modalTableData.forEach((data, index) => {
        data[type] = checked;
        data[type] ? showIndexs.push(index - 1) : null;
      });
      // 非全选
    } else {
      modalTableData.some(data => {
        if (data.name === record.name) {
          return (data[type] = checked);
        }
      });
      // 点击某类
      if (this.modalIndexs.indexOf(rowIndex) !== -1) {
        // 改变某类的状态
        modalTableData.forEach((data, index) => {
          if (data.belong === record.belong) {
            data[type] = checked;
          }
          data[type] ? showIndexs.push(index - 1) : null;
        });
        // 非某类
      } else {
        modalTableData.forEach((data, index) => {
          if (data.name === record.name) {
            data[type] = checked;
          }
          data[type] ? showIndexs.push(index - 1) : null;
        });
      }
    }
    if (type === 'table') {
      // 获取要显示的 tableData
      const newTableData = clone(this.state.allTableData);
      const tableData = [],
        indexs = [];
      newTableData.forEach((item, index) => {
        if (showIndexs.indexOf(index) !== -1 || item.type === 'title') {
          tableData.push(item);
          if (item.type === 'title') {
            indexs.push(tableData.length - 1);
          }
        }
      });
      this.indexs = indexs;
      const columnsData = this.mergeCols(this.state.columnsData, this.indexs);
      this.setState({
        modalTableData,
        tableData,
        columnsData: columnsData
      });
    } else {
      // 获取图标显示的 tableData
      const newTableData = clone(this.state.allTableData);
      const tableData = [],
        legend = [];
      newTableData.forEach((item, index) => {
        if (showIndexs.indexOf(index) !== -1 || item.type === 'title') {
          tableData.push(item);
          if (item.type === 'item') {
            legend.push(item.name);
          }
        }
      });

      const { standardLine } = this.props;
      legend.forEach(item => {
        let tempStandard;
        if (
          (tempStandard = standardLine.find(
            standard => standard.title === item
          ))
        ) {
        }
      });

      this.legend = legend;
      this.tableData = tableData;
      const isNeedRerender =
        tableData.length === this.titleCount ? false : true;
      this.setState(
        {
          modalTableData
        },
        () => {
          isNeedRerender && this.renderChart();
        }
      );
    }
  };

  // 高级字典数据
  advDicData = {};

  // 类别（类别下面有字段）,这是自定义的基本的数据结构
  classes = [];

  list = [];

  // 类别标题所在行的索引
  indexs = [];

  // 类别标题所在行的索引（modal 中的 table）
  modalIndexs = [];

  // 分类的数量
  titleCount = 0;
  // 获取列定义数据
  getColumnsDefine = async () => {
    this.setState({ loading: true });
    try {
      const { resid } = this.props;
      const res = await getColumnsDefine(resid);
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
      this.classes = classes;
      this.titleCount = classes.length;
      const list = [];
      classes.forEach(klass => {
        list.push({
          type: 'title',
          name: klass.name,
          belong: klass.name
        });
        klass.list.forEach(item => {
          list.push({
            type: 'item',
            name: item.ColDispName,
            unit: item.ColNotes,
            innerFieldName: item.ColName,
            belong: klass.name
          });
        });
      });
      this.list = list;
      const tableData = [],
        indexs = [];
      let modalTableData = [{ name: '全选', table: true, graph: true }];
      list.forEach((item, index) => {
        tableData.push({ ...item });
        if (item.type === 'title') {
          indexs.push(index);
        }
        modalTableData.push({
          name: item.name,
          belong: item.belong,
          table: true,
          graph: true
        });
      });
      this.indexs = indexs;
      const modalIndexs = indexs.map(index => index + 1);
      modalIndexs.unshift(0);

      this.modalIndexs = modalIndexs;

      const modalColumnsData = this.wrapTypeTitle(
        this.state.modalColumnsData,
        this.modalIndexs
      );
      const columnsData = this.mergeCols(this.state.columnsData, this.indexs);
      this.setState({
        tableData,
        allTableData: clone(tableData),
        loading: false,
        columnsData,
        modalTableData,
        modalColumnsData
      });
      this.advDicData = res.data[this.props.keyColumn];
    } catch (err) {
      console.error(err);
      message.error(err.message);
    }
  };

  // 类型标题
  wrapTypeTitle = (columnsData, indexs) => {
    columnsData.forEach((col, i) => {
      if (i === 0) {
        col.render = (text, row, index) => {
          if (indexs.indexOf(index) !== -1) {
            return {
              children: <span className="table-title">{text}</span>
            };
          }
          return { children: text };
        };
      }
    });
    return columnsData;
  };

  // 合并列
  mergeCols = (columnsData, indexs) => {
    const len = columnsData.length;

    columnsData.forEach((col, i) => {
      if (i === 0) {
        col.render = (text, row, index) => {
          if (indexs.indexOf(index) !== -1) {
            return {
              children: <span className="table-title">{text}</span>,
              props: {
                colSpan: len
              }
            };
          } else {
            return {
              children: text
            };
          }
        };
      } else {
        col.render = (text, row, index) => {
          if (indexs.indexOf(index) !== -1) {
            return {
              props: {
                colSpan: 0
              }
            };
          } else {
            return {
              children: text
            };
          }
        };
      }
    });
    return columnsData;
  };

  // 开始结束日期
  start = null;
  end = null;
  // 所选时间段
  dateArr = [];
  onChange = (type, date) => {
    if (!date) {
      return;
    }
    const { unit } = this.props;
    if (date) {
      if (unit === 'date') {
        this[type] = {
          date,
          dateString: date.format('YYYYMMDD')
        };
      } else {
        this[type] = {
          date,
          dateString: date.format('YYYYMMDD')
        };
        if (type === 'start') {
          this[type].dateString = date.startOf('month').format('YYYYMMDD');
        } else {
          this[type].dateString = date.endOf('month').format('YYYYMMDD');
        }
      }
    } else {
      this[type] = null;
    }
  };

  resData = [];
  // 查询
  query = async () => {
    if (!this.start || !this.end) {
      message.error('请选择开始时间和结束时间');
      return;
    }
    this.setState({ loading: true });
    const { dateString: startDateString } = this.start,
      { dateString: endDateString } = this.end;

    const { resid, dateColumn, keyColumn } = this.props;
    let cmswhere;
    if (this.keyColumnValue) {
      cmswhere = `${dateColumn}>='${startDateString}' AND ${dateColumn}<='${endDateString}' AND ${keyColumn}=${
        this.keyColumnValue
      }`;
    } else {
      cmswhere = `${dateColumn}>='${startDateString}' AND ${dateColumn}<='${endDateString}'`;
    }

    let res;
    try {
      res = await getMainTableData(resid, { cmswhere });
    } catch (err) {
      return message.error(err.message);
    }

    if (res.data.length === 0) {
      this.setState({ loading: false });
      return message.error('该时间段没有数据');
    }
    let { tableData } = this.state;
    const { xColumn } = this.props;
    const legend = [];
    let cols = [];
    const xArr = [];
    res.data.forEach((data, index) => {
      const title = data[xColumn];
      cols.push({
        title,
        dataIndex: title,
        key: title,
        align: 'center'
      });
      xArr.push(title);
    });
    this.xArr = xArr; // x 轴的单位
    tableData.forEach(item => {
      if (item.type === 'item') {
        res.data.forEach((data, index) => {
          const title = data[xColumn];
          item[title] = data[item.innerFieldName];
        });
        legend.push(item.name);
      }
    });
    const newColumnsData = [...this.state.columnsData.slice(0, 2), ...cols];
    const colsData = this.mergeCols(newColumnsData, this.indexs);
    this.legend = legend;
    this.tableData = tableData;
    this.setState(
      {
        tableData: clone(tableData),
        loading: false,
        allTableData: clone(tableData),
        columnsData: colsData,
        originColumnsData: clone(colsData)
      },
      () => {
        this.renderChart();
      }
    );
  };

  addDataToTableData = (tableData, resData) => {
    const legend = [];
    tableData.forEach(item => {
      if (item.type === 'item') {
        resData.forEach(data => {
          const dateString = moment(data[this.props.dateColumn]).format(
            'MM/DD'
          );
          item[dateString] = data[item.innerFieldName];
        });
        legend.push(item.name);
      }
    });
    this.legend = legend;
    this.tableData = tableData;
    return tableData;
  };

  openDicTable = () => {
    this.setState({ advDicVisible: true });
  };

  advDicClose = () => {
    this.setState({ advDicVisible: false });
  };

  // keyColumn 所对应的值
  keyColumnValue = '';
  getAdvDictionaryVal = values => {
    values.some(value => {
      if (value.innerFieldName === this.props.keyColumn) {
        return (this.keyColumnValue = value.value);
      }
    });
    this.setState({ searchValue: this.keyColumnValue });
  };

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  getWrapStyle = () => {
    const { scaleStatus } = this.state;
    const { width, height, top, isAdvDictionary } = this.props;
    // 高级字典样式
    if (isAdvDictionary) {
      return {};
    }
    if (scaleStatus === 'normal') {
      return {
        width,
        height,
        position: 'absolute',
        left: '50%',
        transform: 'translate(-50%, 0)',
        top: top,
        background: '#fff'
      };
    } else {
      return {
        background: '#fff',
        position: 'absolute',
        left: 0,
        top: '-70px',
        right: 0,
        bottom: 0,
        overflow: 'auto'
      };
    }
  };

  scaleLzTable = () => {
    this.setState({
      scaleStatus: this.state.scaleStatus === 'normal' ? 'max' : 'normal'
    });
    const { scaleStatus } = this.state;
    const { height } = this.props;
    let contentHeight = 0;
    if (scaleStatus === 'max') {
      contentHeight = this.calcTableContentHeight(height);
    }
    this.setState(
      {
        scaleStatus: scaleStatus === 'normal' ? 'max' : 'normal',
        contentHeight
      },
      () => {
        setTimeout(() => {
          triggerResize();
        }, 100);
      }
    );
  };

  xArr = [];
  // 获取滚动区域的高度
  getScrollAreaHeight = () => {
    const { contentHeight } = this.state;
    return contentHeight ? { height: contentHeight } : {};
  };

  getScrollX = () => {
    const cellWidth = 120;
    const sum = cellWidth * this.xArr.length;
    return { x: sum };
  };

  scaleChart = () => {
    const { chartScaleStatus } = this.state;
    this.setState(
      {
        chartScaleStatus: chartScaleStatus === 'normal' ? 'max' : 'normal'
      },
      () => {
        setTimeout(() => {
          triggerResize();
        }, 100);
      }
    );
  };

  render() {
    const {
      tableData,
      columnsData,
      loading,
      advDicVisible,
      searchValue,
      isBordered,
      isModalVisible,
      modalColumnsData,
      modalTableData,
      scaleStatus,
      chartScaleStatus,
      chartHeight
    } = this.state;
    const { title, hasScaleBtn, width, unit, chartSize } = this.props;
    let chartWrapStyle = {};
    if (chartScaleStatus === 'max') {
      chartWrapStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: '#fff'
      };
    }
    let chartDomStyle;
    if (chartSize) {
      chartDomStyle = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        ...{ chartSize }
      };
    } else {
      chartDomStyle = { height: 600 };
    }
    return (
      <div style={this.getWrapStyle()} className="lz-table-chart">
        <div
          className="lz-tablechart-header"
          style={{
            height: '50px',
            lineHeight: '50px',
            borderBottom: '1px solid #e5e5e5',
            color: '#252525'
          }}
        >
          {title}
          {hasScaleBtn && (
            <i
              className={classNames('btn', 'iconfont', {
                'icon-scale-normal': scaleStatus === 'max',
                'icon-scale-max': scaleStatus === 'normal'
              })}
              onClick={this.scaleLzTable}
            />
          )}
        </div>
        <div className="operation">
          <div className="item">
            <span>开始时间：</span>
            {unit === 'date' ? (
              <DatePicker
                onChange={date => {
                  this.onChange('start', date);
                }}
              />
            ) : (
              <MonthPicker
                onChange={date => {
                  this.onChange('start', date);
                }}
              />
            )}
          </div>
          <div className="item">
            <span>结束时间：</span>
            {unit === 'date' ? (
              <DatePicker
                onChange={date => {
                  this.onChange('end', date);
                }}
              />
            ) : (
              <MonthPicker
                onChange={date => {
                  this.onChange('end', date);
                }}
              />
            )}
          </div>

          <div className="item">
            <Search
              onSearch={this.openDicTable}
              value={searchValue}
              enterButton
            />
          </div>
          <div className="item">
            <Button className="item" onClick={this.query}>
              查询
            </Button>
          </div>
          <div className="item">
            <Button className="item" onClick={this.showModal}>
              选择参数
            </Button>
          </div>
          <div className="item">
            <span>边框：</span>
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
              checked={isBordered}
              onChange={checked => this.setState({ isBordered: checked })}
            />
          </div>
        </div>
        <div className="table-chart-wrap" style={this.getScrollAreaHeight()}>
          <Table
            dataSource={tableData}
            columns={columnsData}
            pagination={false}
            loading={loading}
            rowKey="name"
            bordered={isBordered}
            scroll={{
              ...this.getScrollX()
            }}
          />
          <div
            className="chart-wrap"
            ref={this.chartWrapRef}
            style={chartWrapStyle}
          >
            <div ref={this.chartDom} style={chartDomStyle} />
            <i
              className="iconfont icon-full-screen"
              onClick={this.scaleChart}
            />
          </div>
        </div>

        {advDicVisible && (
          <LzAdvDictionary
            advDictionatyData={this.advDicData}
            onClose={this.advDicClose}
            btnsVisible={{
              add: false,
              edit: false,
              save: false,
              mod: false,
              check: false,
              del: false
            }}
            getAdvDictionaryVal={this.getAdvDictionaryVal}
            retFilterFieldValues={this.retFilterFieldValues}
          />
        )}
        {isModalVisible && (
          <Modal
            title="选择参数"
            visible={true}
            footer={null}
            onCancel={() => this.setState({ isModalVisible: false })}
            className="lz-table-chart-modal"
          >
            <Table
              dataSource={modalTableData}
              columns={modalColumnsData}
              pagination={false}
              rowKey="name"
              size="small"
            />
          </Modal>
        )}
      </div>
    );
  }
}
