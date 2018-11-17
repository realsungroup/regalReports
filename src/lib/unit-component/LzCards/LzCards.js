import React from 'react';
import PropTypes from 'prop-types';
import LzTable from '../LzTable';

/**
 * 卡片组组件
 */
export default class LzCardGroup extends React.Component {
  static propTypes = {
    viewMode: PropTypes.string,
    resid: PropTypes.number.isRequired,
    btnsVisible: PropTypes.object,
    pagination: PropTypes.object,
    // 显示的字段的内部字段名
    showColumnsInnerFieldName: PropTypes.object.isRequired
  };
  static defaultProps = {
    viewMode: 'cards',
    btnsVisible: {
      add: true,
      edit: false,
      save: false,
      cancel: false,
      mod: true,
      check: true,
      del: false
    },
    pagination: {
      pageSize: 10,
      current: 0,
      showTotal: (total, range) => {
        return `${range[0]}-${range[1]} of ${total} items`;
      }
    }
  };

  constructor() {
    super();
  }

  render() {
    const {
      resid,
      btnsVisible,
      pagination,
      showColumnsInnerFieldName,
      ...resProps
    } = this.props;
    return (
      <LzTable
        viewMode="cards"
        resid={resid}
        pagination={pagination}
        btnsVisible={btnsVisible}
        showColumnsInnerFieldName={showColumnsInnerFieldName}
        {...resProps}
      />
    );
  }
}
