import React from 'react';
import Loadable from 'react-loadable';

const minLoading = <span>加载中...</span>;

export const LzSteps = Loadable({
  loader: () => import('./LzSteps'),
  loading() {
    return minLoading;
  }
});

export const LzStepsCTS = Loadable({
  loader: () => import('./LzStepsCTS'),
  loading() {
    return minLoading;
  }
});

export const LzStepsCes = Loadable({
  loader: () => import('./LzStepsCes'),
  loading() {
    return minLoading;
  }
});

export const LzStepsAfl = Loadable({
  loader: () => import('./LzStepsAfl'),
  loading() {
    return minLoading;
  }
});

export const LzStepsSc = Loadable({
  loader: () => import('./LzStepsSc'),
  loading() {
    return minLoading;
  }
});

export const LzStepsOt = Loadable({
  loader: () => import('./LzStepsOt'),
  loading() {
    return minLoading;
  }
});

export const LzStepsPi = Loadable({
  loader: () => import('./LzStepsPi'),
  loading() {
    return minLoading;
  }
});

export const LzStepsMAP = Loadable({
  loader: () => import('./LzStepsMAP'),
  loading() {
    return minLoading;
  }
});

// 定制单元组件
export const LzTabsDataDashboard = Loadable({
  loader: () => import('./LzTabsDataDashboard'),
  loading() {
    return minLoading;
  }
});

export const LzMyCA = Loadable({
  loader: () => import('./LzMyCA'),
  loading() {
    return minLoading;
  }
});

export const LzWorkOvertime = Loadable({
  loader: () => import('./LzWorkOvertime'),
  loading() {
    return minLoading;
  }
});

export const LzAFFO = Loadable({
  loader: () => import('./LzAFFO'),
  loading() {
    return minLoading;
  }
});

export const LzTeamSet = Loadable({
  loader: () => import('./LzTeamSet'),
  loading() {
    return minLoading;
  }
});

export const LzClassifySet = Loadable({
  loader: () => import('./LzClassifySet'),
  loading() {
    return minLoading;
  }
});

export const LzDataAnalyse = Loadable({
  loader: () => import('./LzDataAnalyse'),
  loading() {
    return minLoading;
  }
});

export const LzDataHandling = Loadable({
  loader: () => import('./LzDataHandling'),
  loading() {
    return minLoading;
  }
});

export const LzFramework = Loadable({
  loader: () => import('./LzFramework'),
  loading() {
    return minLoading;
  }
});
