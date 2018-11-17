import React from 'react'
import TaskItem from './TaskItem'
import './TaskList.less'

const TaskList = ({ tasks, noDataPrompt }) => (
  <div className="home-task-list">
    {tasks.length > 0
      ? tasks.map((task, idx) => <TaskItem key={idx} tasks={task} />)
      : (
        <div className="home-task-list-empty">{noDataPrompt}</div>
      )
    }
  </div>
)

TaskList.defaultProps = {
  noDataPrompt: '暂无记录',
}

export default TaskList
