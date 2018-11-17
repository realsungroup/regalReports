import React from 'react';
import { removeWorkbenchApps } from '../../../../../util/api';
import './SelectedApp.less';

export default class SelectedApp extends React.Component {
  static defaultProps = {
    onRemove: () => {}
  };

  handleRemove = () => {
    this.removeApp();
  };

  removeApp = async () => {
    const {
      appData: { REC_ID, ResID },
      onRemove
    } = this.props;

    const payload = {
      resid: 582414136652,
      data: {
        REC_ID: parseInt(REC_ID, 10)
      }
    };

    try {
      const removeAppRes = await removeWorkbenchApps(payload);
      if (!removeAppRes.error) {
        onRemove(ResID);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  render() {
    const {
      appData: { title, appIconUrl }
    } = this.props;

    return (
      <div className="workbench-setting-selected-app">
        <div className="remove-btn">
          <i
            className="workbench-setting-minus-icon iconfont icon-delete"
            onClick={this.handleRemove}
          />
        </div>
        <div className="workbench-setting-app-wrapper">
          <i
            className={`workbench-setting-app-icon iconfont icon-${appIconUrl ||
              'default-app'}`}
          />
          <div className="workbench-setting-app-title">{title}</div>
        </div>
      </div>
    );
  }
}
