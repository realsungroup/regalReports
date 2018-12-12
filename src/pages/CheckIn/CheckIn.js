import React from 'react';
import { LzTable, LzTableV2 } from '../../loadableComponents';
import { withRouter } from 'react-router-dom';
import { message } from 'antd';
import 'url-search-params-polyfill';

class CheckIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      resid: 0
    };
  }

  componentDidMount = () => {
    let params = new URLSearchParams(window.location.search);

    const userCode = params.get('userCode');
    const accessToken = params.get('accessToken');
    const theme = params.get('theme');
    const title = params.get('title');
    const resid = params.get('resid');

    localStorage.setItem(
      'userInfo',
      JSON.stringify({
        UserCode: userCode,
        AccessToken: accessToken
      })
    );
    if (theme) {
      this.setThemeColor({
        '@primary-color': theme
      });
    }
    this.setState({ name: title, resid: parseInt(resid, 10) });
  };

  setThemeColor = themeColor => {
    setTimeout(() => {
      try {
        window.less
          .modifyVars(themeColor)
          .then(() => {})
          .catch(err => {
            message.error(err.message);
          });
      } catch (err) {
        message.error('设置主题色出错，请刷新页面');
      }
    }, 0);
  };

  render() {
    const { resid } = this.state;
    if (this.state.name === '考勤月报') {
      return (
        <LzTableV2
          resid={595860351148}
          procedure="dbo.Pro_SumOfDailyRecord"
          paranames="@dates1,@dates2,@userid,@key"
          paratypes="string,string,string,string"
          pagination={{
            current: 0,
            pageSize: 10
          }}
          fixedCols={['考勤年月', '姓名']}
          customColumnWidth={{
            
          }}
        />
      );
    }
    return (
      <div>
        <h1>{this.state.name}</h1>
        {resid && (
          <LzTable
            resid={resid}
            pagination={{ current: 0, pageSize: 10 }}
            isSortBE
            hasDownloadExcel
            tableSize="small"
            customColumnWidth={{
              考勤日期: 100,
              工号: 100,
              姓名: 100,
              部门名称: 250,
              一级部门: 100,
              岗位: 100
            }}
            fixedCols={['考勤日期', '姓名']}
            advSearchConfig={{
              containerName: 'drawer', // 高级搜索所在容器的名字：'normal' 在表格里面；'drawer' 在抽屉容器里面
              defaultVisible: false, // 默认是否显示
              drawerWidth: 500, // 抽屉的宽度
              labelWidth: '24%', // label 宽度
              rowWidth: '100%', // row 宽度
              dateRanges: [
                // date
                {
                  title: '考勤日期',
                  visible: [false, false, false, false], // 对应 “今天”、“昨天”、“本周”、“上周” 是否显示
                  innerFieldName: 'DayDate' // 内部字段
                }
              ],
              search: [
                // search
                {
                  title: '工号/姓名',
                  innerFieldNames: ['C3_375380046640', 'C3_375380006609']
                }
              ]
            }}
          />
        )}
      </div>
    );
  }
}

export default withRouter(CheckIn);
