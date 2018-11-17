// 图表组件配置
const LzTableChart = {
  name: "unitOne",
  unitComponents: {
    name: "LzTableChart",
    props: {
      title: "标题标题",
      keyColumn: "C3_565800625469",
      nameColumn: "C3_565794227485",
      dateColumn: "C3_565793578657"
    }
  }
};
// 表格组件配置
const LzTable = {
  name: "unitOne",
  hasBackBtn: "true",
  title: "班组设置",
  unitComponents: {
    name: "LzTable",
    style: {
      width: "800px",
      height: "600px",
      position: "relative",
      top: "-10px"
    },
    props: {
      resid: 582041594311,
      btnsVisible: {
        del: true
      },
      tableTitle: "TableTitle"
    }
  }
};
// 卡片组件配置

const LzTable = {
  name: "unitOne",
  unitComponents: {
    name: "LzCards",
    props: {
      resid: 579363349407,
      showColumnsInnerFieldName: {
        img: "C3_584906841916",
        title: "C3_577815652032",
        desc: "C3_579362923301"
      }
    }
  }
};

const config = {
  "name": "unitOne",
  "hasBackBtn": "true",
  "title": "班组设置",
  "unitComponents": {
    "name": "LzTable",
    "style": {
      "width": "800px",
      "height": "600px",
      "top": "20px",
      "background": "#fff"
    },
    "props": {
      "resid": 582041594311,
      "btnsVisible": {
        "edit": true,
        "save": true,
        "cancel": true,
        "mod": true,
        "check": true,
        "del": true
      },
      "pagination": {
        "pageSize": 10,
        "current": 0
      },
      "isEditableRow": true,
      "opIsFixed": true,
      "tableTitle": "TableTitle"
    }
  }
};
