// 字段的数据类型（ColType）
export const DataType = {
  Bit: 9, // 0 和 1
  Date: 4, // 2018-7-26
  Float: 2, // 小数
  Int32: 3, // 整数
  LongBinary: 6, // 0101010 - 不考虑
  LongText: 5, // string
  Money: 7, // 20.00（两位小数）
  Text: 1, // string
  Time: 8, // 2018-7-26T10:10:10（时分秒）
  Unknown: 0,
  Options: 10 // string
};

// 元素原类型(FrmFieldFormType)
export const FormItemElementEM = {
  Button: 9,
  Checkbox: 12,
  DropDownList: 6,
  DropDownListDict: 19,
  File: 5,
  FileForDirFile: 18,
  FormSelf: 1,
  Image: 4,
  ImageForDirFile: 17,
  ImageForInputform: 15,
  ImageForPageUrl: 13,
  ImageForUrlCol: 16,
  Label: 2,
  Line: 7,
  LinkButton: 10,
  RadioGroup: 11,
  ResTable: 8,
  Textbox: 3,
  TextboxInPrint: 14,
  Unknown: 0
};

// 控件的编号（ColValType）：最终是根据这个来确定前端使用哪个控件
export const ControlCode = {
  AdvDictionary: 8,
  AutoCoding: 2,
  Checkbox: 12,
  CustomizeCoding: 5,
  DirectoryFile: 13,
  IncrementalCoding: 10,
  Input: 0,
  OptionDepartment: 15,
  OptionDictionary: 14,
  OptionResource: 16,
  OptionValue: 1,
  RadioGroup: 11,
  Unknown: -1,
  OptionDictionaryAutoComplete: 17,

  Date: 18,
  Time: 19,
  LongText: 20,
  ImageForUrlCol: 21, // 图片地址 input

  ImageSelect: 22, // 上传图片
  FileSelect: 26, // 上传文件

  ImgCamera: 23, // 相机
  Image: 24, // 图片
  Label: 25 // label
};

// 文件分割符
export const FILESEPARATOR = ';file;';

/**
 * 是否是字符串数组
 * @param {array} arr 数组
 */
const isStringArr = arr => {
  return typeof arr[0] === 'string';
};

/**
 * 上传表单数据前先对表单数据进行处理
 * @param {object} formData 表单数据
 */
export const dealFormData = formData => {
  for (const key in formData) {
    if (typeof formData[key] === 'boolean') {
      formData[key] = formData[key] ? 'Y' : 'N';
    } else if (Array.isArray(formData[key])) {
      if (isStringArr(formData[key])) {
        formData[key] = formData[key].join(',');
      } else {
        formData[key] = formData[key]
          .map(item => JSON.stringify(item))
          .join(FILESEPARATOR); // 文件分隔符：";file;"
      }
    }
  }
};

const numToStr = value => {
  if (typeof value === 'undefined') {
    return '';
  }
  return value + '';
};

/**
 * 获取后台定义的表单规则
 * @param {object} controlData 控件数据
 */
export const getRules = controlData => {
  const rules = [];
  const colType = controlData.ColType,
    colValType = controlData.ColValType;
  let max = controlData.ColSize;
  // 必填项
  if (controlData.ColIsNoNull || controlData.FrmIsNoNull) {
    rules.push({
      required: true,
      message: `请输入${controlData.ColDispName}`
    });
    // 小数精度
    if (controlData.ColFloatPrecision) {
      rules.push({
        transform: numToStr,
        pattern: new RegExp(
          `^(?!0+(?:\\.0+)?$)(?:[1-9]\\d*|0)(?:\\.\\d{1,${Number(
            controlData.ColFloatPrecision
          )}})?$`
        ),
        message: `小数点后最多保留${controlData.ColFloatPrecision}位小数`
      });
    }
    // 整数
    // if (colType === 3) {
    //   rules.push({
    //     pattern: /\d./,
    //     message: '请输入整数'
    //   });
    // }
    // bit
    if (colType === 9) {
      rules.push({
        transform: numToStr,
        type: 'enum',
        enum: ['0', '1'],
        message: `请输入0或1`
      });
    }
  }

  // 日期 | 日期时间 | 长文字 | 下拉框 没有长度限制
  if (
    colType !== 3 &&
    colType !== 4 &&
    colType !== 8 &&
    colType !== 5 &&
    colValType !== 12 &&
    colValType !== 14
  ) {
    rules.push({
      transform: numToStr,
      max,
      message: `长度不能超过${max}个字符`
    });
  }
  return rules;
};

/**
 * 修改控件类型
 */
const modControlType = (canOpControlArr, ImgArr, FileArr, takePictureArr) => {
  canOpControlArr.forEach(canOpControl => {
    const { ColType: dateType, ColValType: controlCode } = canOpControl;
    // 日期时间选择器
    if (dateType === 8 && controlCode === 0) {
      canOpControl.ColValType = ControlCode.Time;
      // 多行文本输入框
    } else if (dateType === 5 && controlCode === 0) {
      canOpControl.ColValType = ControlCode.LongText;
      // 日期选择器
    } else if (dateType === 4 && controlCode === 0) {
      canOpControl.ColValType = ControlCode.Date;
    }
    // 如果是 input 控件
    if (canOpControl.ColValType === ControlCode.Input) {
      // 上传图片控件
      ImgArr.forEach(img => {
        if (
          img.FrmColName &&
          img.FrmColName.indexOf(canOpControl.FrmColName) !== -1
        ) {
          canOpControl.imgControl = img;
          canOpControl.ColValType = ControlCode.ImageSelect;
        }
      });
      // 上传文件控件
      FileArr.forEach(file => {
        if (
          file.FrmColName &&
          file.FrmColName.indexOf(canOpControl.FrmColName) !== -1
        ) {
          canOpControl.fileControl = file;
          canOpControl.ColValType = ControlCode.FileSelect;
        }
      });
    }
  });
  return canOpControlArr;
};

/**
 * 获取文件的对齐方式
 */
const getTextAlign = FrmAlign => {
  if (FrmAlign === 0) {
    return 'left';
  } else if (FrmAlign === 1) {
    return 'right';
  } else if (FrmAlign === 2) {
    return 'center';
  }
};

/**
 * 获取控件自定义的样式
 * @param {object} controlData 控件数据
 */
export function getControlStyle(controlData) {
  if (!controlData) {
    return console.error(
      'controls.js：getControlStyle()，请传入控件数据 controlData!'
    );
  }

  let {
    FrmWidth: width,
    FrmHeight: height,
    FrmFontSize: fontSize,
    FrmLeft: left,
    FrmTop: top,
    FrmAlign
  } = controlData;
  const textAlign = getTextAlign(FrmAlign);
  return {
    width,
    height,
    fontSize,
    left,
    top,
    textAlign,
    lineHeight: height + 'px'
  };
}

/**
 * 给控件数据添加自定义属性：
 * customStyle - 后端自定义样式
 * options - 下拉框选项
 * innerFieldName - 内部字段名
 * isLabelVisible - label 是否显示，默认 true：显示
 * isVisible - 控件是否显示，默认 true：显示
 * @param {array} controlArr 控件数组
 */
export const addPropsToControl = controlArr => {
  controlArr.forEach(newControl => {
    newControl.customStyle = getControlStyle(newControl); // 自定义布局样式
    newControl.options = newControl.ColOptionDictData; // 选项
    newControl.innerFieldName = newControl.ColName; //  内部字段名
    newControl.isLabelVisible = true;
    newControl.isVisible = true;
  });
};

/**
 * 处理后台返回的窗体设计数据
 * @param {array} controlArr [后台返回的窗体设计数据：res.data.columns]
 * @return {object} 返回已处理且已分类的窗体设计数据：
 * {
 *   subTableArr, // 子表控件
 *   allControlArr, // 所有控件
 *   canOpControlArr, // 可操作的控件（如 input）
 *   containerControlArr // 容器控件
 * }
 */
export default function dealControlArr(controlArr) {
  let containerControlArr = [],
    labelControllArr = [],
    canOpControlArr = [],
    ImgArr = [],
    takePictureArr = [],
    subTableArr = [];

  /**
   * 添加属性
   */
  addPropsToControl(controlArr);

  /**
   * 控件筛选
   */

  // 容器控件
  containerControlArr = controlArr.filter(
    item => item.FrmFieldFormType === FormItemElementEM.FormSelf
  );

  // 可操作的控件（非图片、拍照）
  canOpControlArr = controlArr.filter(
    item =>
      item.ColName &&
      item.ColName.length &&
      (item.FrmFieldFormType !== FormItemElementEM.ImageForUrlCol ||
        item.FrmFieldFormType !== FormItemElementEM.ImageForInputform)
  );

  // label
  labelControllArr = controlArr.filter(
    item => item.FrmFieldFormType === FormItemElementEM.Label
  );
  labelControllArr.forEach(labelControll => {
    labelControll.ColValType = ControlCode.Label;
  });

  // 子表控件数据（主要是为了得到子表的 resid，通过 resid 获取子表的名称）
  subTableArr = controlArr.filter(item => item.FrmFieldFormType === 8);
  subTableArr.forEach(item => (item.subResid = parseInt(item.FrmText, 10)));

  // 图片
  ImgArr = controlArr.filter(
    item => item.FrmFieldFormType === FormItemElementEM.ImageForUrlCol
  );
  ImgArr.forEach(img => {
    img.ColValType = ControlCode.Image;
  });

  // 文件
  const FileArr = controlArr.filter(
    item => item.FrmFieldFormType === FormItemElementEM.ImageForDirFile
  );

  // 拍照
  takePictureArr = controlArr.filter(
    item => item.FrmFieldFormType === FormItemElementEM.ImageForInputform
  );

  // 修改 上传图片/上传文件/拍照 的 ColValType 的值
  canOpControlArr = modControlType(
    canOpControlArr,
    ImgArr,
    FileArr,
    takePictureArr
  );

  const allControlArr = [...canOpControlArr, ...labelControllArr];

  allControlArr.forEach(newControl => {
    newControl.customStyle = getControlStyle(newControl);
    newControl.options = newControl.ColOptionDictData;
    newControl.innerFieldName = newControl.ColName; //  内部字段名
  });
  return {
    subTableArr, // 子表控件
    allControlArr, // 所有控件
    canOpControlArr, // 可操作的控件（如 input）
    containerControlArr // 容器控件
  };
}
