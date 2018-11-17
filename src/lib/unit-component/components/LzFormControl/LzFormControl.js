import React, { Fragment } from 'react';
import moment from 'moment';
import {
  Input,
  Select,
  DatePicker,
  Radio,
  Checkbox,
  TimePicker,
  message,
  Modal,
  Upload,
  Icon,
  Button
} from 'antd';
import PropTypes from 'prop-types';
import { ControlCode, FILESEPARATOR } from 'Util/controls';
import { uploadFile } from '../../../util/api';
import LzAdvDictionary from '../LzAdvDictionary';
import './LzFormControl.less';
import { beforeSaveAdd, beforeSaveMod } from 'Util/api';

const Option = Select.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const Search = Input.Search;

export default class LzFormControl extends React.Component {
  static propTypes = {
    /**
     * 视图状态
     * 可选：'edit' | 'view'
     * 默认：'edit'
     * 描述：'edit' 会显示表单控件，可进行编辑；'view' 直接显示值
     */
    viewStatus: PropTypes.oneOf(['edit', 'view']),

    /**
     * 布局
     * 可选：'default' | 'custom'
     * 默认：'default'
     * 描述：'default'：从上到下默认布局；'custom'：根据后台数据 “绝对定位” 布局
     */
    formLayout: PropTypes.oneOf(['default', 'custom']), // 布局：default | custom

    /**
     * 控件数据
     */
    controlData: PropTypes.object.isRequired,

    /**
     * 控件是否不能使用
     * 可选：true | false
     * 默认：false
     */
    disabled: PropTypes.bool,

    /**
     * 是否显示 label
     * 可选：true | false
     * 默认：false
     */
    isLabelVisible: PropTypes.bool,

    /**
     * 是否在控件后面显示单位
     * 可选：true | false
     * 默认：false
     */
    isUnitVisible: PropTypes.bool,

    /**
     * 视图状态
     * 可选：'edit' | 'view'
     * 默认：'edit'
     * 描述：'edit' 会显示表单控件，可进行编辑；'view' 直接显示值
     */
    viewStatus: PropTypes.oneOf(['edit', 'view']),

    // 调用 api 来使用后端计算公式获取保存数据前的记录的 props
    // ===============================================

    /**
     * 内部字段数组（修改了该数组内的内部字段所对应的控件的值之后，会调用 api 请求后端使用计算公式计算出保存前的记录）
     * 默认：-
     * 例如：['C3_592244738975', 'C3_592244739145']
     */
    cFFillFormInnerFieldNames: PropTypes.array,

    /**
     * 保存表单数据的模式（当有 cFFillFormInnerFieldNames 时，必传）
     * 可选：'add' | 'mod'
     * 默认：'add'
     */
    saveFormMode: function(props, propName, componentName) {
      if (
        props.cFFillFormInnerFieldNames &&
        !['add', 'mod'].includes(props[propName])
      ) {
        return new Error(
          `在 ${componentName} 中，当有 cFFillFormInnerFieldNames 时，${propName} 必传，且值为 'add' 或 'mod'`
        );
      }
    },

    /**
     * 控件所对应表的 id（当有 cFFillFormInnerFieldNames 时，必传）
     * 默认：-
     */
    resid: function(props, propName, componentName) {
      if (
        props.cFFillFormInnerFieldNames &&
        !typeof props[propName] !== 'number'
      ) {
        return new Error(
          `在 ${componentName} 中，当有 cFFillFormInnerFieldNames 时，${propName} 必传，且类型为 number`
        );
      }
    },

    /**
     * 调用 api 获取到保存前的记录之后的回调函数（当有 cFFillFormInnerFieldNames 时，必传）
     * 默认：-
     */
    callCFCb: function(props, propName, componentName) {
      if (
        props.cFFillFormInnerFieldNames &&
        !typeof props[propName] !== 'function'
      ) {
        return new Error(
          `在 ${componentName} 中，当有 cFFillFormInnerFieldNames 时，${propName} 必传，且类型为 function`
        );
      }
    }
  };

  static defaultProps = {
    viewStatus: 'edit',
    formLayout: 'default',
    disabled: false,
    isLabelVisible: false,
    isUnitVisible: false,
    saveFormMode: 'add'
  };

  constructor(props) {
    super(props);
    let value = props.value;
    this.state = {
      value,
      advDicVisible: false, // 高级字典 modal 是否显示
      imgVisible: false // 放大的图片 modal 是否显示
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({ value });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.imgVisible === nextState.imgVisible &&
      this.state.value === nextState.value &&
      this.state.advDicVisible === nextState.advDicVisible &&
      this.props.viewStatus === nextProps.viewStatus
    ) {
      return false;
    }
    return true;
  }

  // 获取日期选择器的默认值
  getDatePickerDefaultValue = dateVal => {
    if (dateVal) {
      return { defaultValue: moment(dateVal), value: moment(dateVal) };
    } else {
      return {};
    }
  };
  // 获取时间选择器的默认值
  getTimePickerDefaultValue = timeVal => {
    if (timeVal) {
      return { defaultValue: moment(timeVal, 'HH:mm') };
    } else {
      return {};
    }
  };

  handleValueChange = e => {
    let value = e;
    this.triggerChange(value);
  };

  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    onChange && onChange(changedValue);
  };

  fileStrToArr = str => {
    let ret;
    if (!str) {
      ret = [];
    } else {
      ret = str.split(FILESEPARATOR);
      ret = ret.map(item => JSON.parse(item));
    }
    return ret;
  };

  imgArrToStr = arr => {
    let ret = [];
    if (Array.isArray(arr)) {
      ret = arr.map(item => JSON.stringify(item)).join(FILESEPARATOR);
    }
    return ret;
  };

  handleRemoveFile = file => {
    const fileList = this.fileStrToArr(this.state.value);
    const renderFiles = fileList.filter(item => !(item.uid === file.uid));
    this.handleValueChange(this.imgArrToStr(renderFiles));
  };

  callCF = async (cFFillFormInnerFieldNames, controlData) => {
    // 1.没有配置内部字段
    // 2.配置的内部字段没有包含本内部字段
    if (
      !cFFillFormInnerFieldNames ||
      !cFFillFormInnerFieldNames.includes(controlData.innerFieldName)
    ) {
      return;
    }
    const { form, saveFormMode, resid, callCFCb, record } = this.props;

    const values = form.getFieldsValue();
    // onBlur 时，调用 api 使用后端计算公式算出记录x
    let res;
    try {
      if (saveFormMode === 'add') {
        res = await beforeSaveAdd(resid, values);
      } else {
        res = await beforeSaveMod(resid, { ...values, REC_ID: record.REC_ID });
      }
    } catch (err) {
      return message.error(err.message);
    }
    callCFCb(res.data);
  };

  // 选择控件
  switchControl = (isCustomLayout, controlData, record, disabled, label) => {
    let { value } = this.state;
    const { viewStatus, readOnly, placeholder, advDicTableProps } = this.props;
    const style = controlData ? controlData.customStyle : {};
    const type = controlData.ColValType;
    const { imgControl } = controlData;

    switch (type) {
      // 输入框
      case ControlCode.Input: {
        if (viewStatus === 'edit') {
          return (
            <Input
              style={this.getControlStyle(isCustomLayout, style)}
              disabled={readOnly}
              value={value}
              onChange={this.handleValueChange}
              placeholder={placeholder}
              onBlur={() =>
                this.callCF(
                  this.props.cFFillFormInnerFieldNames,
                  this.props.controlData
                )
              }
            />
          );
        }
        return (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style)
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 递增
      case ControlCode.IncrementalCoding: {
        if (viewStatus === 'edit') {
          return (
            <Input
              style={this.getControlStyle(isCustomLayout, style)}
              disabled={readOnly}
              value={value}
              onChange={this.handleValueChange}
              placeholder={placeholder}
              onBlur={() =>
                this.callCF(
                  this.props.cFFillFormInnerFieldNames,
                  this.props.controlData
                )
              }
            />
          );
        }
        return (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style)
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 多行输入框
      case ControlCode.LongText: {
        return (
          <TextArea
            rows="8"
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={disabled || viewStatus === 'view'}
            value={value}
            onChange={this.handleValueChange}
          />
        );
      }
      // 日期选择器
      case ControlCode.Date: {
        if (viewStatus === 'view') {
          if (typeof value === 'object' && value) {
            value = value.format('YYYY-MM-DD HH:mm:ss');
          }
        }
        return viewStatus === 'edit' ? (
          <DatePicker
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={disabled}
            {...this.getDatePickerDefaultValue(value)}
            onChange={this.handleValueChange}
          />
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 单选按钮
      case ControlCode.RadioGroup: {
        const options = controlData.DisplayOptions;
        return viewStatus === 'edit' ? (
          <RadioGroup
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={disabled}
            value={value}
            onChange={this.handleValueChange}
          >
            {options.map(radioVal => (
              <Radio key={radioVal} value={radioVal}>
                {radioVal}
              </Radio>
            ))}
          </RadioGroup>
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 下拉框
      case ControlCode.OptionValue: {
        const options = controlData.DisplayOptions;

        const isMultiple = !!controlData.ColParam10;
        if (isMultiple) {
          if (typeof value === 'string' && value) {
            value = value.split(',');
          }
        }
        if (viewStatus && viewStatus === 'view') {
          const obj = options.find(option => option.valueColValue === value);
          if (obj) {
            value = obj.displayColValue;
          }
        }
        return viewStatus === 'edit' ? (
          <Select
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={readOnly}
            {...(value ? { value } : {})}
            onChange={this.handleValueChange}
            {...(isMultiple ? { mode: 'multiple' } : {})}
            onChange={this.handleValueChange}
            className="lz-form-control__select"
          >
            {options.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 下拉框（下拉字典）
      case ControlCode.OptionDictionary: {
        const options = controlData.ListOfColOptions;

        const isMultiple = controlData.ColParam10;
        if (isMultiple) {
          if (typeof value === 'string' && value) {
            value = value.split(',');
          }
        }
        if (viewStatus && viewStatus === 'view') {
          if (isMultiple) {
            const arr = options.map(option => {
              if (value.find(item => item === option.valueColValue)) {
                return option.displayColValue;
              }
            });
            value = arr || [];
            value = value.filter(item => item).join(',');
          }
        }
        return viewStatus === 'edit' ? (
          <Select
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={readOnly}
            {...(value ? { value } : {})}
            onChange={this.handleValueChange}
            {...(isMultiple ? { mode: 'multiple' } : {})}
            onBlur={() =>
              this.callCF(
                this.props.cFFillFormInnerFieldNames,
                this.props.controlData
              )
            }
            className="lz-form-control__select"
          >
            {options.map(option => (
              <Option
                key={option.displayColValue}
                value={option.valueColValue}
                disabled={!option.enabled}
              >
                {option.displayColValue}
              </Option>
            ))}
          </Select>
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 下拉框（下拉部门）
      case ControlCode.OptionDepartment: {
        const options = controlData.DisplayOptions;
        const valueOptions = controlData.ValueOptions;

        return viewStatus === 'edit' ? (
          <Select
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={disabled}
            value={value}
            onChange={this.handleValueChange}
            className="lz-form-control__select"
          >
            {options.map((option, index) => (
              <Option key={valueOptions[index]} value={valueOptions[index]}>
                {option}
              </Option>
            ))}
          </Select>
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 输入框（自动编码）
      case ControlCode.AutoCoding: {
        return viewStatus === 'edit' ? (
          <Input
            style={this.getControlStyle(isCustomLayout, style)}
            disabled={true}
            value={value}
          />
        ) : (
          <div title={value}>{value}</div>
        );
      }
      // 文件（目录文件）
      case ControlCode.DirectoryFile: {
        return viewStatus === 'edit' ? (
          <Input
            className={
              isCustomLayout
                ? 'lz-form-item-absolute lz-form-item-input-file'
                : 'lz-form-item-absolute'
            }
            style={this.getControlStyle(isCustomLayout, style)}
            type="file"
            disabled={disabled}
            defaultValue={value}
            onChange={() => {}}
          />
        ) : (
          <div title={value}>{value}</div>
        );
      }

      // checkbox（是否项）
      case ControlCode.Checkbox: {
        return viewStatus === 'edit' ? (
          <Checkbox
            style={this.getControlStyle(isCustomLayout, style)}
            checked={this.isChecked(value)}
            disabled={disabled}
            onChange={this.handleValueChange}
          />
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 输入框（高级字典）
      case ControlCode.AdvDictionary: {
        const { advDicVisible } = this.state;
        const { getAdvDictionaryVal, retFilterFieldValues } = this.props;
        return viewStatus === 'edit' ? (
          <div style={this.getControlStyle(isCustomLayout, style)}>
            <Search
              onSearch={value => {
                this.setState({ advDicVisible: true });
              }}
              enterButton
              disabled={false}
              value={value}
              onChange={() => {}}
            />
            {advDicVisible && (
              <LzAdvDictionary
                onClose={values => {
                  this.setState({ advDicVisible: false });
                }}
                advDictionatyData={controlData}
                getAdvDictionaryVal={getAdvDictionaryVal}
                retFilterFieldValues={retFilterFieldValues}
                advDicTableProps={advDicTableProps}
              />
            )}
          </div>
        ) : (
          <div
            style={{
              ...this.getControlStyle(isCustomLayout, style),
              ...{ display: 'inline-block', width: 'auto' }
            }}
            title={value}
          >
            {value}
          </div>
        );
      }
      // 日期时间选择器
      case ControlCode.Time: {
        let dateVal = '',
          timeVal = '';
        if (value && typeof value === 'string') {
          const arr = value.split('T');
          dateVal = arr[0];
          timeVal = arr[1];
        }
        return viewStatus === 'edit' ? (
          <div style={this.getControlStyle(isCustomLayout, style)}>
            <DatePicker
              disabled={disabled}
              {...this.getDatePickerDefaultValue(value)}
              onChange={this.handleValueChange}
            />
            <TimePicker
              disabled={disabled}
              {...this.getTimePickerDefaultValue(timeVal)}
              onChange={this.handleValueChange}
              format={'HH:mm'}
            />
          </div>
        ) : (
          <div title={value}>{value}</div>
        );
      }
      // 上传图片
      case ControlCode.ImageSelect: {
        const imgStyle = imgControl.customStyle;
        let fileList = this.fileStrToArr(value);
        return viewStatus === 'edit' ? (
          <Fragment>
            <div style={this.getControlStyle(isCustomLayout, style)}>
              <Upload
                accept="image/*"
                listType="picture-card"
                fileList={fileList}
                customRequest={file => this.uploadFile(file, 'img')}
                onRemove={this.handleRemoveFile}
              >
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">Upload</div>
                </div>
              </Upload>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div
              style={this.getControlStyle(isCustomLayout, style)}
              title={value}
              className="lz-form-control-view"
            >
              <Upload listType="picture-card" fileList={fileList} />
            </div>
          </Fragment>
        );
      }
      // 上传文件
      case ControlCode.FileSelect: {
        let fileList = this.fileStrToArr(value);
        return viewStatus === 'edit' ? (
          <Fragment>
            <div style={this.getControlStyle(isCustomLayout, style)}>
              <Upload
                fileList={fileList}
                customRequest={this.uploadFile}
                onRemove={this.handleRemoveFile}
              >
                <Button>
                  <Icon type="upload" /> Upload
                </Button>
              </Upload>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div
              style={this.getControlStyle(isCustomLayout, style)}
              title={value}
              className="lz-form-control-view"
            >
              <Upload fileList={fileList} />
            </div>
          </Fragment>
        );
      }
      // label（自定义布局才有的控件）
      case ControlCode.Label: {
        return (
          <div className="lz-form-item-absolute" style={style}>
            {label}
          </div>
        );
      }
    }
  };

  // 获取日期时间的值
  getDataTimeVal = (defaultValue, val, type) => {
    if (!defaultValue) {
      return val.format('YYYY-MM-DDTHH:mm');
    }
    const defaultValueArr = defaultValue.split('T');
    let valStr;
    if (type === 'date') {
      valStr = val.format('YYYY-MM-DD');
      defaultValueArr[0] = valStr;
    } else if (type === 'time') {
      valStr = val.format('HH:mm');
      defaultValueArr[1] = valStr;
    }
    return defaultValueArr.join('T');
  };

  // 获取控件的样式
  getControlStyle = (isCustomLayout, style) => {
    if (isCustomLayout && style.position === 'absolute') {
      return style;
    } else if (isCustomLayout) {
      style.position = 'absolute';
      return style;
    } else {
      return {
        // width: '88%'
      };
    }
  };

  // checkbox 是否被选中
  isChecked = val => {
    if (!val || val === '0' || val === 0 || val === '否' || val === 'N') {
      return false;
    } else {
      return true;
    }
  };

  /**
   * 上传文件（图片或其他任何图片）
   * @param {object} fileInfo 选择的文件信息
   * @param {string} type 文件类型：'img' 图片类型；undefined 任何文件类型
   */
  uploadFile = fileInfo => {
    const file = fileInfo.file;
    // 为什么不用 async/await：https://github.com/ant-design/ant-design/issues/10122
    uploadFile(file)
      .then(fileUrl => {
        message.success('上传成功');
        const { value } = this.state;
        const newValue = this.fileStrToArr(value);
        const fileItem = {
          uid: newValue.length ? newValue[newValue.length - 1].uid - 1 : -1,
          name: file.name,
          status: 'done',
          url: fileUrl
        };
        let preStr = value + FILESEPARATOR;
        if (!value) {
          preStr = '';
        }
        this.handleValueChange(preStr + JSON.stringify(fileItem));
      })
      .catch(err => {
        console.error(err);
      });
  };

  render() {
    const {
      controlData,
      formLayout, // 控件布局
      disabled, // 控件是否禁止
      record,
      isUnitVisible
    } = this.props;
    if (!controlData) {
      return null;
    }
    const isCustomLayout = formLayout === 'default' ? false : true;
    const { value, imgVisible } = this.state;
    let controlStyle = {};
    if (isUnitVisible && controlData.ColNotes) {
      controlStyle.display = 'flex';
    }
    return (
      <div className="lz-form-control" style={controlStyle}>
        {this.switchControl(
          isCustomLayout,
          controlData,
          record,
          disabled,
          // 不可操作的控件（如 label）label 值在 FrmText 属性上
          controlData.FrmText
        )}
        {isUnitVisible &&
          controlData.ColNotes && (
            <span className="unit">{controlData.ColNotes}</span>
          )}
        <Modal
          title="图片"
          visible={imgVisible}
          footer={null}
          onCancel={() => this.setState({ imgVisible: false })}
          bodyStyle={{ padding: 0 }}
          width={900}
          style={{ top: 10 }}
        >
          <img
            src={value}
            style={{ width: 900 }}
            className="lz-form-control-img"
          />
        </Modal>
      </div>
    );
  }
}
