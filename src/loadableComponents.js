import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'react-fullscreen-loading';

const minLoading = <span>加载中...</span>;

/**
 * 页面组件
 */
export const CheckIn = Loadable({
  loader: () => import('./pages/CheckIn'),
  loading() {
    return <Loading loading={true} />;
  }
});

export const NotFound = Loadable({
  loader: () => import('./pages/NotFound'),
  loading() {
    return <Loading loading={true} />;
  }
});

/**
 * 模板组件
 */
export const UnitOne = Loadable({
  loader: () => import('./lib/module-component/UnitOne'),
  loading() {
    return minLoading;
  }
});

/**
 * 单元组件
 */
export const LzUnitComponentContainer = Loadable({
  loader: () => import('./lib/unit-component/LzUnitComponentContainer'),
  loading() {
    return minLoading;
  }
});

export const LzCards = Loadable({
  loader: () => import('./lib/unit-component/LzCards'),
  loading() {
    return minLoading;
  }
});

export const LzClassifyFieldTabs = Loadable({
  loader: () => import('./lib/unit-component/LzClassifyFieldTabs'),
  loading() {
    return minLoading;
  }
});

export const LzMenuContainer = Loadable({
  loader: () => import('./lib/unit-component/LzMenuContainer'),
  loading() {
    return minLoading;
  }
});

export const LzTable = Loadable({
  loader: () => import('./lib/unit-component/LzTable'),
  loading() {
    return minLoading;
  }
});

export const LzTableChart = Loadable({
  loader: () => import('./lib/unit-component/LzTableChart'),
  loading() {
    return minLoading;
  }
});

export const LzTabs = Loadable({
  loader: () => import('./lib/unit-component/LzTabs'),
  loading() {
    return minLoading;
  }
});

export const LzTableFilter = Loadable({
  loader: () => import('./lib/unit-component/LzTableFilter'),
  loading() {
    return minLoading;
  }
});

export const LzTabsTableFilter = Loadable({
  loader: () => import('./lib/unit-component/LzTabsTableFilter'),
  loading() {
    return minLoading;
  }
});

export const LzNavigate = Loadable({
  loader: () => import('./lib/unit-component/LzNavigate'),
  loading() {
    return minLoading;
  }
});

export const LzFormUnitContainer = Loadable({
  loader: () => import('./lib/unit-component/LzFormUnitContainer'),
  loading() {
    return minLoading;
  }
});

export const LzMenuForms = Loadable({
  loader: () => import('./lib/unit-component/LzMenuForms'),
  loading() {
    return minLoading;
  }
});

export const LzSteps = Loadable({
  loader: () => import('./lib/unit-component/LzSteps'),
  loading() {
    return minLoading;
  }
});

/**
 * 容器组件/通用组件
 */
export const BarModeContainer = Loadable({
  loader: () =>
    import('./lib/unit-component/components/LzForm/BarModeContainer'),
  loading() {
    return minLoading;
  }
});

export const LzForm = Loadable({
  loader: () => import('./lib/unit-component/components/LzForm'),
  loading() {
    return minLoading;
  }
});

export const LzFormControl = Loadable({
  loader: () => import('./lib/unit-component/components/LzFormControl'),
  loading() {
    return minLoading;
  }
});

export const LzFormItem = Loadable({
  loader: () => import('./lib/unit-component/components/LzFormItem'),
  loading() {
    return minLoading;
  }
});

export const LzTree = Loadable({
  loader: () => import('./lib/unit-component/components/LzTree'),
  loading() {
    return minLoading;
  }
});

export const LzCalendar = Loadable({
  loader: () => import('./lib/unit-component/components/LzCalendar'),
  loading() {
    return minLoading;
  }
});

export const LzList = Loadable({
  loader: () => import('./lib/unit-component/components/LzList'),
  loading() {
    return minLoading;
  }
});

export const LzSelectRecords = Loadable({
  loader: () => import('./lib/unit-component/components/LzSelectRecords'),
  loading() {
    return minLoading;
  }
});
