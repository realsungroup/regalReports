import React, { Fragment } from 'react';
import {
  message,
  Input,
  DatePicker,
  Table,
  Button,
  Switch,
  Drawer
} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import { clone } from '../../../util/util';
import classNames from 'classnames';
import './LzAdvSearch.less';
import cloneDeep from 'lodash.clonedeep';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const dateInfo = [
  // 时间范围
  {
    label: '今天',
    visible: true,
    isSelected: false,
    min: moment().format('YYYY-MM-DD'),
    max: moment().format('YYYY-MM-DD')
  },
  {
    label: '昨天',
    visible: true,
    isSelected: false,
    min: moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
    max: moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD')
  },
  {
    label: '本周',
    visible: true,
    isSelected: false,
    min: moment()
      .startOf('week')
      .format('YYYY-MM-DD'),
    max: moment()
      .endOf('week')
      .format('YYYY-MM-DD')
  },
  {
    label: '上周',
    visible: true,
    isSelected: false,
    min: moment()
      .startOf('week')
      .subtract(1, 'days')
      .startOf('week')
      .format('YYYY-MM-DD'),
    max: moment()
      .startOf('week')
      .subtract(1, 'days')
      .format('YYYY-MM-DD')
  }
];

/**
 * 用于表格高级搜索的组件
 */
export default class LzAdvSearch extends React.Component {
  static propTypes = {
    /**
     * 高级搜索配置
     * 默认：-
     */
    advSearchConfig: PropTypes.object,

    conditionChange: PropTypes.func,

    /**
     * 高级搜索是否显示
     */
    advSearchVisible: PropTypes.bool
  };
  static defaultProps = {
    advSearchVisible: false
  };
  constructor(props) {
    super(props);
    const dateRanges = this.getDateRanges();
    const tagsConfig = this.getTagsConfig();
    const searchConfig = this.getSearchConfig();
    const whetherConfig = this.getWhetherConfig();
    const {
      containerName,
      labelWidth,
      rowWidth,
      drawerWidth
    } = props.advSearchConfig;
    const { advSearchVisible } = props;
    this.state = {
      dateRanges, // date
      tagsConfig, // tag
      searchConfig, // search
      whetherConfig, // whether
      searchValue: '',
      containerName, // 容器名称
      advSearchVisible, // 高级搜索是否显示
      labelWidth: labelWidth ? labelWidth : '20%', // label 宽度，默认 20%
      rowWidth: rowWidth ? rowWidth : '100%', // 行 宽度，默认 100%
      drawerWidth: drawerWidth ? drawerWidth : 500 // 抽屉的宽度，默认 500px
    };
  }

  componentDidMount() {}

  whetherConfig = [];
  getWhetherConfig = () => {
    if (!this.props.advSearchConfig || !this.props.advSearchConfig.whether) {
      return [];
    }
    let { whether } = this.props.advSearchConfig;
    if (!whether) {
      return;
    }
    whether.forEach(item => {
      item.checked = false;
    });
    this.whetherConfig = clone(whether);
    return clone(whether);
  };

  searchConfig = [];
  getSearchConfig = () => {
    if (!this.props.advSearchConfig || !this.props.advSearchConfig.search) {
      return [];
    }
    let { search } = this.props.advSearchConfig;
    if (!search) {
      return;
    }
    search.forEach(item => (item.searchValue = ''));
    this.searchConfig = clone(search);
    return clone(search);
  };

  tagsConfig = [];
  getTagsConfig = () => {
    if (!this.props.advSearchConfig || !this.props.advSearchConfig.tag) {
      return [];
    }
    let { tag } = this.props.advSearchConfig;
    if (!tag) {
      return;
    }
    tag.forEach(item => {
      item.tags.forEach(item => {
        item.isSelected = false;
      });
    });
    this.tagsConfig = clone(tag);
    return clone(tag);
  };

  dateRanges = [];
  getDateRanges = () => {
    if (!this.props.advSearchConfig || !this.props.advSearchConfig.dateRanges) {
      return [];
    }
    const dateRanges = clone(this.props.advSearchConfig.dateRanges);
    dateRanges.forEach(item => {
      const newDateInfo = clone(dateInfo);
      if (Array.isArray(item.visible)) {
        item.dateInfo = [];
        newDateInfo.forEach((info, index) => {
          if (item.visible[index]) {
            item.dateInfo.push(info);
          }
        });
      } else {
        item.dateInfo = newDateInfo;
      }
    });
    this.dateRanges = clone(dateRanges);
    return dateRanges;
  };

  // 一行一个 语句
  // 索引为 0 的数组：存储时间范围的 where 语句
  // 索引为 1 的数组：存储 tag 的 where 语句
  // 索引为 2 的数组：存储 search 的 where 语句
  // 索引为 3 的数组：存储 whether 的 where 语句
  wheres = [[], [], [], []];
  clickDateTag = (rowIndex, index) => {
    const { dateRanges } = this.state;
    const dateRange = dateRanges[rowIndex];
    const dateInnerFieldName = dateRanges[rowIndex].innerFieldName;
    dateRange.dateInfo[index].isSelected = !dateRange.dateInfo[index]
      .isSelected;
    this.setState({ dateRanges });
    const arr = dateRange.dateInfo.filter(item => item.isSelected);
    let where = '';
    arr.forEach((item, index) => {
      arr.length - 1 === index
        ? (where += `(${dateInnerFieldName} between '${item.min}' and '${
            item.max
          }')`)
        : (where += `(${dateInnerFieldName} between '${item.min}' and '${
            item.max
          }') or `);
    });
    this.wheres[0][rowIndex] = where;

    this.retCmsWhere();
  };

  rangePickerChange = (values, rowIndex) => {
    const { dateRanges } = this.state;
    dateRanges[rowIndex].rangePickerValue = values;
    this.setState({ dateRanges });

    const dateRange = dateRanges[rowIndex];
    const dateInnerFieldName = dateRanges[rowIndex].innerFieldName;
    const arr = dateRange.dateInfo.filter(item => item.isSelected);
    if (values.length !== 0) {
      arr.push({
        min: cloneDeep(values[0])
          .startOf('day')
          .format('YYYY-MM-DD'),
        max: cloneDeep(values[1])
          .endOf('day')
          .format('YYYY-MM-DD')
      });
    }
    let where = '';
    arr.forEach((item, index) => {
      arr.length - 1 === index
        ? (where += `(${dateInnerFieldName} between '${item.min}' and '${
            item.max
          }')`)
        : (where += `(${dateInnerFieldName} between '${item.min}' and '${
            item.max
          }') or `);
    });
    this.wheres[0][rowIndex] = where;

    this.retCmsWhere();
  };

  retCmsWhere = () => {
    let wheres = '';
    const filteredWheres = this.wheres.filter(where => where.length);

    const arr = [];
    filteredWheres.forEach(item => {
      const temp = item.filter(item => item);
      arr.push(...temp);
    });

    arr.forEach((where, index, arr) => {
      arr.length - 1 === index
        ? (wheres += `(${where})`)
        : (wheres += `(${where}) and `);
    });
    this.props.conditionChange(wheres);
  };

  // 渲染时间范围
  renderDateRanges = () => {
    const { dateRanges, labelWidth, rowWidth } = this.state;
    return (
      <React.Fragment>
        {dateRanges.map((dateRange, rowIndex) => {
          return (
            <div key={rowIndex} className="lz-row" style={{ width: rowWidth }}>
              <span className="title" style={{ width: labelWidth }}>
                {dateRange.title}：
              </span>
              {dateRange.dateInfo.map((item, index) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      this.clickDateTag(rowIndex, index);
                    }}
                    className={classNames('tag', {
                      selected: item.isSelected
                    })}
                  >
                    {item.label}
                  </span>
                );
              })}
              <RangePicker
                className="lz-adv-search-range-picker"
                value={dateRange.rangePickerValue}
                onChange={values => {
                  this.rangePickerChange(values, rowIndex);
                }}
              />
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  clickTag = (rowIndex, index) => {
    const { tagsConfig } = this.state;
    tagsConfig[rowIndex].tags[index].isSelected = !tagsConfig[rowIndex].tags[
      index
    ].isSelected;
    this.setState({ tagsConfig });
    const op = tagsConfig[rowIndex].op;
    const arr = tagsConfig[rowIndex].tags.filter(item => item.isSelected);
    let where = '';
    arr.forEach((item, index) => {
      arr.length - 1 === index
        ? (where += `(${item.innerFieldName} = '${item.value}')`)
        : (where += `(${item.innerFieldName} = '${item.value}') ${op} `);
    });
    this.wheres[1][rowIndex] = where;
    this.retCmsWhere();
  };

  // 渲染 tags
  renderTags = () => {
    const { tagsConfig, labelWidth, rowWidth } = this.state;
    return (
      <React.Fragment>
        {tagsConfig.map((tag, rowIndex) => {
          return (
            <div className="lz-row" key={rowIndex} style={{ width: rowWidth }}>
              <span className="title" style={{ width: labelWidth }}>
                {tag.title}：
              </span>
              <div
                className="tags-wrap"
                style={{ width: `${100 - parseInt(labelWidth, 10)}%` }}
              >
                {tag.tags.map((item, index) => {
                  return (
                    <span
                      key={index}
                      onClick={() => {
                        this.clickTag(rowIndex, index);
                      }}
                      className={classNames('tag', {
                        selected: item.isSelected
                      })}
                    >
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  searchChange = (value, rowIndex, innerFieldNames) => {
    const { searchConfig } = this.state;
    let where = '';
    if (value) {
      innerFieldNames.forEach((innerFieldName, index, arr) => {
        if (arr.length - 1 !== index) {
          where += `(${innerFieldName} = '${value}') or `;
        } else {
          where += `(${innerFieldName} = '${value}')`;
        }
      });
    }
    this.wheres[2][rowIndex] = where;
    this.retCmsWhere();
  };

  searchOnChange = (event, index) => {
    const { searchConfig } = this.state;
    searchConfig[index].searchValue = event.target.value;
    this.setState({ searchConfig });
  };

  renderSearch = () => {
    const { searchConfig, labelWidth, rowWidth } = this.state;
    return (
      <React.Fragment>
        {searchConfig.map((search, rowIndex) => {
          return (
            <div className="lz-row" key={rowIndex} style={{ width: rowWidth }}>
              <span className="title" style={{ width: labelWidth }}>
                {search.title}：
              </span>
              <Search
                className="search"
                onChange={event => this.searchOnChange(event, rowIndex)}
                value={search.searchValue}
                onSearch={value => {
                  this.searchChange(value, rowIndex, search.innerFieldNames);
                }}
              />
            </div>
          );
        })}
      </React.Fragment>
    );
  };
  reset = () => {
    this.setState({
      dateRanges: clone(this.dateRanges),
      tagsConfig: clone(this.tagsConfig),
      searchConfig: clone(this.searchConfig),
      whetherConfig: clone(this.whetherConfig)
    });
    this.wheres = [[], [], [], []];
    this.retCmsWhere();
  };

  switchChange = (checked, rowIndex) => {
    const { whetherConfig } = this.state;
    const whether = whetherConfig[rowIndex];
    whether.checked = !whether.checked;
    this.setState({ whetherConfig });

    let where = whether.checked
      ? `${whether.innerFieldName} = '${whether.checkedValue}'`
      : '';
    this.wheres[3][rowIndex] = where;
    this.retCmsWhere();
  };

  renderWhether = () => {
    const { whetherConfig, labelWidth, rowWidth } = this.state;
    return (
      <React.Fragment>
        {whetherConfig.map((whether, rowIndex) => {
          return (
            <div className="lz-row" key={rowIndex} style={{ width: rowWidth }}>
              <span className="title" style={{ width: labelWidth }}>
                {whether.title}：
              </span>

              <Switch
                className="switch"
                checked={whether.checked}
                onChange={checked => {
                  this.switchChange(checked, rowIndex);
                }}
              />
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  onClose = () => {
    this.props.onClose && this.props.onClose();
  };

  renderNormal = () => {
    const { style, advSearchVisible } = this.props;
    const { labelWidth, rowWidth } = this.state;
    return (
      <div
        className={classNames('lz-adv-search', {
          'lz-adv-search-hide': !advSearchVisible
        })}
        style={style}
      >
        {this.renderDateRanges()}
        {this.renderTags()}
        {this.renderSearch()}
        {this.renderWhether()}
        <div className="lz-row" style={{ width: rowWidth }}>
          <div className="title" style={{ width: labelWidth }} />
          <Button style={{ marginLeft: 10 }} onClick={this.reset}>
            重置
          </Button>
        </div>
      </div>
    );
  };

  renderDrawer = () => {
    const { advSearchVisible, cssSelector } = this.props;
    const { labelWidth, rowWidth, drawerWidth } = this.state;
    let getContainer = document.body;
    if (cssSelector) {
      getContainer = document.querySelector(cssSelector);
    }
    return (
      <Drawer
        title="高级搜索"
        placement="right"
        closable={true}
        onClose={this.onClose}
        visible={advSearchVisible}
        width={drawerWidth}
        className="lz-adv-search-drawer"
        mask={false}
        getContainer={getContainer}
      >
        <div className="lz-adv-search">
          {this.renderDateRanges()}
          {this.renderTags()}
          {this.renderSearch()}
          {this.renderWhether()}
          <div className="lz-row" style={{ width: rowWidth }}>
            <div className="title" style={{ width: labelWidth }} />
            <Button style={{ marginLeft: 10 }} onClick={this.reset}>
              重置
            </Button>
          </div>
        </div>
      </Drawer>
    );
  };

  render() {
    const { containerName } = this.state;
    if (containerName === 'normal') {
      return this.renderNormal();
    } else if (containerName === 'drawer') {
      return this.renderDrawer();
    }
  }
}
