import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import debounce from 'lodash.debounce';
import classNames from 'classnames';
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-build-fails-to-minify
// https://github.com/nolimits4web/Swiper/issues/2335
// import Swiper from 'swiper/dist/js/swiper.js';
// import 'swiper/dist/css/swiper.css';
import {
  Table,
  Button,
  Popconfirm,
  message,
  Input,
  Pagination,
  Form,
  Spin
} from 'antd';
import {
  getMainTableData,
  delRow,
  modRecord,
  getSubTableData,
  getColumnsDefine,
  addRecord,
  saveMultipleRecord,
  getButtons,
  dealButton,
  modSubRecord
} from '../../util/api';
import { getFormData, exportTableData } from 'Util/api';
import LzFormModalContainer from '../components/LzFormModalContainer';
import dealControlArr, { dealFormData } from 'Util/controls';
import { EditableContext, EditableFormRow } from './LzEditableFormRow';
import LzEditableCell from './LzEditableCell';
import LzAdvSearch from './LzAdvSearch';
import { clone, getToken } from '../../util/util';
import { FormattedMessage } from 'react-intl';
import { LzForm } from '../../../loadableComponents';
import './LzTable.less';
import { extractAndDealBackendBtns, filterBackEndBtns } from 'Util/backendBtns';
import LzBackendBtn from '../components/LzBackendBtn';
import LzModal from '../components/LzModal';
import LzMenuForms from '../LzMenuForms';
import {
  LzStepsCTS,
  LzStepsCes,
  LzStepsAfl,
  LzStepsSc,
  LzStepsOt,
  LzStepsPi,
  LzStepsMAP
} from '../../../product-components/att/loadableComponents';
import LzImportData from './LzImportData';
import IconWithTooltip from '../../../pages/components/IconWithTooltip';
import { downloadFile } from 'Util/util';

const Search = Input.Search;
let controlData;
/**
 * 表格组件
 */
class LzTable extends React.Component {
  static propTypes = {
    /**
     * 表格标题
     * 默认：-
     * 例如：(currentPageData) => <h1>标题</h1>
     * 更多：表格标题（https://ant.design/components/table-cn/）
     */
    tableTitle: PropTypes.string,

    /**
     * 数据模式
     * 可选：'main' | 'sub'
     * 默认：'main'
     * 描述：'main' 表示主表数据；'sub' 表示子表数据
     */
    dataMode: PropTypes.oneOf(['main', 'sub']),

    /**
     * 视图模式
     * 可选：'table' | 'cards' | 'form'
     * 默认：'table'
     * 描述：'table' 显示表格；'cards' 显示卡片；'forms' 显示表单
     */
    viewMode: PropTypes.oneOf(['table', 'cards', 'forms']),

    // 主表id
    resid: PropTypes.number.isRequired,

    // 预设查询编号
    mtsid: PropTypes.number,

    // 子表id
    subresid: (props, propName, componentName) => {
      // 当 dataMode 为 "sub" 时，subresid 是必传的
      if (props.dataMode === 'sub') {
        return typeof props[propName] === 'number'
          ? null
          : new Error('lz-table: subresid 无效，subresid 必须为 number 类型');
      }
    },

    // 主表记录编号
    hostrecid: (props, propName, componentName) => {
      // 当 dataMode 为 "sub" 时，hostrecid 是必传的
      if (props.dataMode === 'sub') {
        return typeof props[propName] === 'number'
          ? null
          : new Error('lz-table: hostrecid 无效，hostrecid 必须为 number 类型');
      }
    },

    /**
     * 要获取数据的字段
     * 默认：-
     * 例子：'C3_511302422114,C3_511302066880,C3_511302131411'
     */
    cmscolumns: PropTypes.string,

    /**
     * 要显示在卡片组件中字段的内部字段名
     * 默认：-
     * 例子：
     * {
     *   img: "C3_511XXX",
     *   name: "C3_511XXX",
     *   desc: "C3_511XXX"
     * }
     */
    showColumnsInnerFieldName: PropTypes.object,

    /**
     * 表 cmswhere 查询的字符串
     * 默认：-
     * 例子：'C3_511302422114=1,C3_511302066880,C3_511302131411'
     */
    cmswhere: PropTypes.string,

    /**
     * 返回展开内容的函数（当展开内容为子表时）
     * (record) => (
     *   <LzTable
     *     resid={582216436963} // 必传
     *     subresid={582217293453} // 必传
     *     hostrecid={record.REC_ID} // 必传，值固定为 record.REC_ID
     *     dataMode="sub" // 必传
     *     width={500}
     *     tableTitle={() => <div>子表</div>}
     *     // ... 其他 lz-table 组件参数
     *   />
     * )
     */
    retExpandContent: PropTypes.func,

    /**
     * 展开行子表的配置
     * 默认：-
     */
    expandSubTableConfig: PropTypes.object,

    /**
     * 窗体名称
     * 默认：'default'，相当于：
     * {
     *   rowFormName: 'default', //  rowFormName 表示行内编辑所用的窗体名称
     *   formFormName: 'default' // formFormName 表示表单中所用的窗体名称
     * }
     * 如果 formsName 的类型为字符串，则 “行内编辑所用的窗体名称” 和 “表单中所用的窗体名称” 相同
     */
    formsName: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

    /**
     * 分页配置
     * {
     *   pageSize: 10, // 默认每页数量
     *   current: 0, // 当前页数
     * }
     * 注意：如果需要开启分页功能，则以上两个参数必须带上
     * 默认：-
     * 更多参数：https://ant.design/components/pagination-cn/
     */
    pagination: PropTypes.object,

    /**
     * edit | save | cancel | mod | check | del |  按钮是否显示
     * 默认值：
     * {
     *   edit: false,
     *   save: false,
     *   cancel: false,
     *   mod: false,
     *   check: false,
     *   del: false
     * }
     */
    btnsVisible: PropTypes.object,

    /**
     * 行内编辑配置
     * 默认：-
     * 例如：
     * {
     *    mode: 'single' // 行内编辑模式：'single' 表示最多可以同时编辑一行；'multiple' 表示最多可以同时编辑多行
     * }
     */
    editableRow: PropTypes.object,

    /**
     * 选择功能配置
     * 默认：{ columnWidth: 60 }
     * 例如：
     * {
     *   columnWidth: 60,
     *   // 其他配置
     * }
     * 更多：选择功能的配置（https://ant.design/components/table-cn/）
     */
    rowSelection: PropTypes.object,

    /**
     * 是否开启后端排序功能（针对整个表的数据）
     * 可选：true | false
     * 默认：false
     */
    isSortBE: PropTypes.bool,

    /**
     * 后端需要排序的字段
     * 开启了后端排序功能，若没有传入 sortFields 属性，则默认所有字段都能够进行排序
     * ['人员编号', '部门名称']：数组中的元素为要排序的字段名称
     */
    sortFields: PropTypes.array,

    /**
     * 是否开启前端排序功能（针对本页的数据）
     * 可选：true | false
     * 默认：false
     */
    isSortFE: PropTypes.bool,

    /**
     * sortFns 前端排序配置
     * 开启了前端排序功能，则必须传入此前端排序配置数组
     * [
     *   {
     *     text: '人员编号',
     *     sortFn: (a, b) => a.C3_582216497309 - b.C3_582216497309
     *   },
     * ]
     * text：要排序字段的名称
     * sortFn：排序函数。a 和 b 为对象，包含了本行数据。需要使用内部字段，来进行排序。
     */
    sortFns: PropTypes.array,

    /**
     * 表格尺寸
     * 可选：default | small
     * 默认：default
     */
    tableSize: PropTypes.string,

    /**
     * 列宽度（https://ant.design/components/table-cn/）
     * 默认：200（即 200px）
     */
    columnWidth: PropTypes.number,

    /**
     * 自定义某列宽度
     * 默认：-
     * 例如：{ '人员编号': 100, '部门名称': 300 }
     */
    customColumnWidth: PropTypes.object,

    /**
     * 操作列的宽度
     * 默认：200
     * 注意：若开启了 “操作列固定在右侧” 的功能，且实际 “操作列” 宽度要大于 200，则需要设置 “opWidth” 值
     * （若不设置该值，则会发生倒数第二列被 “固定操作列” 遮住的问题）；
     * 如何获取？在网页中审查元素，查看 “固定在右侧的操作列” td 元素的宽度，得到的值用来配置即可；
     */
    opWidth: PropTypes.number,

    /**
     * lz-table 组件中 “表格的高度”（不包含表头的高度）
     * 默认：-
     */
    tableHeight: PropTypes.number,

    /**
     * 是否开启模糊搜索
     * 可选：true | false
     * 默认：true
     */
    isSearch: PropTypes.bool,

    /**
     * 操作列是否固定在右侧
     * 可选：true | false
     * 默认：false
     * 更多：固定列（https://ant.design/components/table-cn/）
     */
    opIsFixed: PropTypes.bool,

    /**
     * 是否通过点击来展开行
     * 可选：true | false
     * 默认：false
     */
    expandRowByClick: PropTypes.bool,

    /**
     * 表格开始处的列
     * 默认：[]
     * 例如：
     * {
     *   title: '自定义',
     *   key: 'y',
     *   align: 'center',
     *   width: 200,
     *   isEditableCell: false, // 是否是可以编辑的单元格
     *   render: (text, record, rowIndex) => {
     *     return <div>{rowIndex}</div>;
     *    }
     * }
     * 更多：Column（https://ant.design/components/table-cn/）
     */
    startColumns: PropTypes.array,

    /**
     * 表头是否显示
     * 默认：true
     */
    showHeader: PropTypes.bool,

    /**
     * 相邻列合并的第一列的索引
     * 默认：-
     * 描述：配合将第二列的宽度设置为0
     */
    mergeColIndex: PropTypes.number,

    /**
     * 表格是否有边框
     * 默认：true
     */
    bordered: PropTypes.bool,

    /**
     * table 过滤
     * 默认：-
     * 例如：
     * {
     *   '患者ID': [ // "患者ID" 表示字段名称，其值为数组，数组的每一项表示要过滤的项
     *      {
     *         text: '585133557396',
     *         value: '585133557396'
     *      }
     *   ],
     *   '姓名': [
     *     {
     *        text: '男方姓名',
     *        value: '男方姓名'
     *     }
     *   ]
     * }
     * 更多：filters（https://ant.design/components/table-cn/）
     */
    filters: PropTypes.object,

    /**
     * form 中标签页子表的配置参数
     * 默认：-
     **/
    formTabsSubTableProps: PropTypes.array,
    // 例子
    // [
    //    {
    //      tabName: '表格1', // 标题
    //      componentInfo: {
    //        name: 'LzTable', // 组件名称
    //        props: { // 组件接受的 props
    //          subresid: 582041633802, // 必传
    //          // 其他参数为 LzTable 所能接受的参数
    //        }
    //      }
    //    }
    //  ]

    /**
     * 在列的开始处通过行内编辑添加记录的配置
     * 默认：-
     * 例如：
     * {
     *   mode: 'single', // 模式：'single' 表示只能一条一条添加记录；'multiple' 表示可以一次性添加多条记录
     *   width: 200, // 宽度：默认为 100
     * }
     */
    startColumnAdd: PropTypes.object,

    /**
     * 当 LzTable 为 LzForm 的子表时的操作
     * 可选：add | edit | mod | check | del
     * 默认：-
     */
    operation: PropTypes.string,

    /**
     * 模态窗的宽度
     * 默认：1000
     */
    modalWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * 模态框中的 form 的布局
     * 可选：'default' | 'custom'
     * 默认：'default'
     * 描述：'default'：form 控件按照从上到下的顺序布局；'custom'：form 控件按照后端给的控件样式信息来进行自定义布局
     */
    formLayout: PropTypes.oneOf(['default', 'custom']),

    /**
     * 后端自定义按钮是否显示
     * 可选：true | false
     * 默认：false
     */
    isBackEndBtnsVisible: PropTypes.bool,

    /**
     * 高级搜索配置
     * 默认：-
     */
    advSearchConfig: PropTypes.object,
    // 例如：
    //   {
    //    containerName: 'drawer', // 高级搜索所在容器的名字：'normal' 在表格里面；'drawer' 在抽屉容器里面
    //    defaultVisible: false, // 默认是否显示
    //    drawerWidth: 500, // 抽屉的宽度
    //    labelWidth: '24%', // label 宽度
    //    rowWidth: '100%', // row 宽度
    //    dateRanges: [
    //      // date
    //      {
    //        visible: [true, true, true, true], // 对应 “今天”、“昨天”、“本周”、“上周” 是否显示
    //        innerFieldName: 'd1' // 内部字段
    //      },
    //      {
    //        visible: [true, true, true, false],
    //        innerFieldName: 'd2'
    //      },
    //      {
    //        // 没有 visible 属性时，使用默认值：全部显示
    //        innerFieldName: 'd3'
    //      }
    //    ],
    //    tag: [
    //      // tag
    //      {
    //        title: '病历号',
    //        op: 'or', // 操作符：'or' | 'and'
    //        tags: [
    //          {
    //            label: '111',
    //            value: '111',
    //            isSelected: false,
    //            innerFieldName: 'C3_577815652032' // 内部字段名
    //          },
    //          {
    //            label: '222',
    //            value: '222',
    //            isSelected: false,
    //            innerFieldName: 'C3_577815652032'
    //          },
    //          {
    //            label: '333',
    //            value: '333',
    //            isSelected: false,
    //            innerFieldName: 'C3_577815652032'
    //          }
    //        ]
    //      },
    //      {
    //        title: '病历号2',
    //        op: 'or',
    //        tags: [
    //          {
    //            label: '111-',
    //            value: '111-',
    //            isSelected: false,
    //            innerFieldName: 'C3_577815652032'
    //          },
    //          {
    //            label: '222-',
    //            value: '222-',
    //            isSelected: false,
    //            innerFieldName: 'C3_577815652032'
    //          },
    //          {
    //            label: '333-',
    //            value: '333-',
    //            isSelected: false,
    //            innerFieldName: 'C3_577815652032'
    //          }
    //        ]
    //      }
    //    ],
    //    search: [
    //      // search
    //      {
    //        title: '周期序号1',
    //        innerFieldNames: ['aaa', 'bbb'] // 内部字段名
    //      },
    //      {
    //        title: '周期序号2',
    //        innerFieldNames: ['aaa', 'bbb']
    //      }
    //    ]
    //  }

    /**
     * 高级搜索是否展开
     * 可选：true | false
     * 默认：false
     */
    advSearchVisible: PropTypes.bool,

    /**
     * 表单的显示模式
     * 可选值：'default' : 'classify'
     * 默认值：'default'
     * 描述：见 "../components/LzForm" 组件的 displayMod 描述
     */
    displayMod: PropTypes.string,

    /**
     * 是否在控件后面显示单位
     * 可选：true | false
     * 默认：false
     */
    isUnitVisible: PropTypes.bool,

    // 样式相关
    // ======
    /**
     * LzTable 样式
     */
    style: PropTypes.object,

    /**
     * LzAdvSearch 组件样式
     */
    lzAdvSearchStyle: PropTypes.object,

    /**
     * 列数量
     * 默认：1
     * 可选：n（n >=1）
     */
    colCount: PropTypes.number,

    /**
     * 当 viewMode 为 "forms" 时，该属性定义了表单中表头左侧要显示的记录
     */
    formHeaderRecords: PropTypes.array,
    // 例如：
    // [
    //   {
    //     innerFieldName: 'C3_590512169985',
    //     style: {
    //       fontWeight: 'bold'
    //     }
    //   },
    //   {
    //     innerFieldName: 'C3_590514418013',
    //     style: {
    //       padding: '4px 8px',
    //       border: '1px solid #004a95'
    //     }
    //   }
    // ]

    /**
     * 后端按钮隐藏配置
     * 默认：-
     */
    backendBtnsHide: PropTypes.array,
    // 例如：
    // [
    //   {
    //     btnName: '归档', // 后端按钮名称
    //     innerFieldNames: [['aaa', 'bbb'], 'ccc'], // 该按钮显示（隐藏）所对应的字段的内部字段名
    //     values: [[111, 222], 333], // 归档按钮隐藏时对应记录的值
    //     (aaa === 111 && bbb === 222 || ccc === 333) 为 true 时，按钮隐藏
    //   }
    // ]

    /**
     * 添加记录按钮配置
     * 可选：true | false | object
     * 默认：true
     * 描述：true 表示在行内显示添加按钮；false 表示不显示添加按钮；object 是添加按钮的详细配置
     */
    addBtn: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    // object:
    // {
    //   type: 'text', // 按钮中内容的类型：'text' 表示文本；'icon' 表示字体图标
    //   text: '添加', // 按钮中的内容
    //   isBlock: false , // 按钮是否是块级元素
    // }

    /**
     * 是否有导出 Excel 表格功能
     * 可选：true | false
     * 默认：false
     */
    hasDownloadExcel: PropTypes.bool,

    /**
     * 高级字典配置
     * 默认：-
     */
    advDicTableProps: PropTypes.object,

    /**
     * 内部字段数组（修改了该数组内的内部字段所对应的控件的值之后，会调用 api 请求后端使用计算公式计算出保存前的记录）
     * 默认：-
     * 例如：['C3_592244738975', 'C3_592244739145']
     */
    cFFillFormInnerFieldNames: PropTypes.array,

    /**
     * 添加记录时，是否获取表单默认值
     * 可选：true | false
     * 默认：false
     */
    isGetFormDefaultValues: PropTypes.bool,

    /**
     * 关联字段的显示与隐藏（某个字段的显示与另外一个字段的值有关系）
     * 默认：-
     * 例如：[['C3_592244739145','C3_592306113509'], ['C3_592244739346', 'C3_592306124239']]
     */
    associatedFields: PropTypes.array,

    /**
     * 打开单元组件的按钮的配置（包含了单元组件的配置信息）
     * 默认：-
     */
    unitBtns: PropTypes.array,
    // 例如
    // [
    //   {
    //     name: 'LzMenuForms',
    //     btnName: '按',
    //     props: {} // 单元组件配置信息
    //   }
    // ]

    /**
     * 非通用组件配置
     * 默认：-
     */
    productComponents: PropTypes.array,
    // [
    //   {
    //     iconClass: 'icon-add',
    //     componentInfo: {
    //       name: 'LzSteps',
    //       props: {}
    //     }
    //   }
    // ]

    /**
     * 是否有刷新表格数据按钮
     * 默认：false
     */
    hasRefresh: PropTypes.bool,

    /**
     * 表格内部高度
     * 默认：560
     */
    tableInnerHeight: PropTypes.number,

    /**
     * 固定在左侧的列
     * 默认：-
     * 例如：['工号', '姓名']
     */
    fixedCols: PropTypes.array,

    customColRender: PropTypes.array,
    // [
    //   {
    //     innerFieldName: 'C3_489251903480', // 内部字段
    //     colors: [  // 列颜色配置
    //       {
    //         value: '审批中',
    //         color: ''
    //       },
    //       {
    //         value: '草稿',
    //         color: '#ff0000'
    //       }
    //     ],
    //     format: (value) => { // 数据格式化：返回格式化后的值
    //       return moment(value).format('YYYY-MM-DD HH:mm:ss')
    //     }
    //   }
    // ]

    /**
     * 行颜色配置
     * 默认：-
     */
    rowColors: PropTypes.array,
    // [
    //   {
    //     innerFieldName: 'C3_489251903480', // 内部字段
    //     colors: [
    //       {
    //         value: '审批中',
    //         color: ''
    //       },
    //       {
    //         value: '草稿',
    //         color: '#ff0000'
    //       },
    //     ]
    //   }
    // ]

    /**
     * 数据格式化
     * 默认：-
     */
    dataFormat: PropTypes.array,
    // [
    //   {
    //     innerFieldName: 'C3_489231991382',
    //     getValue: (value) => { // 返回格式化后的值
    //       return moment(value).format('YYYY-MM-DD HH:mm:ss')
    //     }
    //   }
    // ]

    /**
     * 获取表格数据
     * 默认：-
     * 例如：(tableData, total) => {} // tableData 为 this.state.tableData
     */
    getTableData: PropTypes.func,

    /**
     * 点完编辑按钮之后，是否有保存按钮
     * 默认：true
     */
    hasSaveBtn: PropTypes.bool,

    /**
     * 开启自动计算表格（scroll.y）高度，值为除去 tabInnherHeight 高度的高度
     * 默认：-
     */
    exceptTableInnerHeight: PropTypes.number,

    /**
     * 是否有导入数据的功能
     * 默认：false
     */
    hasImportData: PropTypes.bool
  };
  static defaultProps = {
    dataMode: 'main',
    viewMode: 'table',
    btnsVisible: {
      edit: false,
      save: false,
      cancel: false,
      mod: false,
      check: false,
      del: false
    },
    isEditableCell: false,
    isSelection: false,
    isSortBE: false,
    isSortFE: false,
    tableSize: 'default',
    columnWidth: 200,
    width: 'auto',
    isSearch: true,
    expandRowByClick: false,
    formsName: 'default',
    opIsFixed: false,
    opWidth: 200,
    startColumns: [],
    showHeader: true,
    bordered: true,
    modalWidth: 1000,
    formLayout: 'default',
    isUnitVisible: false,
    hasDownloadExcel: false,
    isGetFormDefaultValues: false,
    hasRefresh: false,
    tableInnerHeight: 300,
    hasSaveBtn: true,
    hasImportData: false
  };

  constructor(props) {
    super(props);
    const {
      advSearchConfig,
      height,
      pagination,
      exceptTableInnerHeight
    } = props;
    const paginationState = pagination && cloneDeep(pagination);

    const advSearchVisible = !!(
      advSearchConfig && advSearchConfig.defaultVisible
    );

    let tableInnerHeight = props.tableInnerHeight;
    if (exceptTableInnerHeight) {
      tableInnerHeight = this.getTableInnerHeight(exceptTableInnerHeight);
    }

    this.state = {
      pagination: paginationState,
      originCmscolumninfo: [], // 表头数据（未处理）
      columns: [], // 表头数据（已处理）

      originTableData: [], // 表格数据
      tableData: [], // 表格数据
      originOrderTableData: [], // 原来顺序的表格数据

      record: {
        REC_ID: 0
      }, // 被选中的记录
      modalFormShow: false, // 模态框是否显示
      unitModalVisible: false, // 放单元组件的模态框是否显示
      loading: false, // 表格是否处在加载状态
      operation: 'add', // 操作名称
      columnCount: 0, // 列数量

      key: '', // 模糊搜索的 key 值
      canOpControlArr: [], // 控件数据
      innerFieldName: [], // 编辑状态发生改变的字段的内部字段名（确定列）
      rowIndex: -1, // 编辑单元格所在的行
      isSaveEditedRecord: false, // 是否保存已经编辑了的单元格
      selectedRowIndex: -1, // 所选中行的索引

      originTableData: [], // 源表格数据
      selectedRowKeys: [], // 已选择行的 rec_id
      selectedRows: [], // 已选择的行记录
      sortInfo: {},
      scaleBtn: '最大化',
      isInMoltipleEdit: false, // 是否处在行内编辑添加多条记录的状态中
      backEndBtnsMultiple: [], // 后台自定义按钮（操作多行的）
      backEndBtnsSingle: [], // 后台自定义按钮（操作单行的）
      rowSelection: null, // 选择功能配置
      formFormData: [], // 表单窗体数据

      editingRecIds: [], // 正在编辑的记录 id 数组（multiple）
      viewStatus: 'view', // 记录的表单的视图状态：'view' | 'edit'
      advSearchVisible, // 高级搜索是否显示

      backendBtnOpenModalFormData: [], // 后端按钮打开的模态框表单中的窗体数据Î

      unitBtnInfo: {}, // 打开的单元组件按钮的信息 { name: [单元组件名称], btnName: [按钮名称], props: [单元组件接受的 props] }
      stepsVisible: false, // LzSteps 组件是否显示

      proModalVisible: false, // 定制组件模态框是否显示
      proComponentInfo: {}, // 定制组件配置信息

      sortOrder: '', // 后端排序规则：'desc' 降序 | 'asc' 升序
      sortField: '', // 后端排序字段

      tableInnerHeight, // 表格内部高度（scroll.y）

      importDataModalVisible: false
    };
  }

  getTableInnerHeight = height => {
    return window.innerHeight - height;
  };

  tempForm = {};
  mode = '';

  tempFormArr = []; // 处于编辑状态的表单对象
  formCount = 0; // 约束编辑状态表单对象数量的变量

  addFormArr = []; // 处于添加状态的表单对象
  addFormCount = 0; // 约束添加状态表单对象数量的变量

  // 打开单元组件
  openUnitComponent = (record, rowIndex, unitBtnInfo) => {
    this.setState({
      record,
      unitModalVisible: true,
      unitBtnInfo
    });
  };

  backendBtnConfirm = (type, records, formData, defaultRecord) => {
    if (type === 1 || type === 5) {
      this.refreshTableData();
      const rowSelection = {
        ...this.state.rowSelection,
        selectedRowKeys: []
      };
      this.setState({ selectedRowKeys: [], selectedRows: [], rowSelection });
      // 编辑记录
    } else if (type === 6) {
      this.setState({ backendBtnOpenModalFormData: formData }, () => {
        this.openModalWay = 'be';
        this.operationRow('mod', records[0]);
      });

      // 查看记录
    } else if (type === 7) {
      this.setState({ backendBtnOpenModalFormData: formData }, () => {
        this.openModalWay = 'be';
        this.operationRow('check', records[0]);
      });

      // 添加记录
    } else if (type === 8) {
      this.setState({ backendBtnOpenModalFormData: formData }, () => {
        this.addRecord(defaultRecord);
      });
    }
  };

  /**
   * 刷新表格数据
   * @param {boolean} 是否刷新跳转到第一页；默认为 false，即只刷新本页数据
   * @return undefined
   */
  refreshTableData = (isToFristPage = false) => {
    const { pagination } = this.state;
    // 有分页
    if (pagination) {
      const options = {
        current: pagination.current - 1,
        pageSize: pagination.pageSize
      };
      // 刷新表格数据时，回到第一页
      if (isToFristPage) {
        options.current = 0;
      }
      this.getTableData(options);

      // 无分页
    } else {
      this.getTableData();
    }
  };

  // 是否有操作栏
  hasActionBar = () => {
    const { backEndBtnsSingle } = this.state;
    const { btnsVisible } = this.props;
    return (
      (btnsVisible &&
        (btnsVisible.edit ||
          btnsVisible.save ||
          btnsVisible.mod ||
          btnsVisible.check ||
          btnsVisible.del)) ||
      (this.props.customBtns && this.props.customBtns.length > 0) ||
      (this.props.unitBtns && this.props.unitBtns.length > 0) ||
      backEndBtnsSingle.length
    );
  };

  // 确认删除行
  confirmDel = async (record, index) => {
    const { resid } = this.props;
    try {
      const result = await delRow(resid, record.REC_ID);
      this.getTableData();
      const newTableData = clone(this.state.tableData);

      message.success('删除成功');
    } catch (err) {
      message.error(err.message);
    }
  };

  // 获取 this.state.originOrderTableData
  getOriginOrderTableData = (type, record, btnsVisible) => {
    const { originOrderTableData } = this.state;
    let data;
    if (this.props.isSortFE) {
      const flag = originOrderTableData.some((item, index) => {
        if (item.REC_ID === record.REC_ID) {
          switch (type) {
            case 'btns': {
              return (originOrderTableData[index].btnsVisible = clone(
                btnsVisible
              ));
            }
            case 'record': {
              return (originOrderTableData[index] = clone(record));
            }
          }
        }
      });
      if (flag) {
        data = clone(originOrderTableData);
      }
    }
    return data || [];
  };

  /**
   * 操作行
   * @param {string} opType 操作类型
   * @param {object} record 记录
   * @param {number} rowIndex 记录索引
   *
   */
  // opType：操作类型；record：行数据；index：行索引
  operationRow = async (opType, record, rowIndex) => {
    switch (opType) {
      // 编辑
      case 'edit': {
        this.mode = 'edit';
        this.formCount++;
        const { tableData, originOrderTableData } = this.state;
        const { editableRow } = this.props;
        const newTableData = cloneDeep(tableData);

        // 单行编辑模式
        if (editableRow.mode === 'single') {
          this.tempFormArr = [];
          this.formCount = 1;
          // 重置所有按钮的状态
          newTableData.forEach(item => {
            if (item.REC_ID > 0) {
              item.btnsVisible = {
                ...this.props.btnsVisible,
                edit: true,
                save: false,
                cancel: false
              };
            }
          });
          const newRecord = clone(record);
          const btnsVisible = {
            mod: false,
            check: false,
            del: false,
            save: this.props.hasSaveBtn,
            cancel: true,
            edit: false
          };

          newTableData[rowIndex].btnsVisible = clone(btnsVisible);
          newRecord.btnsVisible = btnsVisible;

          // 开启了前端排序
          const data = this.getOriginOrderTableData(
            'btns',
            newRecord,
            btnsVisible
          );

          const editingRecIds = [record.REC_ID];
          this.setState({
            tableData: newTableData,
            originTableData: clone(newTableData),
            originOrderTableData: data,
            record: newRecord,
            editingRecIds
          });
        } else {
          // 多行编辑模式
          const { dataMode } = this.props;
          const { editingRecIds } = this.state;
          const newRecord = clone(record);
          let btnsVisible;
          if (dataMode === 'main') {
            btnsVisible = {
              mod: false,
              check: false,
              del: false,
              save: true,
              cancel: true,
              edit: false
            };
          } else {
            btnsVisible = {
              mod: false,
              check: false,
              del: false,
              save: false,
              cancel: true,
              edit: false
            };
          }
          newTableData[rowIndex].btnsVisible = clone(btnsVisible);
          newRecord.btnsVisible = btnsVisible;

          if (editingRecIds.indexOf(record.REC_ID) === -1) {
            editingRecIds.push(record.REC_ID);
          }

          this.setState({
            tableData: newTableData,
            originTableData: clone(newTableData),
            record: newRecord,
            editingRecIds
          });
        }

        break;
      }

      // 保存
      case 'save': {
        let res;
        // 添加
        if (record.REC_ID < 0) {
          const { validateFields } = this.tempFormArr[0];
          validateFields(async (err, values) => {
            if (!err) {
              const formData = values;
              formData.REC_ID = record.REC_ID;
              try {
                res = await addRecord(this.props.resid, formData);
              } catch (err) {
                return message.error(err.message);
              }
              this.refreshTableData(true);
              if (this.props.editableRow.mode === 'single') {
                this.setState({
                  editingRecId: 0
                });
              } else {
                const { editingRecIds } = this.state;
                editingRecIds.some((recid, index) => {
                  if (record.REC_ID === recid) {
                    editingRecIds.splice(index, 1);
                  }
                });
                this.tempFormArr.some((tempForm, index) => {
                  if (tempForm.REC_ID === record.REC_ID) {
                    return this.tempFormArr.splice(index, 1);
                  }
                });
                this.formCount--;

                this.setState({
                  editingRecIds
                });
              }
              message.success('添加成功');
            }
          });
        } else {
          // 修改
          let form;

          this.tempFormArr.some(tempForm => {
            if (tempForm.REC_ID === record.REC_ID) {
              return (form = tempForm);
            }
          });
          const { validateFields } = form;
          validateFields(async (err, values) => {
            if (!err) {
              const formData = values;
              dealFormData(formData);
              formData.REC_ID = record.REC_ID;
              if (this.props.dataMode === 'main') {
                try {
                  res = await modRecord(this.props.resid, formData);
                } catch (err) {
                  return message.error(err.message);
                }
              } else {
                try {
                  const { resid, subresid, hostrecid } = this.props;
                  res = await modSubRecord(
                    resid,
                    hostrecid,
                    subresid,
                    formData
                  );
                } catch (err) {
                  return message.error(err.message);
                }
              }
              console.log('111');

              if (res && !res.data.length) {
                return message.error(res.message);
              }

              if (this.props.editableRow.mode === 'single') {
                this.refreshTableData();
                message.success('保存成功');
                this.setState({
                  editingRecIds: []
                });
              } else {
                const { editingRecIds } = this.state;
                editingRecIds.some((recid, index) => {
                  if (recid === record.REC_ID) {
                    editingRecIds.splice(index, 1);
                  }
                });
                this.refreshTableData();
                this.setState({ editingRecIds });
                message.success('保存成功');
              }
            } else {
              return message.error('表单数据有误');
            }
          });
        }
        break;
      }

      // 取消编辑
      case 'cancel': {
        const { tableData, originTableData } = this.state;

        const data = this.getOriginOrderTableData(
          'btns',
          record,
          Object.assign(this.props.btnsVisible, {
            edit: true,
            save: false,
            cancel: false
          })
        );

        const arr = clone(originTableData);
        arr.some(item => {
          if (item.REC_ID === record.REC_ID) {
            item.btnsVisible = Object.assign(this.props.btnsVisible, {
              edit: true,
              cancel: false,
              save: false
            });
          }
        });
        if (this.props.editableRow.mode === 'single') {
          this.tempFormArr = [];
          this.setState({
            tableData: arr,
            originTableData: clone(arr),
            originOrderTableData: data,
            editingRecIds: []
          });
        } else {
          this.tempFormArr = [];
          const { editingRecIds } = this.state;
          editingRecIds.some((recid, index) => {
            if (recid === record.REC_ID) {
              editingRecIds.splice(index, 1);
            }
          });
          this.setState({
            tableData: arr,
            originTableData: clone(arr),
            originOrderTableData: data,
            editingRecIds
          });
        }
        break;
      }

      // 修改
      case 'mod': {
        const o = cloneDeep(record);
        this.setState({
          modalFormShow: true,
          record: o,
          operation: opType,
          selectedRowIndex: rowIndex
        });
        break;
      }

      // 查阅
      case 'check': {
        this.setState({
          modalFormShow: true,
          record: record,
          operation: opType
        });
        break;
      }

      // 删除
      case 'del': {
        // 删除行内编辑添加的记录（还未存入数据库）
        if (record.REC_ID < 0) {
          this.tempFormArr.some((item, index) => {
            if (item.index === Math.abs(record.REC_ID) - 1) {
              this.tempFormArr.splice(index, 1);
            }
          });
          this.formCount--;
          if (this.tempFormArr.length === 0) {
            this.setState({ isInMoltipleEdit: false, editingRecId: 0 });
            this.tempFormArr = [];
            this.formCount = 0;
          }
          const { tableData } = this.state;
          tableData.some((item, index) => {
            if (item.REC_ID === record.REC_ID) {
              tableData.splice(index, 1);
            }
          });
          this.setState({ tableData });
        }
        // 删除已有的记录
        else {
          const { resid, subresid, dataMode } = this.props;
          let id = dataMode === 'main' ? resid : subresid,
            res;
          try {
            res = await delRow(id, record.REC_ID);
          } catch (err) {
            console.error(err);
          }
          const { pagination, tableData } = this.state;
          const newTableData = clone(tableData);
          newTableData.splice(rowIndex, 1);

          let newPagination;
          if (this.props.pagination) {
            newPagination = {
              ...pagination,
              total: pagination.total - 1
            };
          }
          newPagination
            ? this.setState({
                tableData: newTableData,
                pagination: newPagination
              })
            : this.setState({ tableData: newTableData });

          message.success('删除成功');
        }
      }
    }
  };

  componentDidMount() {
    this.getData();
    this.subscribeEvent();
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.cmswhere !== this.props.cmswhere) {
      this.props = nextProps;
      this.getTableData();
    }
  };

  componentWillUnmount = () => {
    if (this.props.exceptTableInnerHeight) {
      window.removeEventListener('resize', this.handleWindowResize);
    }
  };

  subscribeEvent = () => {
    if (this.props.exceptTableInnerHeight) {
      window.addEventListener('resize', debounce(this.handleWindowResize, 500));
    }
  };

  handleWindowResize = e => {
    const tableInnerHeight = this.getTableInnerHeight(
      this.props.exceptTableInnerHeight
    );
    this.setState({ tableInnerHeight });
  };

  getData = async () => {
    const { editableRow, isBackEndBtnsVisible } = this.props;
    this.setState({ loading: true });

    let promiseArr = [this.getTableData(), this.getFormData()];

    // 开启了行内编辑功能
    if (editableRow) {
      promiseArr.push(this.getColumnsDefine());
    }

    // 显示后端自定义功能按钮
    if (isBackEndBtnsVisible) {
      promiseArr.push(this.getButtons());
    }

    await Promise.all(promiseArr);

    this.setState({ loading: false });
  };

  /**
   * 获取自定义按钮
   *
   * 按钮字段说明：
   * Name1：按钮名称
   * Type：按钮行为类型（1 发送请求，4 跳转网页，6 打开指定的 formName 的表单进行编辑）
   * Code：发送给后台的 strCommand 参数值
   * OkMsgCn：点击按钮成功后的提示信息
   * FailMsgCn：点击按钮失败后的提示信息
   * FormName：窗体名称
   */
  getButtons = async () => {
    const { dataMode, resid, subresid, backendBtnsVisible } = this.props;
    let res, id;
    if (dataMode === 'main') {
      id = resid;
    } else {
      id = subresid;
    }
    try {
      res = await getButtons(id);
    } catch (err) {
      this.setState({ loading: false });
      return message.error(err.message);
    }
    const {
      backEndBtnsMultiple,
      backEndBtnsSingle
    } = extractAndDealBackendBtns(res.data);

    // 若有操作多条记录的后端按钮，则出现行选择功能
    let rowSelection = null;
    if (backEndBtnsMultiple.length) {
      rowSelection = {
        columnWidth: 60,
        onChange: this.rowSelectionChange,
        selectedRowKeys: []
      };
    }
    this.setState({
      backEndBtnsMultiple,
      backEndBtnsSingle,
      rowSelection
    });
  };

  rowSelectionChange = (selectedRowKeys, selectedRows) => {
    const rowSelection = {
      ...this.state.rowSelection,
      selectedRowKeys
    };
    this.setState({ selectedRowKeys, selectedRows, rowSelection });
  };

  // 获取列定义
  // 主要是为了获取记录是否是只读的
  // 获取的列定义数据只用于行内编辑
  columnsDefineData = [];
  getColumnsDefine = async () => {
    try {
      let id;
      if (this.props.dataMode === 'main') {
        id = this.props.resid;
      } else if (this.props.dataMode === 'sub') {
        id = this.props.subresid;
      }
      const res = await getColumnsDefine(id);
      this.columnsDefineData = res.data;
    } catch (err) {
      this.setState({ loading: false });

      return message.error(err.message);
    }
  };

  // 可操作的控件（用于行内编辑）
  canOpControlArr = [];
  formFormData = {
    subTableArr: [],
    allControlArr: [],
    canOpControlArr: [],
    containerControlArr: []
  }; // 表单窗体设计数据
  // 获取窗体设计数据
  getFormData = async () => {
    const { dataMode, formsName, resid, subresid } = this.props;
    // 获取表 id
    let id;
    if (dataMode === 'main') {
      id = resid;
    } else if (dataMode === 'sub') {
      id = subresid;
    }
    // 获取窗体设计数据
    let res, formFormData;
    if (typeof formsName === 'object') {
      try {
        res = await Promise.all([
          getFormData(id, formsName.rowFormName),
          getFormData(id, formsName.formFormName)
        ]);
      } catch (err) {
        this.setState({ loading: false });

        return message.error(err.message);
      }
      res.forEach((item, index) => {
        formFormData = dealControlArr(item.data.columns);
        if (index === 0) {
          this.canOpControlArr = formFormData.canOpControlArr;
        } else {
          formFormData = dealControlArr(item.data.columns);
        }
        this.formFormData = clone(formFormData);
      });
    } else if (typeof formsName === 'string') {
      try {
        res = await getFormData(id, formsName);
      } catch (err) {
        this.setState({ loading: false });

        return message.error(err.message);
      }
      formFormData = dealControlArr(res.data.columns);
      this.formFormData = clone(formFormData);
      this.canOpControlArr = formFormData.canOpControlArr;
    }
    this.setState({ formFormData });
  };

  /**
   * 每一列的宽度
   * 如：{ '人员编号': 100, '部门名称': 200, // ... }
   */
  widths = {};
  getWidths = columns => {
    const { columnWidth, customColumnWidth } = this.props;
    columns.forEach(column => {
      this.widths[column.text] =
        customColumnWidth && customColumnWidth[column.text]
          ? customColumnWidth[column.text]
          : columnWidth;
    });
  };

  // 行内编辑添加记录
  inlineEditAdd = () => {
    this.mode = 'add';
    this.addFormCount++;

    const { tableData, isInMoltipleEdit, editingRecIds } = this.state;
    const { startColumnAdd } = this.props;
    // 添加单条记录
    if (startColumnAdd.mode === 'single') {
      if (editingRecIds.length !== 0) {
        return message.error('请先保存正在编辑的数据，再进行添加');
      }
      const newRecord = {
        REC_ID: -1,
        btnsVisible: {
          save: true,
          cancel: true,
          edit: false,
          mod: false,
          check: false,
          del: false
        }
      };
      tableData.unshift(newRecord);
      this.setState({ tableData, editingRecId: -1 });
    } else if (startColumnAdd.mode === 'multiple') {
      this.setState({ isInMoltipleEdit: true });
      const newRecord = {
        REC_ID: this.getREC_ID(tableData),
        btnsVisible: {
          save: false,
          cancel: false,
          edit: false,
          mod: false,
          check: false,
          del: false
        }
      };

      tableData.unshift(newRecord);
      this.setState({ tableData });
    }
  };
  getREC_ID = tableData => {
    if (tableData.length === 0) {
      return -1;
    } else {
      return tableData[0].REC_ID < 0 ? tableData[0].REC_ID - 1 : -1;
    }
  };

  // 取消保存多条记录
  cancelMultipleRecord = () => {
    const { tableData } = this.state,
      newTableData = [];

    tableData.forEach((item, index) => {
      if (item.REC_ID > 0) {
        newTableData.push(item);
      }
    });
    this.tempFormArr = [];
    this.formCount = 0;
    this.setState({ tableData: newTableData, isInMoltipleEdit: false });
  };

  // 保存多条记录
  saveMultipleRecord = async () => {
    const { dataMode, resid, subresid } = this.props;
    const { pagination } = this.state;

    let data = [],
      id = dataMode === 'main' ? resid : subresid,
      hasError = false;

    this.addFormArr.forEach(form => {
      const { validateFields } = form;
      validateFields((err, values) => {
        if (!err) {
          const obj = values;
          obj._state = 'added';
          obj._id = 1;
          data.push({
            resid: id,
            maindata: obj
          });
        } else {
          hasError = true;
        }
      });
    });
    if (hasError) {
      return;
    }
    let res;
    try {
      res = await saveMultipleRecord(data);
    } catch (err) {
      return message.error(err.message);
    }
    message.success('保存成功');
    this.addFormCount = 0;
    this.addFormArr = [];
    let obj = {
      key: '',
      current: 0,
      pageSize: pagination ? pagination.pageSize : ''
    };
    this.getTableData(obj);
    pagination ? (pagination.current = 0) : null;
    this.setState({
      pagination,
      isInMoltipleEdit: false
    });
  };

  // 处理表头数据
  dealColumns = cmscolumninfo => {
    const {
      isSortBE,
      btnsVisible,
      isSortFE,
      startColumns,
      mergeColIndex,
      filters,
      startColumnAdd,
      fixedCols,
      customColumnWidth,
      customColRender
    } = this.props;

    let arr;

    // startColumns
    arr = startColumns.length !== 0 ? [...startColumns] : [];

    this.getWidths(cmscolumninfo);

    // 数据栏
    cmscolumninfo.forEach((column, index) => {
      const opt = {
        title: column.text,
        dataIndex: column.id,
        key: column.id,
        width: this.widths[column.text],
        align: 'left',
        isEditableCell: true // 是否是可以编辑的单元格
      };
      // 开启了后端排序功能且当前列可以排序
      if (isSortBE && this.curColIsSort('be', column)) {
        opt.sorter = true;
      }
      // 开启了前端排序功能且当前列可以排序
      if (isSortFE && this.curColIsSort('fe', column)) {
        opt.text = column.text;
        opt.sorter = true;
      }
      // 过滤功能
      if (filters && Object.keys(filters).indexOf(column.text) !== -1) {
        opt.filters = filters[column.text];
        opt.onFilter = (value, record) =>
          record[column.id].indexOf(value) === 0;
      }

      // 固定在左侧的列
      if (fixedCols && fixedCols.indexOf(column.text) !== -1) {
        opt.fixed = 'left';
      }

      // 指定某列的宽度
      if (customColumnWidth) {
        if (customColumnWidth[column.text]) {
          opt.width = customColumnWidth[column.text];
        }
      }

      // 自定义渲染行：列颜色 / 列数据格式化
      if (Array.isArray(customColRender)) {
        let item;
        if (
          (item = customColRender.find(
            item => item.innerFieldName === column.id
          ))
        ) {
          opt.render = (value, record, rowIndex) => {
            const props = {};
            // 列颜色
            if (item.colors) {
              const obj = item.colors.find(color => color.value === value);
              const color = obj && obj.color;
              props.style = { color };
            }
            // 列数据格式化
            if (item.format) {
              value = item.format(value);
            }
            return <span {...props}>{value}</span>;
          };
        }
      }

      // 列合并功能
      // if (mergeColIndex === 0 || mergeColIndex) {
      //   if (mergeColIndex === index) {
      //     // opt.colSpan = 2;
      //     opt.render = (value, record, rowIndex) => {
      //       return {
      //         children: (
      //           <div
      //             style={{
      //               fontWeight: 'bold',
      //               position: 'relative',
      //               left: '0px',
      //               top: '-10px'
      //             }}
      //           >
      //             {value}
      //           </div>
      //         ),
      //         props: {
      //           colSpan: 1
      //         }
      //       };
      //     };
      //   } else if (mergeColIndex === index - 1) {
      //     opt.colSpan = 0;
      //     opt.render = (value, record, rowIndex) => {
      //       return {
      //         children: (
      //           <div
      //             style={{ position: 'relative', left: '-200px', top: '10px' }}
      //           >
      //             {value}
      //           </div>
      //         ),
      //         props: {
      //           colSpan: 1
      //         }
      //       };
      //     };
      //   }
      // }
      arr.push(opt);
    });

    // 通过 columnCount 来计算 scroll.x 的值
    this.setState({ columnCount: arr.length });
    return arr;
  };

  // 获取列排序函数
  getSortFn = column => {
    let fn;
    this.props.sortFns.some(item => {
      if (item.text === column.text) {
        return (fn = item.sortFn);
      }
    });
    return fn;
  };

  // 当前列是否配置了排序
  curColIsSort = (sortType, column) => {
    switch (sortType) {
      // 后端排序
      case 'be': {
        const { sortFields } = this.props;
        if (!sortFields || sortFields.length === 0) {
          return true;
        }
        let flag = false;
        sortFields.some(text => {
          if (column.text === text) {
            return (flag = true);
          }
        });
        return flag;
      }
      // 前端排序
      case 'fe': {
        const { sortFns } = this.props;
        if (!sortFns || sortFns.length === 0) {
          console.error(
            '在使用 lz-table 组件中：你开启了前端排序功能，请传入非空的 sortFns，如：[{ text: "人员编号", sortFn: (a,b) => a - b }]'
          );
          return false;
        }
        let flag = false;
        this.props.sortFns.some(item => {
          if (column.text === item.text) {
            return (flag = true);
          }
        });
        return flag;
      }
    }
  };

  // 行内编辑的表单数据
  formDataArr = [];
  /**
   * 获取表格数据
   * @param {object} options 获取主表数据查询条件
   *   current：当前页码
   *   pageSize：分页大小
   * @param {string} cmswhere 查询语句
   */
  getTableData = async (
    options = {
      ...{
        key: '',
        sortOrder: '',
        sortField: ''
      },
      ...(this.state.pagination || {})
    },
    cmswhere
  ) => {
    options = {
      ...{
        key: this.state.key,
        sortOrder: this.state.sortOrder,
        sortField: this.state.sortField
      },
      ...options
    };

    let res;
    // 主表数据
    if (this.props.dataMode === 'main') {
      const { resid, cmscolumns, mtsid } = this.props;
      if (this.props.cmswhere) {
        cmswhere = `${cmswhere ? cmswhere + ' and ' : ''} ${
          this.props.cmswhere
        }`;
      }
      try {
        res = await getMainTableData(
          resid,
          mtsid,
          Object.assign(options, { cmswhere, cmscolumns })
        );
      } catch (err) {
        this.setState({ loading: false });

        return message.error(err.message);
      }
      // 子表数据
    } else {
      const { resid, subresid, hostrecid, cmscolumns, operation } = this.props;
      if (this.props.cmswhere) {
        cmswhere = `${cmswhere ? cmswhere + ' and ' : ''} ${
          this.props.cmswhere
        }`;
      }
      if (operation === 'add') {
        res = await getColumnsDefine(subresid);
      } else if (operation !== 'add' && hostrecid !== 0) {
        try {
          res = await getSubTableData(
            resid,
            subresid,
            hostrecid,
            Object.assign(options, { cmswhere, cmscolumns })
          );
        } catch (err) {
          this.setState({ loading: false });

          return message.error(err.message);
        }
      } else {
        return;
      }
    }

    let tableData, columns;
    if (this.props.operation === 'add') {
      tableData = [];
    } else {
      tableData = this.dealTableData(res.data);
    }
    columns = this.dealColumns(res.cmscolumninfo);

    const originTableData = clone(tableData);
    // 前端排序开启了，才需要 this.state.originOrderTableData
    let originOrderTableData;
    if (this.props.isSortFE) {
      originOrderTableData = clone(tableData);
    }
    // 开启了分页功能
    let pagination;
    if (this.props.pagination) {
      pagination = {
        ...this.state.pagination,
        ...{
          pageSize: options.pageSize,
          current: options.current + 1,
          total: res.total,
          showTotal: total => <div>总共 {total} 条记录</div>
        }
      };
    }
    this.setState(
      Object.assign(
        this.state,
        {
          originCmscolumninfo: res.cmscolumninfo,
          columns,
          tableData,
          originTableData,
          originOrderTableData: originOrderTableData || [],
          key: options.key
        },
        pagination ? { pagination } : {}
      )
    );
    this.props.getTableData && this.props.getTableData(tableData, res.total);
  };

  // 处理表格数据
  dealTableData = tableData => {
    switch (this.props.viewMode) {
      case 'table': {
        const { btnsVisible, editableRow, dataMode } = this.props;
        const { editingRecIds } = this.state;
        // 主表
        if (dataMode === 'main') {
          tableData.forEach((item, index) => {
            item.btnsVisible = { ...btnsVisible };
            // 未开启行编辑功能
            if (!editableRow) {
              item.btnsVisible.edit = false;
              item.btnsVisible.save = false;
              item.btnsVisible.cancel = false;
            } else if (editableRow) {
              // 开启了多行编辑功能

              item.btnsVisible.save = false;
              item.btnsVisible.cancel = false;
              editingRecIds.some(recid => {
                if (item.REC_ID === recid) {
                  item.btnsVisible.save = true;
                  item.btnsVisible.cancel = true;
                  item.btnsVisible.edit = false;
                  item.btnsVisible.mod = false;
                  item.btnsVisible.check = false;
                  item.btnsVisible.del = false;
                  return true;
                }
              });
            }
            // 记录的索引
            item.index = index;
          });
        } else {
          // 子表
          tableData.forEach((item, index) => {
            item.btnsVisible = { ...btnsVisible };
            // 未开启行编辑功能
            if (!editableRow) {
              item.btnsVisible.edit = false;
              item.btnsVisible.save = false;
              item.btnsVisible.cancel = false;
            } else if (editableRow) {
              // 开启了多行编辑功能
              item.btnsVisible.save = false;
              item.btnsVisible.cancel = false;
              editingRecIds.some(recid => {
                if (item.REC_ID === recid) {
                  item.btnsVisible.save = false;
                  item.btnsVisible.cancel = true;
                  item.btnsVisible.edit = false;
                  item.btnsVisible.mod = false;
                  item.btnsVisible.check = false;
                  item.btnsVisible.del = false;
                  return true;
                }
              });
            }
            // 记录的索引
            item.index = index;
          });
        }
        break;
      }
      case 'cards': {
        break;
      }
      case 'forms': {
        tableData.forEach(item => {
          item.viewStatus = 'view';
        });
      }
    }

    return tableData;
  };

  // 按照表格数据的顺序，重新赋值索引
  dealTableDataIndex = tableData => {
    tableData.forEach((item, index) => {
      // 记录的索引
      item.index = index;
    });
    return tableData;
  };

  addRecord = record => {
    this.openModalWay = 'fe';
    this.setState({
      modalFormShow: true,
      operation: 'add',
      record: record || { REC_ID: 0 }
    });
  };

  // 点击模态框中的确认按钮
  onConfirm = (operation, record, rowIndex) => {
    const { pagination } = this.state;
    switch (operation) {
      // 添加
      case 'add': {
        this.refreshTableData(true);

        this.setState({
          modalFormShow: false
        });
        message.success('添加成功！');
        break;
      }
      // 修改
      case 'mod': {
        this.refreshTableData();
        this.setState({ modalFormShow: false });
        message.success('修改成功！');
        break;
      }

      default:
        this.setState({ modalFormShow: false });
    }
  };

  // 模糊搜索
  search = value => {
    const { pagination, key } = this.state;
    let o = {};
    if (this.state.pagination) {
      o = { current: 0, pageSize: pagination.pageSize };
    }
    this.getTableData(Object.assign(o, { key: value }));
  };

  // 卡片组件分页 change
  cardPageChange = (page, pageSize) => {
    this.getTableData({
      current: page - 1,
      pageSize
    });
  };

  // 分页，过滤，排序
  handleTableChange = (pagination, filters, sorter, extra) => {
    const o = {
      key: this.state.key
    };
    // 开启了分页功能
    if (this.state.pagination) {
      o.current = pagination.current - 1;
      o.pageSize = pagination.pageSize;
    }

    const { isSortBE, isSortFE } = this.props;
    // 后端排序，增加排序参数
    if (isSortBE && Object.keys(sorter).length !== 0) {
      o.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      o.sortField = sorter.field;
    }
    // 前端排序，不去请求后端数据
    const { sortInfo } = this.state;
    if (
      isSortFE &&
      (sortInfo.order !== sorter.order || sortInfo.field !== sorter.field)
    ) {
      const { tableData, originOrderTableData } = this.state;
      // 原来的顺序
      if (!sorter.order) {
        return this.setState({
          sortInfo: sorter,
          tableData: clone(originOrderTableData),
          originTableData: clone(originOrderTableData)
        });
      } else {
        let newTableData = tableData.sort(this.getSortFn(sorter.column));
        newTableData = this.dealTableDataIndex(newTableData);
        // 升序
        if (sorter.order === 'ascend') {
          return this.setState({
            sortInfo: sorter,
            tableData: clone(newTableData),
            originTableData: clone(newTableData)
          });
          // 降序
        } else if (sorter.order === 'descend') {
          return this.setState({
            sortInfo: sorter,
            tableData: clone(newTableData.reverse()),
            originTableData: clone(newTableData.reverse())
          });
        }
      }
    }
    // 前端排序，才用到 this.state.sortInfo
    if (isSortFE) {
      this.setState({ sortInfo: sorter });
    }

    this.getTableData(o, this.wheres);
  };

  editRowIndex = -1; //  编辑行的索引
  getControlData = (column, index) => {
    let controlData;
    // 获取控件数据
    const canOpControlArr = this.canOpControlArr;
    // 获取当前单元格的控件数据
    canOpControlArr.some(control => {
      if (column.dataIndex === control.ColName) {
        return (controlData = control);
      }
    });
    return controlData;
  };

  // cell 是否处于编辑状态
  isEditing = record => {
    const { editingRecIds, editingRecId } = this.state;
    if (
      record.REC_ID < 0 ||
      editingRecIds.indexOf(record.REC_ID) !== -1 ||
      editingRecId === record.REC_ID
    ) {
      return true;
    }
    return false;
  };

  getExpandedRowRender = () => {
    const { expandSubTableConfig } = this.props;
    if (expandSubTableConfig) {
      return {
        expandedRowRender: record => {
          return (
            <LzTable
              {...expandSubTableConfig}
              className="lz-table__expand-sub-table"
              hostrecid={record.REC_ID}
            />
          );
        }
      };
    }
  };

  renderRowEditBtn = (record, rowIndex) => {
    return (
      <Button
        size="small"
        className="operation-btn"
        onClick={() => {
          this.openModalWay = 'fe';
          this.operationRow('edit', record, rowIndex);
        }}
      >
        <FormattedMessage id="edit" />
      </Button>
    );
  };

  renderRowSaveBtn = (record, rowIndex) => {
    return (
      <EditableContext.Consumer>
        {form => (
          <Button
            size="small"
            className="operation-btn"
            onClick={() => {
              this.operationRow('save', record, rowIndex, this.tempForm);
            }}
          >
            保存
          </Button>
        )}
      </EditableContext.Consumer>
    );
  };

  renderRowCancelBtn = (record, rowIndex) => {
    return (
      <Popconfirm
        placement="top"
        title="你确定要取消编辑吗？"
        onConfirm={() => {
          this.operationRow('cancel', record, rowIndex);
        }}
        okText="确定"
        cancelText="取消"
      >
        <Button size="small" className="operation-btn" type="danger">
          <FormattedMessage id="cancel" />
        </Button>
      </Popconfirm>
    );
  };

  renderRowModBtn = (record, rowIndex) => {
    return (
      <Button
        size="small"
        className="operation-btn"
        onClick={() => {
          this.openModalWay = 'fe';
          this.operationRow('mod', record, rowIndex);
        }}
      >
        <FormattedMessage id="mod" />
      </Button>
    );
  };

  renderRowCheckBtn = (record, rowIndex) => {
    return (
      <Button
        size="small"
        className="operation-btn"
        onClick={() => {
          this.openModalWay = 'fe';
          this.operationRow('check', record, rowIndex);
        }}
      >
        <FormattedMessage id="view" />
      </Button>
    );
  };

  renderRowDelBtn = (record, rowIndex) => {
    return (
      <Popconfirm
        placement="top"
        title="你确定要删除这条记录吗？"
        onConfirm={() => {
          this.operationRow('del', record, rowIndex);
        }}
        okText="确定"
        cancelText="取消"
      >
        <Button size="small" className="operation-btn" type="danger">
          <FormattedMessage id="delete" />
        </Button>
      </Popconfirm>
    );
  };

  renderRowCustomBtns = (record, rowIndex, customBtns) => {
    return customBtns.map(customBtn => {
      return (
        <a
          key={customBtn.text}
          className="operation-btn"
          href="javascript:;"
          onClick={() => {
            customBtn.onClick(record);
          }}
        >
          {customBtn.text}
        </a>
      );
    });
  };

  renderRowUnitBtns = (record, rowIndex, unitBtns) => {
    return unitBtns.map(btnInfo => {
      return (
        <Button
          key={btnInfo.btnName}
          size="small"
          className="operation-btn"
          onClick={() => {
            this.openUnitComponent(record, rowIndex, btnInfo);
          }}
        >
          {btnInfo.btnName}
        </Button>
      );
    });
  };

  getActionBar = () => {
    const actionBar = {
      title: '操作',
      dataIndex: '操作',
      key: '操作',
      align: 'center',
      width: this.props.opWidth,
      isEditableCell: false, // 是否是可以编辑的单元格
      render: (text, record, rowIndex) => {
        const { rowIndex: index, tableData, backEndBtnsSingle } = this.state;
        const { edit, save, mod, check, del, cancel } = tableData[
          rowIndex
        ].btnsVisible;
        const { customBtns, backendBtnsHide, unitBtns } = this.props;
        const backEndBtns = filterBackEndBtns(
          backEndBtnsSingle,
          backendBtnsHide,
          record
        );
        return (
          <div>
            {/* 编辑、保存、取消 /修改 /查看 /删除 按钮 */}
            {edit && this.renderRowEditBtn(record, rowIndex)}
            {save && this.renderRowSaveBtn(record, rowIndex)}
            {cancel && this.renderRowCancelBtn(record, rowIndex)}
            {mod && this.renderRowModBtn(record, rowIndex)}
            {check && this.renderRowCheckBtn(record, rowIndex)}
            {del && this.renderRowDelBtn(record, rowIndex)}
            {/* 自定义按钮 */}
            {customBtns &&
              this.renderRowCustomBtns(record, rowIndex, customBtns)}
            {/* 后台自定义按钮 */}
            {this.renderBackendBtns(backEndBtns, record)}
            {/* 打开单元组件的按钮 */}
            {Array.isArray(unitBtns) &&
              this.renderRowUnitBtns(record, rowIndex, unitBtns)}
          </div>
        );
      }
    };
    // 操作栏固定在右侧
    if (this.props.opIsFixed) {
      actionBar.fixed = 'right';
    }
    return actionBar;
  };

  getColumns = () => {
    const { columns } = this.state;
    const newColumns = cloneDeep(columns);
    // const newColumns = columns;
    const { btnsVisible } = this.props;

    // 操作栏
    if (this.hasActionBar()) {
      newColumns.push(this.getActionBar());
    }

    // 开启了行内编辑添加记录
    if (this.props.startColumnAdd) {
      newColumns.unshift({
        title: (
          <div className="inline-edit-btn">
            <i
              className="add iconfont icon-add"
              onClick={this.inlineEditAdd}
              title="添加"
            />
            {this.props.startColumnAdd.mode === 'multiple' &&
              this.props.dataMode === 'main' &&
              this.state.isInMoltipleEdit && (
                <i
                  className="save iconfont icon-save"
                  onClick={this.saveMultipleRecord}
                  title="保存"
                />
              )}
            {this.props.startColumnAdd.mode === 'multiple' &&
              this.state.isInMoltipleEdit && (
                <Popconfirm
                  placement="top"
                  title="你确定要取消吗？"
                  onConfirm={this.cancelMultipleRecord}
                  okText="确定"
                  cancelText="取消"
                >
                  <i className="cancel iconfont icon-cancel" />
                </Popconfirm>
              )}
          </div>
        ),
        key: 'startAddColumnData',
        align: 'center',
        width:
          (this.props.startColumnAdd && this.props.startColumnAdd.width) || 100,
        isEditableCell: false,
        render: (text, record, rowIndex) => {
          return (
            <Popconfirm
              placement="top"
              title="你确定要删除这条记录吗？"
              onConfirm={() => {
                this.operationRow('del', record, rowIndex);
              }}
              okText="确定"
              cancelText="取消"
            >
              <i className="start-operation del iconfont icon-delete" />
            </Popconfirm>
          );
        }
      });
    }

    // 开启了行内编辑
    let cols, components;
    if (this.props.editableRow) {
      cols = newColumns;

      cols = cols.map((col, index) => {
        if (!col.isEditableCell) {
          return col;
        }
        const controlData = this.getControlData(col, index);
        return {
          ...col,
          onCell: record => {
            return {
              record,
              // dataIndex: col.dataIndex,
              editing: this.isEditing(record),
              controlData,
              rowIndex: record.index,
              talbeRef: this
            };
          }
        };
      });
      components = {
        body: {
          row: EditableFormRow,
          cell: LzEditableCell
        }
      };
      // 未开启行内编辑
    } else {
      cols = newColumns;
    }
    return { columns: cols, components };
  };

  renderOnCell = record => {
    return {
      record,
      // dataIndex: col.dataIndex,
      editing: this.isEditing(record),
      controlData,
      rowIndex: record.index,
      talbeRef: this
    };
  };

  getScrollX = () => {
    let sum = 0;
    Object.keys(this.widths).forEach(key => {
      sum += this.widths[key];
    });
    return { x: sum };
  };

  getClassName = () => {
    const { editableRow, formViewMode } = this.props;
    let className = '';
    if (editableRow) {
      className += 'lz-editable-row ';
    }
    return className;
  };

  renderContent = () => {
    switch (this.props.viewMode) {
      case 'table': {
        return this.renderTable();
      }
      case 'cards': {
        return this.renderCards();
      }
      case 'forms': {
        return this.renderForms();
      }
      default:
        return (
          <div>
            LzTable：viewMode 参数错误，应为 "table" | "cards" | "forms"
          </div>
        );
    }
  };

  renderBackendBtns = (backEndBtns, record) => {
    const { dataMode, resid, subresid, searchValue, hostrecid } = this.props;
    const id = dataMode === 'main' ? resid : subresid;
    const token = getToken();

    return (
      <Fragment>
        {backEndBtns.map(btnInfo => {
          const url = `${
            btnInfo.Url
          }?resid=${resid}&subresid=${subresid}&hostrecid=${hostrecid}&subrecid=${
            record.REC_ID
          }&token=${token}&searchvalue=${searchValue}`;
          return (
            <LzBackendBtn
              key={btnInfo.Name1}
              btnInfo={btnInfo}
              resid={id}
              url={url}
              records={[record]}
              // this.operationBackEndBtn('single', btnInfo, record, rowIndex);
              onConfirm={this.backendBtnConfirm}
            />
          );
        })}
      </Fragment>
    );
  };

  getFormHeader = (record, rowIndex) => {
    const { formHeaderRecords, btnsVisible, backendBtnsHide } = this.props;
    const { mod, del } = btnsVisible;
    const { backEndBtnsSingle } = this.state;

    const backEndBtns = filterBackEndBtns(
      backEndBtnsSingle,
      backendBtnsHide,
      record
    );

    return (
      <div className="lz-form-header-wrap">
        <div className="lz-form-header-record-wrap">
          {formHeaderRecords.map(formHeaderRecord => (
            <span
              className="value"
              style={formHeaderRecord.style}
              key={formHeaderRecord.innerFieldName}
            >
              {record[formHeaderRecord.innerFieldName]}
            </span>
          ))}
        </div>

        <div className="lz-form-header-btns-wrap">
          {mod && (
            <Button
              size="small"
              className="operation-btn"
              onClick={() => {
                this.openModalWay = 'fe';
                this.operationRow('mod', record, rowIndex, this.openModalWay);
              }}
            >
              <FormattedMessage id="mod" />
            </Button>
          )}
          {del && (
            <Popconfirm
              placement="top"
              title="你确定要删除这条记录吗？"
              onConfirm={() => {
                this.operationRow('del', record, rowIndex);
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" className="operation-btn" type="danger">
                <FormattedMessage id="delete" />
              </Button>
            </Popconfirm>
          )}
          {/* 渲染后端自定义按钮 */}
          {this.renderBackendBtns(backEndBtns, record)}
        </div>
      </div>
    );
  };

  renderForms = () => {
    const { tableData } = this.state;
    const {
      colCount,
      cFFillFormInnerFieldNames,
      associatedFields
    } = this.props;
    const bodyStyle = {
      borderRadius: 10
    };
    return (
      <Fragment>
        {tableData.map((record, rowIndex) => {
          return (
            <div
              className="render-forms-form-wrap"
              // 加上 REC_EDTTIME，因为修改了记录之后，record.REC_ID 是不会变的
              key={'' + record.REC_ID + record.REC_EDTTIME}
            >
              <LzForm
                viewStatus="view"
                record={record}
                formFormData={this.formFormData}
                colCount={colCount}
                header={this.getFormHeader(record, rowIndex)}
                bodyStyle={bodyStyle}
                style={{ borderRadius: 10 }}
                cFFillFormInnerFieldNames={cFFillFormInnerFieldNames}
                associatedFields={associatedFields}
              />
            </div>
          );
        })}
      </Fragment>
    );
  };

  renderCards = () => {
    const { tableData } = this.state;
    const { showColumnsInnerFieldName } = this.props;
    const { mod, check, del } = this.props.btnsVisible;
    return (
      <div className="lz-cards">
        {tableData.map((item, rowIndex) => {
          return (
            <div className="lz-card" key={item.C3_511302131411}>
              <div className="img-wrap">
                <img
                  src={item[showColumnsInnerFieldName.img]}
                  alt={item[showColumnsInnerFieldName.img]}
                />
              </div>
              <div className="line" />
              <h2>{item[showColumnsInnerFieldName.title]}</h2>
              <p title={item[showColumnsInnerFieldName.desc]}>
                {item[showColumnsInnerFieldName.desc]}
              </p>
              <div className="btns">
                {check && (
                  <Button
                    type="primary"
                    className="btn"
                    onClick={() => {
                      this.operationRow('check', item, rowIndex);
                    }}
                  >
                    <FormattedMessage id="view" />
                  </Button>
                )}
                {mod && (
                  <Button
                    className="btn"
                    onClick={() => {
                      this.operationRow('mod', item, rowIndex);
                    }}
                  >
                    <FormattedMessage id="mod" />
                  </Button>
                )}
                {del && (
                  <Button
                    className="btn"
                    onClick={() => {
                      this.operationRow('del', item, rowIndex);
                    }}
                  >
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  getFormFormName = () => {
    const { formsName } = this.props;
    return typeof formsName === 'string' ? formsName : formsName.formFormName;
  };

  renderTable = () => {
    const {
      tableData,
      loading,
      pagination,
      rowSelection,
      tableInnerHeight
    } = this.state;
    const {
      expandRowByClick,
      showHeader,
      bordered,
      mergeColIndex
    } = this.props;

    const { columns, components } = this.getColumns();
    const hasMergeCol = mergeColIndex === 0 || mergeColIndex;
    return (
      <div className={hasMergeCol ? 'col-merge' : ''}>
        <Table
          rowSelection={rowSelection ? rowSelection : null}
          pagination={pagination ? pagination : false}
          components={components}
          bordered={bordered}
          rowKey="REC_ID"
          columns={columns}
          dataSource={tableData}
          onChange={this.handleTableChange}
          scroll={{
            ...this.getScrollX(),
            y: tableInnerHeight
          }}
          {...this.getExpandedRowRender()}
          size={this.props.tableSize}
          expandRowByClick={expandRowByClick ? true : false}
          className={this.getClassName()}
          showHeader={showHeader}
          rowClassName={'rowClassName'}
          onRow={record => {
            return {
              onMouseEnter: () => {} // 鼠标移入行
            };
          }}
          locale={{
            emptyText: <div className="iconfont icon-default-nodata" />
          }}
        />
      </div>
    );
  };

  wheres = '';
  // 高级搜索条件发生改变
  conditionChange = async wheres => {
    this.wheres = wheres;
    const { pagination } = this.state;
    let o = {};
    if (pagination) {
      o.current = 0;
      o.pageSize = pagination.pageSize;
    }
    this.setState({ loading: true });
    await this.getTableData(o, wheres);
    this.setState({ loading: false });
  };

  renderAddBtn = () => {
    const { addBtn } = this.props;
    if (typeof addBtn === 'boolean') {
      return (
        <Button type="primary" onClick={this.addRecord} className="header-btn">
          添加
        </Button>
      );
    } else {
      let text;
      if (addBtn.type === 'icon') {
        text = <i className={`iconfont ${addBtn.text}`} />;
      } else {
        text = addBtn.text;
      }
      return (
        <Button
          type="primary"
          onClick={this.addRecord}
          className="header-btn"
          block={addBtn.isBlock}
        >
          {text}
        </Button>
      );
    }
  };

  renderSearchInput = () => {
    return (
      <Search
        placeholder="请输入关键词"
        enterButton="搜索"
        onSearch={this.search}
        style={{ width: '200px', marginLeft: '4px' }}
        className="header-btn"
      />
    );
  };

  renderBackendBtnsMultiple = () => {
    const { dateMode, resid, subresid } = this.props;
    const { selectedRows } = this.state;
    let id = resid;
    if (dateMode === 'sub') {
      id = subresid;
    }
    return this.state.backEndBtnsMultiple.map(btnInfo => {
      return (
        <LzBackendBtn
          key={btnInfo.Name1}
          btnInfo={btnInfo}
          resid={id}
          onConfirm={this.backendBtnConfirm}
          records={selectedRows}
        />
      );
    });
  };

  downloadExcel = async () => {
    this.setState({ loading: true });
    let res;
    try {
      res = await exportTableData(this.props.resid, this.wheres);
    } catch (err) {
      return message.error(err.message);
    }
    downloadFile(
      window.powerWorks.fileDownloadUrl + res.data,
      this.props.tableTitle + '.xls'
    );
    this.setState({ loading: false });
  };

  openProductComponent = componentInfo => {
    this.setState({
      proModalVisible: true,
      proComponentInfo: componentInfo
    });
  };

  closeAdvSearch = () => {
    this.setState({ advSearchVisible: false });
  };

  onCloseLzModal = () => {
    this.setState({ unitModalVisible: false, proModalVisible: false });
  };

  renderUnitComponent = () => {
    const { unitModalVisible, record, unitBtnInfo } = this.state;

    switch (unitBtnInfo.name) {
      case 'LzMenuForms': {
        return (
          <Fragment>
            {unitModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzMenuForms record={record} {...unitBtnInfo.props} />
              </LzModal>
            )}
          </Fragment>
        );
      }
    }
  };

  renderProductComponent = () => {
    const { proModalVisible, proComponentInfo } = this.state;
    switch (proComponentInfo.name) {
      case 'LzStepsCTS': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsCTS
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
      case 'LzStepsCes': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsCes
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
      case 'LzStepsAfl': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsAfl
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
      case 'LzStepsSc': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsSc
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
      case 'LzStepsOt': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsOt
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
      case 'LzStepsPi': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsPi
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
      case 'LzStepsMAP': {
        return (
          <Fragment>
            {proModalVisible && (
              <LzModal onClose={this.onCloseLzModal}>
                <LzStepsMAP
                  {...proComponentInfo.props}
                  onClose={() => {
                    this.onCloseLzModal();
                    this.refreshTableData();
                  }}
                />
              </LzModal>
            )}
          </Fragment>
        );
      }
    }
  };

  renderTableTitle = () => {
    return (
      <span style={{ fontSize: 20, fontWeight: 'bold' }}>
        {this.props.tableTitle}
      </span>
    );
  };

  renderDownloadExcelBtn = () => {
    return (
      <IconWithTooltip
        tip="导出数据"
        className="btn"
        iconClass="icon-export"
        onClick={this.downloadExcel}
      />
    );
  };

  renderProductComponentBtns = () => {
    return this.props.productComponents.map(item => (
      <IconWithTooltip
        tip="批量添加"
        key={item.iconClass}
        className="btn"
        iconClass={item.iconClass}
        onClick={() => this.openProductComponent(item.componentInfo)}
      />
    ));
  };

  renderAdvSearchBtn = () => {
    return (
      <IconWithTooltip
        tip="高级搜索"
        className="btn"
        iconClass="icon-adv-search"
        onClick={() => {
          this.setState({
            advSearchVisible: true
          });
        }}
      />
    );
  };

  renderRefreshBtn = () => {
    return (
      <i
        className="btn iconfont icon-refresh"
        onClick={() => this.refreshTableData()}
      />
    );
  };

  renderImportBtn = () => {
    return (
      <Fragment>
        <IconWithTooltip
          tip="导入数据"
          className="btn"
          iconClass="icon-import"
          onClick={() =>
            this.setState({
              importDataModalVisible: !this.state.importDataModalVisible
            })
          }
        />
        {this.state.importDataModalVisible && (
          <LzImportData
            onClose={() => this.setState({ importDataModalVisible: false })}
          />
        )}
      </Fragment>
    );
  };

  /**
   * 打开 Modal 的方式：'fe' 前端按钮打开 | 'be' 后端按钮打开
   */
  openModalWay = 'fe';

  render() {
    const {
      modalFormShow,
      operation,
      record,
      pagination,
      backEndBtnsMultiple,
      formFormData,
      advSearchVisible,
      backendBtnOpenModalFormData,
      loading
    } = this.state;
    const {
      resid,
      btnsVisible,
      tableTitle,
      formViewMode,
      formTabsSubTableProps,
      dataMode,
      subresid,
      modalWidth,
      formLayout,
      advSearchConfig,
      displayMod,
      isUnitVisible,
      lzAdvSearchStyle,
      isSearch,
      addBtn,
      style,
      lzTableHeaderStyle,
      lzTableOpStyle,
      hasDownloadExcel,
      hostrecid,
      advDicTableProps,
      cFFillFormInnerFieldNames,
      isGetFormDefaultValues,
      associatedFields,
      productComponents,
      hasRefresh,
      className,
      hasImportData
    } = this.props;
    const hasLzTableHeader =
      tableTitle ||
      advSearchConfig ||
      Array.isArray(productComponents) ||
      hasRefresh ||
      hasImportData;
    const hasFrontendBtns = addBtn || isSearch;
    const hasBackendBtns = !!backEndBtnsMultiple.length;
    const formData =
      this.openModalWay === 'fe' ? formFormData : backendBtnOpenModalFormData;

    return (
      <div className={classNames('lz-table', className)} style={style}>
        <Spin spinning={loading}>
          {/* 头部 */}
          {hasLzTableHeader && (
            <div className="lz-table-header" style={lzTableHeaderStyle}>
              {!!tableTitle && this.renderTableTitle()}
              {hasDownloadExcel && this.renderDownloadExcelBtn()}
              {productComponents && this.renderProductComponentBtns()}
              {advSearchConfig && this.renderAdvSearchBtn()}
              {hasRefresh && this.renderRefreshBtn()}
              {hasImportData && this.renderImportBtn()}
            </div>
          )}

          {/* 前端按钮栏 */}
          {hasFrontendBtns && (
            <div className="lz-table-op" style={lzTableOpStyle}>
              {addBtn && this.renderAddBtn()}
              {this.props.isSearch && this.renderSearchInput()}
            </div>
          )}

          {/* 后端按钮栏 */}
          {hasBackendBtns && (
            <div className="lz-table-op" style={lzTableOpStyle}>
              {this.renderBackendBtnsMultiple()}
            </div>
          )}

          {/* 渲染内容：表格形式/表单形式/卡片形式 */}
          {this.renderContent()}

          {/* 高级搜索 */}
          {advSearchConfig && (
            <LzAdvSearch
              advSearchConfig={advSearchConfig}
              conditionChange={this.conditionChange}
              advSearchVisible={advSearchVisible}
              onClose={this.closeAdvSearch}
              style={lzAdvSearchStyle}
            />
          )}
          {/* 卡片分页 */}
          {this.props.viewMode === 'cards' && (
            <Pagination
              style={{ textAlign: 'center' }}
              {...pagination}
              onChange={this.cardPageChange}
            />
          )}

          {/* 模态框形式的表单。用于添加、修改、查看 */}
          {modalFormShow && (
            <LzFormModalContainer
              onCancel={() => {
                this.setState({ modalFormShow: false });
              }}
              onConfirm={this.onConfirm}
              resid={resid}
              record={record}
              rowIndex={this.state.selectedRowIndex}
              formFormName={this.getFormFormName()}
              operation={operation}
              formTabsSubTableProps={formTabsSubTableProps}
              dataMode={dataMode}
              subresid={subresid}
              modalWidth={modalWidth}
              formLayout={formLayout}
              formFormData={formData}
              displayMod={displayMod}
              isUnitVisible={isUnitVisible}
              hostrecid={hostrecid}
              advDicTableProps={advDicTableProps}
              visible={modalFormShow}
              cFFillFormInnerFieldNames={cFFillFormInnerFieldNames}
              isGetFormDefaultValues={isGetFormDefaultValues}
              associatedFields={associatedFields}
            />
          )}

          {/* 渲染单元组件 */}
          {this.renderUnitComponent()}

          {/* 渲染业务组件 */}
          {this.renderProductComponent()}
        </Spin>
      </div>
    );
  }
}
// export default Form.create({})(LzTable);
export default LzTable;
