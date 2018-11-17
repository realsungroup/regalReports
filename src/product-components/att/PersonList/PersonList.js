import React from 'react';
import { List, Avatar, Spin } from 'antd';
import './PersonList.less';
/**
 * 人员列表组件
 */
export default class PersonList extends React.Component {
  static defaultProps = {
    loadMore: page => {
      console.log(page);
    }
  };

  render() {
    const { data, header, content, loading } = this.props;
    return (
      <List
        className="person-list"
        dataSource={data}
        header={header}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon="user" style={{ marginTop: 10 }} />}
              title={item.badgeNum}
              description={item.name}
            />
            {content(item, index)}
          </List.Item>
        )}
      >
        {loading && (
          <div className="person-list__spin">
            <Spin />
          </div>
        )}
      </List>
    );
  }
}
