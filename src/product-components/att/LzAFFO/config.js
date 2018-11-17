import moment from 'moment';

// 数据格式化：返回格式化后的值
const timeFormat = value => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
};

const advSearchConfig = {
  containerName: 'drawer', // 高级搜索所在容器的名字：'normal' 在表格里面；'drawer' 在抽屉容器里面
  defaultVisible: false, // 默认是否显示
  drawerWidth: 500, // 抽屉的宽度
  labelWidth: '24%', // label 宽度
  rowWidth: '100%', // row 宽度
  dateRanges: [
    // date
    {
      title: '开始时间',
      visible: [false, false, false, false],
      innerFieldName: 'C3_489231991382'
    },
    {
      title: '填单日期',
      visible: [false, false, false, false],
      innerFieldName: 'C3_489253762403'
    }
  ],
  search: [
    // search
    {
      title: '工号/姓名',
      innerFieldNames: ['C3_489231990680', 'C3_489231990945']
    }
  ]
};

// 申请中
export const inApplication = {
  resid: 593444507094,
  exceptTableInnerHeight: 400,
  addBtn: false,
  isSearch: false,
  hasRefresh: true,
  isBackEndBtnsVisible: true,
  opIsFixed: true,
  pagination: {
    pageSize: 10, // 默认每页数量
    current: 0 // 当前页数
  },
  formTabsSubTableProps: [
    {
      tabName: '加班审批记录',
      componentInfo: {
        name: 'LzTable', // 组件名称
        props: {
          subresid: 593202125987,
          isSearch: false,
          customColumnWidth: {
            审批流编号: 150,
            审批序号: 150,
            审批结果: 150,
            审批人: 150
          }
        }
      }
    }
  ],
  customColRender: [
    {
      innerFieldName: 'C3_593457421602', // 内部字段
      colors: [
        // 列颜色配置
        {
          value: '正常',
          color: ''
        },
        {
          value: '异常',
          color: '#ff0000'
        }
      ]
    },
    {
      innerFieldName: 'C3_489231991382',
      format: timeFormat
    },
    {
      innerFieldName: 'C3_489231991601',
      format: value => {
        // 数据格式化：返回格式化后的值
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  ],
  btnsVisible: {
    check: true
  },

  productComponents: [
    {
      iconClass: 'icon-add',
      componentInfo: {
        name: 'LzStepsMAP',
        props: {
          resid: 593444507094
        }
      }
    }
  ],
  advSearchConfig
};

// 申请异常
export const applyForAbnormal = {
  resid: 593446135928,
  exceptTableInnerHeight: 400,
  addBtn: false,
  isSearch: false,
  opIsFixed: true,
  hasRefresh: true,
  pagination: {
    pageSize: 10, // 默认每页数量
    current: 0 // 当前页数
  },
  btnsVisible: {
    check: true,
    mod: true
  },
  customColumnWidth: {
    check_regvocation: 400,
    get_hours: 400
  },
  advSearchConfig
};

// 已审核
export const approved = {
  resid: 593444653778,
  exceptTableInnerHeight: 400,
  addBtn: false,
  opIsFixed: true,
  isSearch: false,
  hasRefresh: true,
  pagination: {
    pageSize: 10, // 默认每页数量
    current: 0 // 当前页数
  },
  btnsVisible: {
    check: true
  }
};

// 已拒绝
export const refused = {
  resid: 593444682727,
  exceptTableInnerHeight: 400,
  addBtn: false,
  opIsFixed: true,
  isSearch: false,
  hasRefresh: true,
  pagination: {
    pageSize: 10, // 默认每页数量
    current: 0 // 当前页数
  },
  btnsVisible: {
    check: true
  },
  advSearchConfig
};

// 历史记录
export const history = {
  resid: 593446259764,
  exceptTableInnerHeight: 400,
  addBtn: false,
  opIsFixed: true,
  pagination: {
    pageSize: 10, // 默认每页数量
    current: 0 // 当前页数
  },
  isSearch: false,
  hasRefresh: true,
  advSearchConfig
};
