import React from 'react';
import headImg from './images/head-img.png';
import './HomeTitle.less';
import { Avatar } from 'antd';

const HomeTitle = ({ userName, userRank, userHeadImg }) => (
  <div className="home-title">
    {/* <img className="home-title-head-img" src={userHeadImg || headImg} alt="" /> */}
    <Avatar icon="user" src={userHeadImg || headImg} />
    <div className="home-title-content">
      <div className="home-title-name">{userName}</div>
      <div className="home-title-rank">{userRank}</div>
    </div>
  </div>
);

export default HomeTitle;
