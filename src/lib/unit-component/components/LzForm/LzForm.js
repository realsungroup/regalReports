import React, { Fragment } from 'react';

import { Form, Spin, message, Collapse, Row, Col } from 'antd';
import { getRecord, getResource } from '../../../util/api';
import LzTabs from '../../LzTabs';
import PropTypes from 'prop-types';
import { clone, getItem } from '../../../util/util';
import './LzForm.less';
import cloneDeep from 'lodash.clonedeep';
import classNames from 'classnames';
import BarModeContainer from './BarModeContainer';
import LzFormItem from '../LzFormItem';
import LzRowCols from '../LzRowCols';
import { beforeSaveAdd, beforeSaveMod } from 'Util/api';

const Panel = Collapse.Panel;

class LzForm extends React.Component {
  static propTypes = {
    /**
     * 显示模式
     * 可选值：'default' | 'classify'
     * 默认值：'default'
     * 描述：
     * 'default' 表示默认的不分类显示；
     * 'classify' 表示分类显示（有分类标题；只有在 formLayout 为 'default' 时有效）；后台需要给需要分类的字段中的 “数据分类” 属性赋值
     */
    displayMod: PropTypes.string,

    /**
     * 视图状态
     * 可选：'view' 查看状态 | 'edit' 编辑状态
     * 默认：'view'
     */
    viewStatus: PropTypes.oneOf(['view', 'edit']),

    /**
     * bar 模式配置
     * 默认值：-
     */
    barMode: PropTypes.object,
    // 例如：
    // {
    //   count: 3, // 在 bar 上控件数量（前 5 个）
    //   styles: [{ color: '#fff' }, { color: '#000' }, { color: 'red' }] // 在 bar 上控件的样式
    //   isLableVisible: true, // bar 上的 label 是否显示
    // }

    /**
     * 控件的布局
     * 可选值：'default' | 'custom'
     * 默认值：'default'
     * 描述：'default' 表示从上到下布局；'custom' 表示根据后台数据来绝对定位布局
     */
    formLayout: PropTypes.string,

    /**
     * 列数量
     * 默认：1
     * 可选：n（n >=1）
     */
    colCount: PropTypes.number,

    /**
     * 主表id
     * 可选值：-
     * 默认值：-
     * 描述：主表的 resid（当不传 record 时，需要传此参数）
     */
    resid: PropTypes.number,

    /**
     * 记录id
     * 可选值：-
     * 默认值：-
     * 描述：表的记录 id（当不传 record 时，需要传此参数）
     */
    hostrecid: PropTypes.number, // 记录id

    /**
     * 记录
     * 可选值：-
     * 默认值：-
     * 描述：表的某一条记录数据
     */
    record: PropTypes.object,

    /**
     * LzForm header
     * 可选值：-
     * 默认值：-
     * 描述：header
     */
    header: PropTypes.node,

    /**
     * 表单窗体数据（用于显示不同的控件）
     * 可选值：-
     * 默认值：-
     * 描述：通过 “获取表单定义接口” 获取的 “表单窗体数据” 后经过 control.js 里的 dealControlArr 函数处理后的返回的四种数组数据：
     * const formFormData = { subTableArr, allControlArr, canOpControlArr, containerControlArr }
     */
    formFormData: PropTypes.object,

    /**
     * LzForm 组件样式
     * 可选
     * 默认值：-
     */
    style: PropTypes.object,

    /**
     * 返回 footer 的函数
     * 可选值：-
     * 默认值：-
     * 例如：(form) => { return <div>footer</div> } // form 为 本组件的 this.props.form 对象（https://ant.design/components/form-cn/）
     */
    footer: PropTypes.func,

    /**
     * lz-form-body 的样式
     * 可选
     * 默认值：{}
     */
    bodyStyle: PropTypes.object,

    /**
     * 是否显示单位
     * 可选：true | false
     * 默认：false
     */
    isUnitVisible: PropTypes.bool,

    /**
     * 内部字段数组（修改了该数组内的内部字段所对应的控件的值之后，会调用 api 请求后端使用计算公式计算出保存前的记录）
     * 默认：-
     * 例如：['C3_592244738975', 'C3_592244739145']
     */
    cFFillFormInnerFieldNames: PropTypes.array,

    /**
     * 添加记录时，是否获取表单默认值
     * 可选：true | false
     * 默认：false
     */
    isGetFormDefaultValues: PropTypes.bool,

    /**
     * 被关联字段的显示与隐藏（某个字段的显示与另外一个字段的值有关系）
     * 默认：-
     * 例如：[['C3_592244739145','C3_592306113509'], ['C3_592244739346', 'C3_592306124239']]
     * 注意：在后端需要把关联字段的窗体加在窗体设计中
     */
    associatedFields: PropTypes.array
  };

  static defaultProps = {
    displayMod: 'default',
    formLayout: 'default',
    colCount: 1,
    bodyStyle: {},
    formFormData: {
      subTableArr: [],
      allControlArr: [],
      canOpControlArr: [],
      containerControlArr: []
    },
    viewStatus: 'view',
    isGetFormDefaultValues: false
  };
  constructor(props) {
    super(props);
    const { formTabsSubTableProps, formFormData } = props;

    // 记录
    let record = { REC_ID: 0 };
    if (props.record) {
      record = cloneDeep(props.record);
    }

    // 窗体设计中含有子表
    let lzTabsProps = [];
    if (formFormData.subTableArr.length) {
      lzTabsProps = this.getLzTabsProps(
        cloneDeep(formTabsSubTableProps),
        cloneDeep(formFormData.subTableArr)
      );
    }

    this.state = {
      renderControlArr: [], // 将要渲染的控件数据
      barControlArr: [], // bar 上的控件
      isSpin: true,
      confirmText: {
        // confirm 类型按钮的文案
        add: '添加',
        mod: '保存',
        check: '确定'
      },
      record, // 记录数据
      formData: {}, // 表单数据
      tabPanes: [], // LzTabs 接受的参数
      subTableArr: [], // 子表控件信息
      lzTabsProps // LzTabs 中子表的配置
    };
  }

  getLzTabsProps = (formTabsSubTableProps, subTableArr) => {
    const { resid, record } = this.props;

    const lzTabsProps = formTabsSubTableProps.filter(item => {
      if (
        !!subTableArr.find(
          subTable => subTable.subResid === item.componentInfo.props.subresid
        )
      ) {
        const props = item.componentInfo.props;
        props.dataMode = 'sub';
        props.resid = resid;
        props.hostrecid = record.REC_ID;
        props.operation = this.props.operation;
        return true;
      } else {
        return false;
      }
    });

    return lzTabsProps;
  };

  async componentDidMount() {
    await this.getDataAndRenderView();

    const {
      saveFormMode,
      isGetFormDefaultValues,
      associatedFields
    } = this.props;
    // 添加记录时，取默认值
    if (saveFormMode === 'add' && isGetFormDefaultValues) {
      this.getFormDefaultValues();
    }

    // 如果有关联字段，需要在 50ms 后强制刷新
    setTimeout(() => {
      console.log('force');
      this.forceUpdate();
    }, 100);
  }

  componentWillReceiveProps(nextProps) {
    const { formLayout, displayMod, barMode, formFormData } = nextProps;
    let renderControlArr,
      subTableArr = formFormData.subTableArr;
    if (formLayout === 'custom') {
      renderControlArr = formFormData.allControlArr;
    } else if (formLayout === 'default') {
      renderControlArr = formFormData.canOpControlArr;
    }
    let barControlArr = [];
    if (barMode) {
      barControlArr = renderControlArr.splice(0, barMode.count);
    }

    if (displayMod === 'default') {
      // renderControlArr = this.dealControlArr(renderControlArr);
    } else if (displayMod === 'classify') {
      // 后台要分类
      renderControlArr = this.assortFields(renderControlArr);
    }
    this.setState({ renderControlArr, barControlArr, subTableArr });
  }

  // 添加记录时，取默认值
  getFormDefaultValues = async () => {
    const { renderControlArr } = this.state;
    const { form, resid } = this.props;
    const values = form.getFieldsValue();
    let res;
    try {
      res = await beforeSaveAdd(resid, values);
    } catch (err) {
      return message.error(err.message);
    }
    const record = res.data;
    const formData = {};
    renderControlArr.forEach(controlData => {
      formData[controlData.ColName] = record[controlData.ColName];
    });
    form.setFieldsValue(formData);
  };

  init = () => {
    const { operation, resid, record, hostrecid } = this.props;
    // record 记录没有传过来，且传过来的 operation 为 'mod' 或 'check'，则自己去请求记录的数据
    if (
      typeof record === 'undefined' &&
      (operation === 'mod' || operation === 'check')
    ) {
      // this.setState({ isSpin: false });
      this.getRecord(resid, hostrecid);
    } else if (operation === 'mod' || operation === 'check') {
      // record 传进来了，且传过来的 operation 为 'mod' 或 'check'
      // --
      this.setState({ record: clone(record) }, () => {
        this.getDataAndRenderView();
      });
    } else {
      // add 操作
      // --
      this.getDataAndRenderView();
    }
  };

  // 获取数据和渲染视图
  getDataAndRenderView = async () => {
    const {
      renderControlArr,
      tabPanes,
      barControlArr
    } = await this.getRenderData();
    this.setState({
      renderControlArr,
      barControlArr,
      tabPanes,
      isSpin: false,
      activeKeys: renderControlArr.map((item, index) => index + '')
    });
  };

  // 获取渲染所需要的数据
  getRenderData = async () => {
    const formFormData = clone(this.props.formFormData);
    const {
      renderControlArr,
      subTableArr,
      barControlArr
    } = this.getRenderControlArr(formFormData);
    // 获取 LzTabs 组件所需的参数
    const tabPanes = await this.getTabPanes(subTableArr);
    return { renderControlArr, tabPanes, barControlArr };
  };

  // 获取要渲染的控件数据
  getRenderControlArr = formFormData => {
    const { formLayout, displayMod, barMode } = this.props;
    let renderControlArr,
      subTableArr = formFormData.subTableArr;
    if (formLayout === 'custom') {
      renderControlArr = formFormData.allControlArr;
    } else if (formLayout === 'default') {
      renderControlArr = formFormData.canOpControlArr;
    }
    let barControlArr = [];
    if (barMode) {
      barControlArr = renderControlArr.splice(0, barMode.count);
    }

    if (displayMod === 'default') {
      // renderControlArr = this.dealControlArr(renderControlArr);
    } else if (displayMod === 'classify') {
      // 后台要分类
      renderControlArr = this.assortFields(renderControlArr);
    }
    return { renderControlArr, subTableArr, barControlArr };
  };

  // 处理控件数据
  dealControlArr = canOpControlArr => {
    if (!Array.isArray(canOpControlArr)) {
      return [];
    }
    const { colCount } = this.props;
    let arr = [[]],
      i = 0;
    canOpControlArr.forEach((item, index) => {
      if (index % colCount === 0) {
        i++;
        arr[i] = [];
      }
      arr[i].push(item);
    });
    return arr;
  };

  // 对字段进行分类
  assortFields = controlArr => {
    if (!controlArr || !controlArr.length) {
      return [];
    }
    const filteredControlArr = controlArr.filter(
      control => control.ColResDataSort
    );
    const klasses = [];
    filteredControlArr.forEach(control => {
      let i;
      if (
        !klasses.some((klass, index) => {
          if (klass.title === control.ColResDataSort) {
            i = index;
            return true;
          }
        })
      ) {
        klasses.push({
          title: control.ColResDataSort,
          renderControlArr: [control]
        });
      } else {
        klasses[i].renderControlArr.push(control);
      }
    });
    return klasses;
  };

  // 从 localStorage 中取出表单的窗体设计数据
  getFormData = () => {
    // 取出所有窗体设计数据
    let formsData, name;

    formsData = JSON.parse(getItem('formsData'));
    const formFormData = formsData.formFormData;
    return formFormData;
  };

  // 获取 LzTabs 组件所需的参数
  getTabPanes = async subTableArr => {
    // 窗体设计中没有子表
    if (!subTableArr || (subTableArr && subTableArr.length === 0)) {
      return this.setState({ isSpin: false });
    }
    const { formSubTablesProps } = this.props;
    const subresidArr = [];
    subTableArr.forEach(item => {
      subresidArr.push(Number(item.FrmText));
    });
    const subTablesWithProps = [];
    subresidArr.forEach(item => {
      subTablesWithProps.push({
        subresid: item,
        ...{ formSubTablesProps }
      });
    });

    // 获取子表的表名
    const tabNames = await this.getSubTablesName(subTablesWithProps),
      { operation, resid } = this.props,
      tabPanes = [];
    subTablesWithProps.forEach((subTableProps, index) => {
      const props = clone(subTableProps);
      props.hostrecid = this.state.record.REC_ID;
      props.operation = operation;
      props.resid = resid;
      props.dataMode = 'sub';

      // “查看” LzForm 时，子表的默认配置
      if (operation === 'check') {
        props.startColumnAdd = undefined;
        props.btnsVisible = {
          add: false,
          eidt: false,
          save: false,
          cancel: false,
          mod: false,
          check: false,
          del: false
        };
        // props.rowSelection = null;
      }
      // “修改” | “添加” LzForm 时，子表的默认配置
      if (operation === 'mod' || operation === 'add') {
        props.startColumnAdd = props.startColumnAdd || {
          mode: 'multiple',
          width: 200
        };
        props.btnsVisible = props.btnsVisible || {
          add: false,
          edit: true,
          save: true,
          cancel: true,
          check: false,
          mod: false,
          del: false
        };
        props.editableRow = {
          mode: 'multiple'
        };
      }

      tabPanes.push({
        tabName: tabNames[index],
        componentInfo: {
          name: 'LzTable',
          props
        }
      });
    });
    return tabPanes;
  };

  // 获取子表的表名
  getSubTablesName = async formSubTablesProps => {
    let fns = [],
      resArr;
    const tabNames = [];
    formSubTablesProps.forEach(item => {
      const subresid = item.subresid;
      fns.push(getResource(subresid));
    });
    try {
      resArr = await Promise.all(fns);
    } catch (err) {
      message.error(err.message);
      return [];
    }
    resArr.forEach(res => {
      tabNames.push(res.data.ResName || '无表名');
    });
    return tabNames;
  };

  // 获取记录数据
  getRecord = async (resid, hostrecid) => {
    try {
      const recordData = await getRecord(resid, hostrecid);
      let tmpRecord = {};
      recordData.data &&
        Array.isArray(recordData.data) &&
        recordData.data.forEach(record => {
          if (record.REC_ID === hostrecid) {
            tmpRecord = record;
          }
        });
      this.setState({ record: tmpRecord });
      // 获取窗体数据
      this.getFormData();
    } catch (err) {
      message.error(err.message);
      console.error(err);
    }
  };

  // 获取高级字典中对应的数据
  getAdvDictionaryVal = values => {
    if (!values.length) {
      return;
    }
    const { renderControlArr } = this.state;
    const { setFieldsValue } = this.props.form;
    values = values.filter(item =>
      renderControlArr.some(
        controlData => controlData.innerFieldName === item.innerFieldName
      )
    );
    values.forEach(value => {
      setFieldsValue({
        [value.innerFieldName]: value.value
      });
    });
    message.success('选择成功');
    // 调用后端计算公式
    this.callCF(this.props.cFFillFormInnerFieldNames, values);
  };

  callCF = async (cFFillFormInnerFieldNames, values) => {
    // 1.没有配置内部字段
    // 2.配置的内部字段没有包含已匹配的字段
    if (
      !cFFillFormInnerFieldNames ||
      !cFFillFormInnerFieldNames.some(fieldName =>
        values.some(value => value.innerFieldName === fieldName)
      )
    ) {
      return;
    }
    console.log('callCF');
    const { form, saveFormMode, displayMod, resid, subresid } = this.props;
    const { record } = this.state;
    const formData = form.getFieldsValue();
    const id = displayMod === 'main' ? resid : subresid;
    // 调用 api 使用后端计算公式算出记录
    let res;
    try {
      if (saveFormMode === 'add') {
        res = await beforeSaveAdd(id, formData);
      } else {
        res = await beforeSaveMod(id, {
          ...formData,
          REC_ID: record.REC_ID
        });
      }
    } catch (err) {
      return message.error(err.message);
    }
    this.setFormValues(res.data);
  };

  // 返回高级字典中过滤字段的值
  retFilterFieldValues = innerFieldNames => {
    const { getFieldValue } = this.props.form;
    const colValues = [];
    innerFieldNames.forEach(innerFieldName => {
      colValues.push({
        col1: innerFieldName.col1,
        col1Value: getFieldValue(innerFieldName.col1),
        col2: innerFieldName.col2
      });
    });
    return colValues;
  };

  // 获取表单容器样式
  getContainerStyle = () => {
    const { formLayout } = this.props,
      { containerControlArr } = this.state;
    let containerStyle;
    if (formLayout === 'custom') {
      containerStyle =
        containerControlArr &&
        containerControlArr[0] &&
        containerControlArr[0].customStyle;
    }
    if (containerStyle && formLayout === 'custom') {
      const { width, height } = containerStyle;
      return { width, height };
    }
    return null;
  };

  collapseChange = activeKeys => {
    this.setState({ activeKeys });
  };

  setFormValues = record => {
    const fieldsValue = this.getFieldsValue(record);
    this.props.form.setFieldsValue(fieldsValue);
  };

  getFieldsValue = record => {
    let arr = this.state.renderControlArr;
    const fieldsValue = {};
    // 获取表单中字段与字段值
    // 后台返回的 record 中含有非字段的属性，若不进行筛选，则会：https://github.com/ant-design/ant-design/issues/8880
    // 原因：https://github.com/ant-design/ant-design/issues/8880#issuecomment-390880930）
    // 解决办法：对后台返回的字段进行筛选，筛选出表单中显示的字段
    if (this.props.displayMod === 'classify') {
      arr = [];
      this.state.renderControlArr.forEach(item =>
        arr.push(...item.renderControlArr)
      );
    }
    arr.forEach(controlData => {
      fieldsValue[controlData.ColName] = record[controlData.ColName];
    });
    return fieldsValue;
  };

  // 渲染表单 body 的默认模式（即没有分类）
  renderDefaultMode = () => {
    const {
      formLayout,
      rowIndex,
      isUnitVisible,
      colCount,
      advDicTableProps,
      viewStatus,
      form,
      cFFillFormInnerFieldNames,
      resid,
      saveFormMode,
      associatedFields
    } = this.props;
    const { renderControlArr } = this.state;
    let { record } = this.state;
    const LzFormItemProps = {
      formLayout: formLayout,
      form,
      record,
      getAdvDictionaryVal: this.getAdvDictionaryVal,
      retFilterFieldValues: this.retFilterFieldValues,
      rowIndex,
      viewStatus,
      isUnitVisible,
      saveFormMode,
      cFFillFormInnerFieldNames,
      associatedFields
    };

    return (
      <LzRowCols
        renderData={renderControlArr}
        colCount={colCount}
        keyName="ColDispName"
      >
        {data => {
          return (
            <LzFormItem
              controlData={data}
              {...LzFormItemProps}
              advDicTableProps={advDicTableProps}
              resid={resid}
              callCFCb={this.setFormValues}
            />
          );
        }}
      </LzRowCols>
    );
  };

  renderClassifyMode = () => {
    const {
      viewStatus,
      formLayout,
      rowIndex,
      isUnitVisible,
      colCount,
      resid,
      advDicTableProps,
      cFFillFormInnerFieldNames,
      associatedFields
    } = this.props;
    const { renderControlArr, activeKeys } = this.state;
    let { record } = this.state;

    const LzFormItemProps = {
      formLayout: formLayout,
      form: this.props.form,
      record: record,
      getAdvDictionaryVal: this.getAdvDictionaryVal,
      retFilterFieldValues: this.retFilterFieldValues,
      rowIndex: rowIndex,
      viewStatus,
      isUnitVisible: isUnitVisible,
      cFFillFormInnerFieldNames,
      associatedFields
    };
    return (
      <Collapse activeKey={activeKeys} onChange={this.collapseChange}>
        {!!renderControlArr.length &&
          renderControlArr.map((item, index) => (
            <Panel header={item.title} key={index + ''}>
              <LzRowCols
                renderData={item.renderControlArr}
                colCount={colCount}
                keyName="ColDispName"
              >
                {data => {
                  return (
                    <LzFormItem
                      controlData={data}
                      {...LzFormItemProps}
                      advDicTableProps={advDicTableProps}
                      resid={resid}
                      callCFCb={this.setFormValues}
                    />
                  );
                }}
              </LzRowCols>
            </Panel>
          ))}
      </Collapse>
    );
    // return (
    //   <Collapse activeKey={activeKeys} onChange={this.collapseChange}>
    //     {!!renderControlArr.length &&
    //       renderControlArr.map((item, index) => (
    //         <Panel header={item.title} key={index + ''}>
    //           {item.renderControlArr.map((controlData, index) => (
    //             <LzFormItem
    //               key={controlData.FrmColResID + index}
    //               controlData={controlData}
    //               {...LzFormItemProps}
    //             />
    //           ))}
    //         </Panel>
    //       ))}
    //   </Collapse>
    // );
  };

  renderFormBody = () => {
    const { displayMod } = this.props;

    switch (displayMod) {
      case 'default': {
        return this.renderDefaultMode();
      }
      case 'classify': {
        return this.renderClassifyMode();
      }
    }
  };

  render() {
    const {
      header,
      formLayout,
      formSubTablesProps,
      style,
      footer,
      bodyStyle,
      barMode,
      form,
      viewStatus,
      isUnitVisible,
      associatedFields
    } = this.props;
    const {
      tabPanes,
      barControlArr,
      record,
      renderControlArr,
      lzTabsProps
    } = this.state;

    // 当配置了被关联字段和关联字段时
    // 直接修改 this.state.renderControlArr 数据是没问题的
    if (associatedFields) {
      renderControlArr.forEach(controlData => {
        let arr;
        // 隐藏关联字段的控件
        if (
          associatedFields.find(item => item[1] === controlData.innerFieldName)
        ) {
          controlData.isVisible = false;
          // 被关联字段的显示与隐藏由关联字段的值决定（关联字段值为 1 时，被关联字段显示；否则隐藏）
        } else if (
          (arr = associatedFields.find(
            item => item[0] === controlData.innerFieldName
          ))
        ) {
          if (form.getFieldValue(arr[1])) {
            controlData.isVisible = true;
          } else {
            controlData.isVisible = false;
          }
        }
      });
    }

    const hasSubTalbe = Array.isArray(this.props.formTabsSubTableProps);
    return (
      <div className="lz-form">
        <Form
          hideRequiredMark={true}
          className="lz-form__form-wrap"
          style={style}
        >
          {/* header */}
          {header && <div className="lz-form-header">{header}</div>}

          {/* body */}
          <div className="lz-form-body" style={bodyStyle}>
            {/* lzForm 中的表单 */}
            <div
              className={classNames({
                'lz-form-body__form': !hasSubTalbe,
                'lz-form-body__left-form': hasSubTalbe
              })}
              style={this.getContainerStyle()}
            >
              {barMode ? (
                <BarModeContainer
                  formLayout={formLayout}
                  form={form}
                  record={record}
                  getAdvDictionaryVal={this.getAdvDictionaryVal}
                  retFilterFieldValues={this.retFilterFieldValues}
                  isUnitVisible={isUnitVisible}
                  isLableVisible={barMode && barMode.isLabelVisible}
                  barControlArr={barControlArr}
                  viewStatus={viewStatus}
                  styles={barMode && barMode.styles}
                >
                  {this.renderFormBody()}
                </BarModeContainer>
              ) : (
                this.renderFormBody()
              )}
            </div>
            {/* lzForm 中的子表 */}
            {hasSubTalbe && (
              <div className="lz-form__subtable-wrap">
                <LzTabs ref="lzTabs" tabPanes={lzTabsProps} />
              </div>
            )}
          </div>

          {/* footer */}
          {footer ? (
            <div className="lz-form-footer">
              {footer(this.props.form, this.refs.lzTabs, this.state.record)}
            </div>
          ) : null}
        </Form>
      </div>
    );
  }
}
export default Form.create({})(LzForm);
