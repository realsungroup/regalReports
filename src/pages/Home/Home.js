import React from 'react';
import HomeHeader from './HomeHeader';
import HomeBody from './HomeBody';
import HomeAppShortcuts from './HomeAppShortcuts';

export default class Home extends React.Component {
  render() {
    return (
      <div className="home">
        <HomeBody />
        <HomeAppShortcuts />
      </div>
    );
  }
}
