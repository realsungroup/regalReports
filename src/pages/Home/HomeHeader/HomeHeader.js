import React from 'react';
import PageHeader from '../../components/PageHeader';
import SearchBox from '../../components/SearchBox';
import UserInfo from '../../components/UserInfo';
const mockData = {
  userName: '张三三',
  userRank: '医师'
};

export default class HomeHeader extends React.PureComponent {
  render() {
    const searchBox = <SearchBox placeholder="" />;
    const userInfo = (
      <UserInfo userName={mockData.userName} userRank={mockData.userRank} />
    );

    return <PageHeader searchBox={searchBox} title={userInfo} />;
  }
}
