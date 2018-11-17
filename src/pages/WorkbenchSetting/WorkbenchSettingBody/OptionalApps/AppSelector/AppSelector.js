import React from 'react';
import { getAllOptionalApps, addWorkbenchApps } from '../../../../../util/api';
import { Spin } from 'antd';
import SearchBox from '../../../../components/SearchBox';
import OptionalApp from './OptionalApp';
import { Modal, Button } from 'antd';
import './AppSelector.css';

export default class AppSelector extends React.PureComponent {
  static fullScreenStyle = {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
  };

  static halfScreenStyle = {
    width: '55%',
    height: '70%',
    top: '5%',
    left: '20%'
  };

  static defaultProps = {
    isOpen: false,
    onClose: () => {},
    onConfirmSelection: () => {}
  };

  state = {
    isFullScreen: false,
    loading: true,
    apps: [],
    searchText: ''
  };

  selectedAppsId = [];

  componentDidMount() {
    this.loadOptionalApps();
  }

  handleSearchBoxChange = value => {
    this.setState({
      searchText: value
    });
  };

  handleOptionalAppChange = ({ value, checked }) => {
    if (checked) {
      this.selectedAppsId.push(value);
    } else {
      this.selectedAppsId = this.selectedAppsId.filter(id => id !== value);
    }
  };

  confirmSelection = () => {
    this.addApps();
    this.props.onClose();
  };

  loadOptionalApps = async () => {
    try {
      const getApps = getAllOptionalApps();
      const appsRes = await getApps;

      if (!appsRes.error) {
        this.setState({
          loading: false,
          apps: appsRes.data
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  addApps = async () => {
    const payload = {
      resid: 582414136652,
      data: this.selectedAppsId.map(id => ({ ResID: parseInt(id, 10) }))
    };
    try {
      const addAppsRes = await addWorkbenchApps(payload);

      if (!addAppsRes.error) {
        this.props.onConfirmSelection();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  toggleFullScreen = () => {
    this.setState({ isFullScreen: !this.state.isFullScreen });
  };

  render() {
    const { isOpen, onClose } = this.props;
    const { isFullScreen, apps, loading, searchText } = this.state;

    const sizeStyle = isFullScreen
      ? AppSelector.fullScreenStyle
      : AppSelector.halfScreenStyle;
    const searchedApps = apps.filter(app => app.RES_NAME.includes(searchText));

    return (
      <Modal
        visible={isOpen}
        className="lz-app-selector"
        footer={
          <Button type="primary" block onClick={this.confirmSelection}>
            确定
          </Button>
        }
        onCancel={() => {
          onClose();
        }}
        destroyOnClose={true}
        title={
          <div className="header">
            {/* <img
              className="scale-btn"
              src={isFullScreen ? outFullScreenIcon : fullScreenIcon}
              alt=""
              onClick={this.toggleFullScreen}
            /> */}
            <span className="title">可选功能</span>
          </div>
        }
      >
        <div className="content">
          <div className="workbench-setting-app-selector-apps">
            <Spin spinning={loading}>
              {searchedApps.map((app, idx) => (
                <OptionalApp
                  key={app.RES_ID || idx}
                  appData={app}
                  onChange={this.handleOptionalAppChange}
                />
              ))}
            </Spin>
          </div>

          <div className="workbench-setting-app-selector-search-box">
            <SearchBox
              iconPosition={'right'}
              style={{ borderRadius: 0, border: 'solid #ccc thin' }}
              onChange={this.handleSearchBoxChange}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
