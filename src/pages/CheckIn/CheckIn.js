import React from 'react';
import { LzTable } from '../../loadableComponents';
import { withRouter } from 'react-router-dom';
import { message } from 'antd';

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
    return (
      <div>
        <h1>{this.state.name}</h1>
        {resid && (
          <LzTable
            resid={resid}
            pagination={{ current: 0, pageSize: 10 }}
            isSortBE
            hasDownloadExcel
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
