import React, { Fragment } from 'react';
import { List, Checkbox, Avatar, Input, Button } from 'antd';
import './PersonListWithSelect.less';
import PropTypes from 'prop-types';
import PersonList from '../PersonList';
import classNames from 'classnames';

const Search = Input.Search;
/**
 * 带有复选框的人员列表组件
 */
export default class PersonListWithSelect extends React.Component {
  static propTypes = {
    /**
     * 是否有搜索栏
     * 默认：true
     */
    hasSearch: PropTypes.bool
  };

  static defaultProps = {
    hasSearch: true
  };

  renderContent = (item, index) => {
    return (
      <Fragment>
        <span style={{ marginRight: 10 }}>{item.department}</span>
        <Checkbox
          checked={item.checked}
          onChange={e => this.props.singleChange(e, item, index)}
        />
      </Fragment>
    );
  };

  render() {
    const {
      singleChange,
      allChange,
      onSearch,
      indeterminate,
      isCheckedAll,
      onConfirm,
      data,
      searchValue,
      onSearchChange,
      hasSearch,
      ...restProps
    } = this.props;
    return (
      <div className="person-list-withselect">
        <PersonList
          header={
            <div className="person-list-withselect__header">
              {hasSearch && (
                <Search
                  value={searchValue}
                  onChange={onSearchChange}
                  placeholder="搜索 工号/姓名"
                  onSearch={onSearch}
                  className="person-list-withselect__search"
                />
              )}
              {!!data.length && (
                <Checkbox
                  checked={isCheckedAll}
                  onChange={allChange}
                  className={classNames('person-list-withselect__checked-all', {
                    'person-list-withselect__checked-all--without-search': !hasSearch
                  })}
                  indeterminate={indeterminate}
                >
                  全选
                </Checkbox>
              )}
            </div>
          }
          content={this.renderContent}
          data={data}
          {...restProps}
        />
      </div>
    );
  }
}
