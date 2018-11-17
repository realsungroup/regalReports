import appConfig, { dataType } from '../../util/http.config';
import http, { dealNextExtractData } from '../../util/http';

const { path } = appConfig;
const baseUrl = window.baseUrl;
const GET = 'GET';
const POST = 'POST';

// 获取所有 app links
export const getAllAppLinks = resids => {
  const url = baseUrl + appConfig.path.getAllAppLinks;
  const params = {
    parentresids: resids
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 获取多个应用组功能
export const getGroupApps = resids => {
  const url = baseUrl + 'api/Resource/RetrieveAppGroupByBizTypes';
  const params = {
    bizgroupresids: resids
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
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

// 获取资源信息
export const getResource = id => {
  const url = baseUrl + appConfig.path.getResource;
  const params = {
    id
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
};

// 获取主表数据
export const getMainTableData = (resid, mtsid, options = {}) => {
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
  // 预设查询编号
  if (mtsid) {
    params.lngMtsID = mtsid;
  }
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

// 获取字段定义
export const getColumnsDefine = resid => {
  const url = baseUrl + appConfig.path.getColumnsDefine;
  const params = {
    resid
  };
  return dealNextExtractData(http(url, GET, params, dataType.UnKnow));
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

// 获取记录
export const getRecord = (resid, hostrecid) => {
  const url = baseUrl + appConfig.path.getData;
  const params = {
    resid,
    cmswhere: `REC_ID=${hostrecid}`
  };
  return dealNextExtractData(http(url, GET, params, dataType.HostTableDataEM));
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

// 添加子表记录
export const addSubRecord = (hostresid, hostrecid, resid, data) => {
  const url = baseUrl + appConfig.path.saveData;
  const params = {
    hostresid,
    hostrecid,
    resid,
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.AddOneDataEM));
};

// 修改子表记录
export const modSubRecord = (hostresid, hostrecid, resid, data) => {
  const url = baseUrl + appConfig.path.saveData;
  const params = {
    hostresid,
    hostrecid,
    resid,
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.FixOneDataEM));
};

// 保存（添加）多条记录
export const saveMultipleRecord = data => {
  const url = baseUrl + appConfig.path.saveMultipleData;
  const params = {
    data
  };
  return dealNextExtractData(http(url, POST, params, dataType.UnKnow));
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
