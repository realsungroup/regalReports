import React from 'react'
import { appMode } from '../../../../util/appMode.config'
import Panel from '.././../../components/Panel'
import WorkbenchHeader from './WorkbenchHeader'
import WorkbenchBody from './WorkbenchBody'

export default class Workbench extends React.PureComponent {
  render() {
    return (
      <React.Fragment>
        {appMode.homeWorkBench.withHeader && (
          <Panel>
            <WorkbenchHeader />
          </Panel>
        )}
        <Panel>
          <WorkbenchBody />
        </Panel>
      </React.Fragment>
    )
  }
}
