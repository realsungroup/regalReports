import React from 'react';
import './NotFound.less';
import { Button } from 'antd';
import notFoundImg from '../../assets/404.png';
export default class NotFound extends React.Component {
  render() {
    return (
      <React.Fragment>
        <img src={notFoundImg} alt="" className="not-found-img" />
        <div className="not-found-desc">抱歉，页面不小心迷路了！</div>
        <div className="not-found-en-desc">Page Not Found</div>
        <Button
          className="go-home-btn"
          onClick={() => {
            this.props.history.push('/');
          }}
        >
          返回首页
        </Button>
      </React.Fragment>
    );
  }
}
