const appConfig = {
  path: {
    baseUrl: 'http://ivf.dybhealth.com:9001/', // 基地址
    baseUrl8055: 'https://kingofmall.realsun.me:8055/', //付款基地址
    baseUrlEnterprise: 'https://kingofmall.realsun.me:9092/', //企业基地址
    baseUrlValidateCode: 'https://kingofmall.realsun.me/kingofweixin/', //企业短信验证码基地址
    getResource: 'api/resource/Retrieve',
    getWorkbenchApps: 'api/Resource/RetrieveUserDesktop',
    getAllOptionalApps: 'api/Resource/RetrieveUserAppLinks',
    getData: 'api/100/table/Retrieve',
    getDataV2: 'api/200/table/Retrieve',
    changePassword: 'api/user/ChangePassword',
    getPublicData: 'api/100/table/Public/Retrieve',
    getSubData: 'api/100/table/RetrieveRelTableByHostRecord',
    getPublicSubData: 'api/100/table/Public/RetrieveRelTableByHostRecord',
    saveData: 'api/100/table/Save',
    beforeSave: '/api/100/table/RunInnerTableFormulaBeforeSave',
    dinnerOrderPay: 'api/200/Dinner/DinnerOrderPay', //订餐下单并支付定制Api
    batchAuditApplication: 'api/200/Attendance/BatchAuditApplication', //考勤批量审批定制api
    login: 'api/Account/Login',
    getFormDefine: 'api/100/table/RetrieveFormDefine',
    uploadFileUrl:
      'https://finisar.realsun.me:8082/rispweb/rispservice/SvcUploadFile2.aspx', //上传图片地址
    httppath: 'https://finisar.realsun.me:8082/upfiles', //上传图片路径
    getColumnsDefine: 'api/100/table/RetrieveColumnsDefine',
    getColumnsDefineArr: 'api/100/table/RetrieveColumnsDefineByArray',
    clearCache: 'api/100/table/ClearCache',
    getButton: 'api/menu/GetButton',
    dealButton: 'api/menu/DealButton',
    exportXls: 'api/100/table/ExportTableData',
    fileUrl: 'http://kingofdinner.realsun.me:8081/',
    getWXAccessToken: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    payOrder: 'RealsunPay/PayApp',
    recharge: 'RealsunPay/DepositApp2Enterprise',
    payEnterprise: 'RealsunPay/PayByEnterprise',
    registerEnterprise: 'api/Account/Register',
    register: 'api/Account/RegisterBizUser',
    getValidateCode: 'rsauth/SendValidMsg',
    phoneExist: 'api/Account/IsHandphoneExist',
    userExist: 'api/Account/IsUserExist',
    imageHttpsHeader: 'https://kingofmall.realsun.me',
    finisar: 'https://finisar.realsun.me:9092/', // 菲尼萨基地址
    payByOrderNo: 'api/200/Dinner/PayByOrderNo', // 通过订单号支付未支付的餐盘
    saveMultipleData: 'api/200/table/Save', // 保存主表及多张子表记录方法
    getAllAppLinks: 'api/Resource/RetrieveUserAllAppLinks',
    getUserDesktop: 'api/Resource/RetrieveUserDesktop'
  }
};

export default appConfig;

export const dataType = {
  LoginDefaultEM: 'LoginDefaultEM', //默认登陆
  LoginDynamicEM: 'LoginDynamicEM', //动态登陆
  LoginEM: 'LoginEM', //工号登陆
  LoginDefaultDynamicEM: 'LoginDefaultDynamicEM', //默认动态登陆
  LoginWXUnionidEM: 'LoginWXUnionidEM', //微信登陆
  LoginMobileValidateCodeEM: 'LoginMobileValidateCodeEM', //手机验证码登陆
  HostTableDataEM: 'HostTableDataEM', //获取主表数据
  AddOneDataEM: 'AddOneDataEM', //添加数据
  AddMultiDataEM: 'AddMultiDataEM', // 添加多条数据
  AttachTableDataEM: 'AttachTableDataEM', //获取附表数据
  FixOneDataEM: 'FixOneDataEM', //修改一条数据
  FixMoreDataEM: 'FixMoreDataEM', //修改多条数据
  DeleteOneDataEM: 'DeleteOneDataEM', //删除一条数据
  DeleteMultiDataEM: 'DeleteMultiDataEM', // 删除多条数据
  AddMoreAndFixMore: 'AddMoreAndFixMore', //添加和修改多条数据
  EditOrAdd: 'EditOrAdd', //修改或添加一条数据
  
  BeforeAddOneData: 'BeforeAddOneData', // 在添加数据之前
  BeforeFixOneData: 'BeforeFixOneData', // 在修改数据之前

  UnKnow: 'UnKnow' //未知
};
