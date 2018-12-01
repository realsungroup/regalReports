import appConfig, { dataType } from '../util/http.config';
import http, { dealNextExtractData } from '../util/http';

const { path } = appConfig;
const { baseUrl8055, baseUrlEnterprise } = path;
const baseUrl = window.baseUrl;
const GET = 'GET';
const POST = 'POST';

// 任务与通知页面特定的 api ======================
// ==

// 获取模板定义数据
export const getModuleDefineData = () => {
  const url = baseUrl + appConfig.path.getDataV2;
  const params = {
    resid: 577032812754,
    subresid: '577032828607,577049496791',
    cmscolumns:
      'taskTmpId,taskTmpName,mainHeadResid,mainHeadFormName,followOperationsResid,tabCount,Attach1Filename,Attach2Filename,Attach3Filename,Attach4Filename,Attach5Filename,showPrint,showControl,subResids,taskComponent,taskComponentId',
    subcmscolumns:
      'tabDefineId,taskTmpId,tabOrder,dataSourceType,dataSourceResid,dataSourceForm,componentid,path,componentname,componenttype,tabTitle'
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 获取某个任务的业务数据
export const getTaskData = (hostResid, hostRecid) => {
  const url = baseUrl + appConfig.path.getDataV2;
  const params = {
    resid: hostResid,
    cmswhere: `REC_ID=${hostRecid}`
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// ======================

// 默认登录
export const defaultLogin = async (code, password) => {
  let url = baseUrl + path.login;
  const params = {
    Code: code,
    Password: password
  };
  return http(url, POST, params, dataType.LoginDefaultEM);
};

/**
 * 导出表格数据
 * @param {number} resid 表资源id
 * @param {string} cmswhere 查询条件
 * @param {string} filetype 导出文件格式（默认 xls）
 */
export const exportTableData = (resid, cmswhere, filetype = 'xls') => {
  const url = baseUrl + 'api/100/table/ExportTableData';
  const params = {
    resid,
    cmswhere,
    filetype
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 域登录
export const domainLogin = async (code, password, domain, domainUserField) => {
  let url = window.domainLogin.baseUrl + path.login;
  const params = {
    code,
    password,
    loginMethod: 'domain',
    domain,
    domainUserField
  };
  return http(url, POST, params, dataType.UnKnow);
};

// 处理按钮操作
export const dealButton = (resid, recids, strCommand) => {
  const url = baseUrl + appConfig.path.dealButton;
  const params = {
    resid,
    recids,
    strCommand
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 获取表的自定义按钮
export const getButtons = resid => {
  const url = baseUrl + appConfig.path.getButton;
  const params = {
    resid
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 在添加记录之前使用计算公式获取将要添加的记录
export const beforeSaveAdd = (resid, data) => {
  const url = baseUrl + appConfig.path.beforeSave;
  const params = {
    resid,
    data,
    rp: { EnableFormulaVerify: 'false', EnableBitianCheck: false }
  };
  return dealNextExtractData(
    http(url, POST, params, dataType.BeforeAddOneData)
  );
};

// 在修改记录之前使用计算公式获取将要修改的记录
export const beforeSaveMod = (resid, data) => {
  const url = baseUrl + appConfig.path.beforeSave;
  const params = {
    resid,
    data,
    rp: { EnableFormulaVerify: 'false', EnableBitianCheck: false }
  };
  return dealNextExtractData(
    http(url, POST, params, dataType.BeforeFixOneData)
  );
};

// 添加记录
export const addRecord = (resid, data) => {
  const url = baseUrl + appConfig.path.saveData;
  const params = {
    resid,
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.AddOneDataEM));
};

// 修改记录
export const modRecord = (resid, data) => {
  const url = baseUrl + appConfig.path.saveData;
  const params = {
    resid,
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.FixOneDataEM));
};

// 获取数据
export const getTableData = resid => {
  const url = baseUrl + path.getData;
  const params = {
    resid
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取窗体设计数据
export const getFormData = (resid, formName) => {
  const url = baseUrl + appConfig.path.getFormDefine;
  const params = {
    resid: resid, //id
    formname: formName //窗体名
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取所有可选的功能
export const getAllAppLinks = parentresids => {
  const url = baseUrl + path.getAllAppLinks;
  const params = {
    parentresids,
    getresourcedata: 0
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取用户当前应用（必要功能和已选功能）
export const getUserDesktop = () => {
  const url = baseUrl + path.getUserDesktop;
  const params = {};
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取所有可选应用
export const getAllOptionalApps = page => {
  const url = baseUrl + path.getAllOptionalApps;
  const params = {
    parentresid: 582415453008,
    getresourcedata: 1
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 添加工作台应用（多个）
export const addWorkbenchApps = payload => {
  const url = baseUrl + path.saveData;
  return dealNextExtractData(http(url, POST, payload, dataType.AddMultiDataEM));
};

// 删除工作台应用（一个）
export const removeWorkbenchApps = payload => {
  const url = baseUrl + path.saveData;
  return dealNextExtractData(
    http(url, POST, payload, dataType.DeleteOneDataEM)
  );
};

// 删除工作台应用（多个）
export const removeFns = payload => {
  const url = baseUrl + path.saveData;
  return dealNextExtractData(
    http(url, POST, payload, dataType.DeleteMultiDataEM)
  );
};

// 获取待处理数据和历史记录数据
export const getTasks = (resid, cmswhere, pageindex = 0, pagesize = 0, key) => {
  const url = baseUrl + path.getData;
  const params = {
    resid,
    cmswhere,
    pageindex,
    pagesize
  };

  if (key) {
    params.key = key;
  }

  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取模板组件的配置信息
export const getModuleComponentConfig = (resid, cmswhere) => {
  const url = baseUrl + path.getData;
  const params = {
    resid,
    cmswhere
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

//清除缓存
export const clearCache = () => {
  const url = baseUrl + path.clearCache;
  const params = {};
  return http(url, GET, params, dataType.HostTableDataEM);
};

// 获取主表数据
export const getMainTableData = (resid, options = {}) => {
  const url = baseUrl + appConfig.path.getData;
  const params = {
    resid,
    getcolumninfo: 1,
    cmswhere: options.cmswhere ? options.cmswhere : '',
    key: options.key ? options.key : '',
    pageindex: options.current ? options.current : 0,
    pagesize: options.pageSize ? options.pageSize : 0,
    cmscolumns: options.cmscolumns ? options.cmscolumns : '',
    sortOrder: options.sortOrder ? options.sortOrder : '',
    sortField: options.sortField ? options.sortField : ''
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取 "表格" 数据
export const getProcedure = (
  resid,
  procedure,
  paranames,
  paratypes,
  paravalues,
  pageindex,
  pagesize
) => {
  const url = baseUrl + 'api/200/table/RetrieveProcedure';
  const params = {
    resid,
    procedure,
    paranames,
    paratypes,
    paravalues,
    pageindex,
    pagesize
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
};

// 获取子表数据
export const getSubTableData = (resid, subresid, hostrecid, options = {}) => {
  const url = baseUrl + appConfig.path.getSubData;
  const params = {
    resid,
    subresid,
    hostrecid,
    getcolumninfo: 1,
    cmswhere: options.cmswhere ? options.cmswhere : '',
    key: options.key ? options.key : '',
    pageindex: options.current ? options.current : 0,
    pagesize: options.pageSize ? options.pageSize : 0,
    cmscolumns: options.cmscolumns ? options.cmscolumns : '',
    sortOrder: options.sortOrder ? options.sortOrder : '',
    sortField: options.sortField ? options.sortField : ''
  };
  return dealNextExtractData(
    http(url, GET, params, dataType.AttachTableDataEM)
  );
};

// 添加记录
export const addRecords = (resid, data, uniquecolumns) => {
  const url = baseUrl + appConfig.path.saveData;
  const params = {
    resid,
    data,
    uniquecolumns
  };
  return dealNextExtractData(http(url, POST, params, dataType.AddMultiDataEM));
};

// 保存（添加）多条记录
export const saveMultipleRecord = data => {
  const url = baseUrl + appConfig.path.saveMultipleData;
  const params = {
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.UnKnow));
};

// 删除行
export const delRow = (resid, recid) => {
  const url = baseUrl + appConfig.path.saveData;
  const params = {
    resid,
    data: {
      REC_ID: recid
    }
  };
  return dealNextExtractData(http(url, POST, params, dataType.DeleteOneDataEM));
};

// 设置主题色
export const setThemeColor = color => {
  const url = baseUrl + 'api/Account/SaveUserTheme';
  const params = {
    color
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 设置语言
export const setLanguage = language => {
  const url = baseUrl + 'api/Account/SaveUserLanguage';
  const params = {
    language
  };
  return http(url, GET, params, dataType.UnKnow);
};

// 获取对应资源的导入配置信息
export const getImportConfigs = resid => {
  const url = baseUrl + 'api/Resource/GetImportConfigs';
  const params = {
    resid
  };
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 导入数据服务
 * @param {string} type 数据服务类型：'GetImportStatus' 获取实时状态；'PauseImport' 暂停；'ResumeImport' 恢复；'TerminateImport' 终止
 */
export const importingService = (taskId, type) => {
  const url = baseUrl + 'api/Resource/ImportingService';
  const params = {
    ImportTaskID: taskId,
    cmd: type
  };
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 获取报表组
 */
export const getRptGroups = () => {
  const url = baseUrl + 'api/Resource/GetRptGroups';
  const params = {};
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

/**
 * 获取报表组列表项
 * @param {string} groupId 报表组 id
 */
export const getReportList = groupId => {
  const url = baseUrl + 'api/Resource/GetReportList';
  const params = {
    groupid: groupId
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 导入文件
export const importFile = (resid, cfgid, srctype, file) => {
  const upUrlStr =
    baseUrl +
    `api/Resource/ImportFileByConfig?resid=${resid}&cfgid=${cfgid}&srctype=xls`;
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return new Promise((resolve, reject) => {
    let fd = new FormData();
    fd.append('file', file, file.name);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', upUrlStr);
    xhr.setRequestHeader('accessToken', userInfo.AccessToken);
    xhr.setRequestHeader('usercode', userInfo.UserCode);
    xhr.onload = () => {
      var data = JSON.parse(xhr.response);
      if (xhr.status === 200) {
        resolve(data);
      } else {
        reject(data);
      }
    };
    xhr.send(fd);
  });
};

// 上传文件
export const uploadFile = file => {
  return new Promise((resolve, reject) => {
    let upUrlStr =
      path.uploadFileUrl +
      '?savepath=c:\\web\\web\\rispweb\\upfiles&httppath=' +
      path.httppath;

    let fd = new FormData();
    fd.append('file', file, file.name);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', upUrlStr);
    xhr.onload = () => {
      var data = JSON.parse(xhr.response);
      if (xhr.status === 200) {
        var imgUrl = data.httpfilename;
        resolve(imgUrl);
      } else {
        reject(data);
      }
    };
    xhr.send(fd);
  });
};

// 定制的 api
// =========

/**
 * 获取数据看板数据
 * @param {string} boardtype 看板类型
 */
export const getDataDashboardData = boardtype => {
  const url = baseUrl + 'api/200/Attendance/GetDashBoard';
  const params = {
    boardtype
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 验证
export const CheckOTApplication = (resid, data) => {
  const url = baseUrl + 'api/200/Attendance/CheckOTApplication';
  const params = {
    resid,
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.AddMultiDataEM));
};

/**
 * 获取个人日历
 * @param {number} pnid 人员编号
 * @param {string} startDate 开始日期；如：2018-10-1
 * @param {string} endDate 结束日期；如：2018-10-30
 */
export const getDailyRpt = (pnid, startDate, endDate) => {
  const url = baseUrl + 'api/200/Attendance/GetDailyRpt';
  const params = {
    pnid,
    date1: startDate,
    date2: endDate,
    cmscolumns: 'DATES,C3_375377576828,WORKSTARTTIME,WORKENDTIME'
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

/**
 * 根据班组编号和开始日期以及结束日期获取班组日历
 * @param {number} id 班组编号
 * @param {string} startDate 开始日期；如：2018-10-1
 * @param {string} endDate 结束日期；如：2018-10-30
 */
export const getWorkdayByWorkperiodid = (id, startDate, endDate) => {
  const url = baseUrl + 'api/200/Attendance/GetWorkdayByWorkperiodid';
  const params = {
    Workperiodid: id,
    date1: startDate,
    date2: endDate
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

/**
 * 获取正在进行的日报服务
 */
export const processDailyReportService = () => {
  const url = baseUrl + 'api/200/Attendance/ProcessDailyReportService';
  const params = {
    cmd: 'GetTaskId',
    taskid: '593972621718' // 这个值可以随便填
  };
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 开始数据分析
 */
export const processDailyReportPost = params => {
  const url = baseUrl + 'api/200/Attendance/ProcessDailyReportPost';
  return http(url, POST, params, dataType.UnKnow);
};

/**
 * 获取任务进度
 */
export const getProcessStatus = taskId => {
  const url = baseUrl + 'api/200/Attendance/ProcessDailyReportService';
  const params = {
    cmd: 'GetProcessStatus',
    taskid: taskId
  };
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 终止任务
 */
export const terminateTask = taskId => {
  const url = baseUrl + 'api/200/Attendance/ProcessDailyReportService';
  const params = {
    cmd: 'Terminate',
    taskid: taskId
  };
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 获取提醒数量
 */
export const retrieveReminderNum = () => {
  const url = baseUrl + 'api/Resource/RetrieveReminderNum';
  const params = {};
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

/**
 * 获取提醒页面数据
 */
export const retrieveDataOfHasReminder = () => {
  const url = baseUrl + 'api/Resource/RetrieveDataOfHasReminder';
  const params = {};
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

/**
 * 获取正在进行的任务信息
 */
export const getAutoImportStatus = () => {
  const url = baseUrl + 'api/Resource/GetAutoImportStatus';
  const params = {};
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 获取任务列表
 */
export const retrieveAutoImports = () => {
  const url = baseUrl + 'api/Resource/RetrieveAutoImports';
  const params = {};
  return http(url, GET, params, dataType.UnKnow);
};

/**
 * 处理某个任务
 */
export const runAutoImport = taskId => {
  const url = baseUrl + 'api/Resource/RunAutoImport';
  const params = {
    id: taskId
  };
  return http(url, GET, params, dataType.UnKnow);
};
