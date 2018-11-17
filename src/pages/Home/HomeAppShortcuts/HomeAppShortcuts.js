import React from 'react'
import Application from '../../components/Application'
import shortcutsEntryIcon from './images/shortcuts-entry.png'
import shortcutsIcon from './images/shortcuts.png'
import appIcon1 from './images/app1.png'
import appIcon2 from './images/app2.png'
import appIcon3 from './images/app3.png'
import appIcon4 from './images/app4.png'
import './HomeAppShortcuts.less'

export default class HomeAppShortcuts extends React.PureComponent {
  state = {
    folded: true,
    apps: [
      { appIconUrl: appIcon1 },
      { appIconUrl: appIcon2 },
      { appIconUrl: appIcon3 },
      { appIconUrl: appIcon4 },
    ],
  }

  openShortcuts = () => {
    this.setState({
      folded: false,
    })
  }

  closeShortcuts = () => {
    this.setState({
      folded: true,
    })
  }

  render() {
    const { folded, apps } = this.state
    const appStyle = {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      padding: '10px',
    }

    const iconWrapperStyle = {
      height: '100%',
      width: '100%',
    }

    const iconStyle = {
      fontSize: 24,
    }

    return folded ? (
      <div className="home-app-shortcuts-entry" onClick={this.openShortcuts}>
        <img className="home-app-shortcuts-entry-icon" src={shortcutsEntryIcon} alt="" />
      </div>
    ) : (
      <div className="home-app-shortcuts" onClick={this.closeShortcuts}>
        <img className="home-app-shortcuts-icon" src={shortcutsIcon} alt="" />
        {apps.map((app, idx) => (
          <div className={`home-app-shortcut-${idx + 1}`} key={idx}>
            <Application
              style={appStyle}
              iconWrapperStyle={iconWrapperStyle}
              iconStyle={iconStyle}
              appData={app}
              withTitle={false}
            />
          </div>
        ))}
      </div>
    )
  }
}
