import React from 'react';
import { message } from 'antd';
import UnitOne from '../../lib/module-component/UnitOne';
import { getModuleComponentConfig } from '../../util/api';
import merge from 'deepmerge';
import config from './config';

const emptyTarget = value => (Array.isArray(value) ? [] : {});
const clone = (value, options) => merge(emptyTarget(value), value, options);

function combineMerge(target, source, options) {
  const destination = target.slice();

  source.forEach(function(e, i) {
    if (typeof destination[i] === 'undefined') {
      const cloneRequested = options.clone !== false;
      const shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone ? clone(e, options) : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = merge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
}

/**
 * 功能模块页
 */
export default class FnModule extends React.Component {
  constructor(props) {
    super(props);
    const ids = props.match.params.ids.split('-');
    const resId = ids[0];
    const recId = ids[1];
    this.state = {
      resId,
      recId
    };
  }

  state = {
    beConfig: {}, // 后端模板组件配置信息
    isRequest: false // 是否请求了后端配置
  };

  async componentDidMount() {
    this.getConfig();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.url !== this.props.match.url) {
      this.props = nextProps;
      this.getConfig();
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextState !== this.state) {
      return true;
    }
    return false;
  };

  getConfig = async () => {
    const { recId } = this.state;
    let res, record;
    const resid = 459877233554,
      cmswhere = `C3_584903578245 = ${recId}`;
    try {
      res = await getModuleComponentConfig(resid, cmswhere);
    } catch (err) {
      return message.error(err.message);
    }
    let beConfig;
    if (!res.data.length) {
      beConfig = {};
    } else {
      record = res.data[0];
      try {
        beConfig = record.C3_584902392149
          ? JSON.parse(record.C3_584902392149)
          : {};
      } catch (err) {
        beConfig = {};
        message.error('后端 JSON 配置错误');
      }
    }
    this.setState({ beConfig, isRequest: true });
  };

  mergeConfig = () => {
    let { beConfig, resId } = this.state;
    let feConfig;
    if (config[resId] && window[resId]) {
      feConfig = merge(config[resId], window[resId], {
        arrayMerge: combineMerge
      });
    } else {
      if (config[resId]) {
        feConfig = config[resId];
      }
      if (window[resId]) {
        feConfig = window[resId];
      }
    }
    if (!feConfig) {
      feConfig = {};
    }
    return merge(beConfig, feConfig, { arrayMerge: combineMerge });
  };

  // 渲染模板组件
  renderModuleComponent = () => {
    if (!this.state.isRequest) {
      return;
    }
    let newConfig;
    newConfig = this.mergeConfig();
    switch (newConfig.name) {
      case 'unitOne': {
        return (
          <UnitOne key={UnitOne.title} config={newConfig} {...this.props} />
        );
      }
      default: {
        return <div>配置信息有误</div>;
      }
    }
  };

  render() {
    return <React.Fragment>{this.renderModuleComponent()}</React.Fragment>;
  }
}
