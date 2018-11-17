import React from 'react';
import './UnitOne.less';

// 单元组件
import {
  LzCards,
  LzClassifyFieldTabs,
  LzMenuContainer,
  LzTable,
  LzTableChart,
  LzTabs,
  LzNavigate,
  LzFormUnitContainer,
  LzUnitComponentContainer,
  LzMenuForms,
  LzSteps
} from '../../../loadableComponents';

// 定制组件
import {
  LzTabsDataDashboard,
  LzMyCA,
  LzWorkOvertime,
  LzAFFO,
  LzTeamSet,
  LzClassifySet,
  LzDataAnalyse,
  LzDataHandling,
  LzFramework
} from '../../../product-components/att/loadableComponents';

/**
 * 模板组件 UnitOne：只有一个单元组件的模板组件，根据配置信息来调用具体的单元组件
 */
export default class UnitOne extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  back = () => {
    this.props.history.goBack();
  };

  // 渲染单元组件
  renderUnitComponent = (
    unitComponentName,
    props,
    containerStyle,
    containerProps
  ) => {
    switch (unitComponentName) {
      // 通用单元组件
      case 'LzTable': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzTable {...props} />
          </LzUnitComponentContainer>
        );
      }
      case 'LzMenuContainer': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzMenuContainer {...props} />
          </LzUnitComponentContainer>
        );
      }
      case 'LzNavigate': {
        return <LzNavigate {...props} />;
      }
      case 'LzFormUnitContainer': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzFormUnitContainer {...props} />
          </LzUnitComponentContainer>
        );
      }
      case 'LzMenuForms': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzMenuForms {...props} />
          </LzUnitComponentContainer>
        );
      }
      case 'LzSteps': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzSteps {...props} />
          </LzUnitComponentContainer>
        );
      }
      case 'LzTabs': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzTabs {...props} />
          </LzUnitComponentContainer>
        );
      }

      // 定制单元组件
      case 'LzTabsDataDashboard': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzTabsDataDashboard {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzMyCA': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzMyCA {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzWorkOvertime': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzWorkOvertime {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzAFFO': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzAFFO {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzTeamSet': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzTeamSet {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzClassifySet': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzClassifySet {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzDataAnalyse': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzDataAnalyse {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzDataHandling': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzDataHandling {...props} />
          </LzUnitComponentContainer>
        );
      }

      case 'LzFramework': {
        return (
          <LzUnitComponentContainer style={containerStyle} {...containerProps}>
            <LzFramework {...props} />
          </LzUnitComponentContainer>
        );
      }

      default: {
        return (
          <div>配置信息有误，没有名为 “{unitComponentName}” 的单元组件！</div>
        );
      }
    }
  };

  render() {
    const { config } = this.props,
      { name, props } = config.unitComponents,
      { hasBackBtn, title, containerProps, containerStyle } = config;
    return (
      <div className="unit-one">
        <div className="unit-one-header">
          {hasBackBtn && (
            <i className="back-btn iconfont icon-back" onClick={this.back} />
          )}
          <span className="header-title">{title}</span>
        </div>
        {this.renderUnitComponent(name, props, containerStyle, containerProps)}
      </div>
    );
  }
}
