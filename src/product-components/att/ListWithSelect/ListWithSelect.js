import React from 'react';
import { List } from 'antd';
import './ListWithSelect.less';
import classNames from 'classnames';

/**
 * 带有选择按钮的列表
 */
export default class ListWithSelect extends React.Component {
  render() {
    const { data, onSelect, headerTitle } = this.props;
    const Header = (
      <div style={{ height: 32, lineHeight: '32px' }}>{headerTitle}</div>
    );
    return (
      <List
        className="list-with-select"
        dataSource={data}
        header={Header}
        renderItem={(item, index) => (
          <List.Item
            className={classNames({
              selected: item.isSelect
            })}
            onClick={() => onSelect(item, index)}
          >
            <List.Item.Meta style={{ marginLeft: 10 }} title={item.title} />
            {/* <a
              style={{ marginRight: 10 }}
              href="javascript:;"
              
              className={classNames({
                selected: item.isSelect
              })}
            >
              选择
            </a> */}
          </List.Item>
        )}
      />
    );
  }
}
