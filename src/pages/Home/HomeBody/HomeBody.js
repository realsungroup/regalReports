import React from 'react';
import PageBody from '../../components/PageBody';
import HalfPanel from '../../components/HalfPanel';
import TaskNotice from './TaskNotice';
import Workbench from './Workbench';
import './HomeBody.less';

export default class HomeBody extends React.PureComponent {
  render() {
    return (
      <PageBody>
        <div style={{ textAlign: 'center' }}>
          <HalfPanel
            title="任务栏"
            prefix={<i className="iconfont icon-renwulan" />}
          >
            <TaskNotice />
          </HalfPanel>
          <HalfPanel
            title="工作台"
            prefix={<i className="iconfont icon-gongzuotai" />}
          >
            <Workbench />
          </HalfPanel>
        </div>
      </PageBody>
    );
  }
}
