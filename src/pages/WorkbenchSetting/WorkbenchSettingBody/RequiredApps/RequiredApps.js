import React from 'react';
import Panel from '../../../components/Panel';
import Application from '../../../components/Application';
import './RequiredApps.less';

const RequiredApps = ({ apps }) => (
  <Panel>
    <div className="workbench-setting-required-apps">
      {apps.map((app, idx) => (
        <div key={idx} className="workbench-setting-required-app-wrapper">
          <Application
            appData={app}
            active={false}
            style={{ width: '100%', height: 'auto' }}
            iconStyle={{ width: 'auto' }}
            titleStyle={{ width: '100%', height: 'auto', marginTop: '8px' }}
          />
        </div>
      ))}
    </div>
  </Panel>
);

export default RequiredApps;
