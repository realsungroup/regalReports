import React from 'react';
import { Link } from 'react-router-dom';
import './TaskItem.less';

const TaskItem = props => {
  const { tasks } = props;
  const tasksCount = tasks.length;
  const { descriptions, iconCls, type, catalog } = tasks[0] || {};
  const detailUrl = `/task-notice/${catalog}/${type}`;

  return (
    <div className="home-task-item">
      <div className="home-task-item-icon">
        <i className={`iconfont icon-${iconCls || 'sk_icon'}`} alt="" />
      </div>
      <div className="home-task-item-content">
        <div className="home-task-item-top-row">
          <div className="home-task-item-title">{type}</div>
          <span className="status">{catalog}</span>
        </div>
        <div className="home-task-item-desc">{descriptions}</div>
      </div>
      <div className="home-task-item-link">
        <Link to={detailUrl} style={{ display: 'block' }}>
          <span className="tasks-count">{tasksCount}</span>
          <i className="iconfont icon-forward" />
        </Link>
      </div>
    </div>
  );
};

export default TaskItem;
