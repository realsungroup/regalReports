const config = {
  tabPanes: [
    {
      tabName: '班组调整',
      componentInfo: {
        name: 'LzTable',
        props: {
          dataMode: 'sub',
          resid: 593257182832,
          subresid: 593881702082,
          opIsFixed: true,
          addBtn: true,
          isSearch: false,
          pagination: {
            current: 0,
            pageSize: 10
          }
        }
      }
    },
    {
      tabName: '班次调整',
      componentInfo: {
        name: 'LzTable',
        props: {
          dataMode: 'sub',
          resid: 593257182832,
          subresid: 593881721521,
          addBtn: true,
          isSearch: false
        }
      }
    },
    {
      tabName: '加班登记',
      componentInfo: {
        name: 'LzTable',
        props: {
          dataMode: 'sub',
          resid: 593257182832,
          subresid: 593882087991,
          addBtn: true,
          isSearch: false
        }
      }
    },
    {
      tabName: '请假登记',
      componentInfo: {
        name: 'LzTable',
        props: {
          dataMode: 'sub',
          resid: 593257182832,
          subresid: 593882073349,
          addBtn: true,
          isSearch: false
        }
      }
    },
    {
      tabName: '刷卡登记',
      componentInfo: {
        name: 'LzTable',
        props: {
          dataMode: 'sub',
          resid: 593257182832,
          subresid: 593882175202,
          addBtn: true,
          isSearch: false
        }
      }
    }
  ]
};

export default config;
