import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';

import './LzTableFilter.less';
const Option = Select.Option;
/**
 * 表格过滤组件
 */
export default class LzTableFilter extends React.Component {
  static propTypes = {
    /**
     * 需要过滤的字段配置：可选
     * 默认值：[]
     * 例子：
     * [
     *   {
     *     iconClass: 'icon-wdkq_icon', // 字体图标 class
     *     title: '考勤月份', // 标题
     *     innerFiledName: 'c3_1', // 内部字段名
     *     defaultValue: '201806', // 默认值
     *     options: [ // 选项
     *       {
     *         label: '201806',
     *         value: '201806'
     *       },
     *       {
     *         label: '201807',
     *         value: '201807'
     *       }
     *     ]
     *   }
     * ]
     */
    filterFields: PropTypes.array,

    /**
     * 过滤条件发生改变：可选
     *
     */
    onChange: PropTypes.func
  };
  static defaultProps = {
    filterFields: []
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.collectDefaultFields();
    if (this.props.startGetCmswhere) {
      const cmswhere = this.getCmswhere();
      this.props.onChange(cmswhere);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.startGetCmswhere && !this.props.startGetCmswhere) {
      const cmswhere = this.getCmswhere();
      this.props.onChange(cmswhere);
    }
  }

  // 收集默认（已选择）的条件
  collectDefaultFields = () => {
    const { filterFields } = this.props;

    Array.isArray(filterFields) &&
      filterFields.forEach(filterItem => {
        if (filterItem.defaultValue !== undefined) {
          const filterArr = filterItem.options.filter(
            item =>
              filterItem.defaultValue === item.label ||
              filterItem.defaultValue === item.value
          );
          if (filterArr.length) {
            const { value } = filterArr[0];
            this.selectedFields.push({
              value,
              innerFiledName: filterItem.innerFiledName
            });
          } else {
            const { value } = filterItem.options[0];
            this.selectedFields.push({
              value,
              innerFiledName: filterItem.innerFiledName
            });
          }
        } else {
          const { value } = filterItem.options[0];
          this.selectedFields.push({
            value,
            innerFiledName: filterItem.innerFiledName
          });
        }
      });
  };

  selectedFields = []; // 收集的已选择的字段
  handleChange = (value, innerFiledName) => {
    this.collectSelectedFields(value, innerFiledName);
    const cmswhere = this.getCmswhere();
    this.props.onChange(cmswhere);
  };

  getCmswhere = () => {
    let cmswhere = '';
    const len = this.selectedFields.length;
    this.selectedFields.forEach((selectedField, index) => {
      cmswhere += ` ${selectedField.innerFiledName} = ${selectedField.value} `;
      if (index !== len - 1) {
        cmswhere += ' and ';
      }
    });
    return cmswhere;
  };

  collectSelectedFields = (value, innerFiledName) => {
    const selectedFields = this.selectedFields;
    if (selectedFields.length) {
      const flag = selectedFields.some((item, index) => {
        if (item.innerFiledName === innerFiledName) {
          return selectedFields.splice(index, 1, { value, innerFiledName });
        }
      });
      !flag && selectedFields.push({ value, innerFiledName });
    } else {
      selectedFields.push({ value, innerFiledName });
    }
  };


  render() {
    const { filterFields, onChange, ...props } = this.props;
    return (
      <div className="lz-table-filter" {...props}>
        {filterFields.map(filterItem => {
          return (
            <div className="filter-item" key={filterItem.innerFiledName}>
              <div className={`iconfont ${filterItem.iconClass}`} />
              <div className="select-area">
                <div>{filterItem.title}</div>
                <Select
                  defaultValue={filterItem.defaultValue}
                  style={{ width: 120 }}
                  onChange={value =>
                    this.handleChange(value, filterItem.innerFiledName)
                  }
                >
                  {filterItem.options.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          );
        })}
        
      </div>
    );
  }
}
