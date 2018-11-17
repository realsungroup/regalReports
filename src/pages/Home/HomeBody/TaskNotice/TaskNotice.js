import React from 'react';
import { Spin } from 'antd';
import Panel from '../../../components/Panel';
import TaskFilter from './TaskFilter';
import TaskList from './TaskList';
import { getTableData } from '../../../../util/api';

export default class TaskNotice extends React.PureComponent {
  static catalogDataPipe = data => {
    const { taskCatalog, taskCatalogIconCls, taskCatalogIconCls2 } = data;

    return {
      catalog: taskCatalog,
      iconClsUnselected: taskCatalogIconCls2,
      iconClsSelected: taskCatalogIconCls
    };
  };

  static cacheCurrentCatalogs = catalogs => {
    localStorage.setItem('ivf-catalogs', JSON.stringify(catalogs));
  };

  static getCacheCatalogs = () =>
    JSON.parse(localStorage.getItem('ivf-catalogs')) || [];

  static taskDataPipe = data => {
    const { taskCatalog, taskType, iconCls, descriptions } = data;

    return {
      catalog: taskCatalog,
      type: taskType,
      iconCls,
      descriptions
    };
  };

  state = {
    loading: true,
    options: [],
    catalogs: [],
    tasks: [],
    tasksOfTypes: []
  };

  componentDidMount() {
    this.loadTasks();
  }

  handleSelect = catalog => {
    let { catalogs } = this.state;

    if (catalogs.includes(catalog)) {
      catalogs = catalogs.filter(c => c !== catalog);
    } else {
      catalogs.push(catalog);
    }

    this.updateCurrentTasks(catalogs);
    TaskNotice.cacheCurrentCatalogs(catalogs);
  };

  updateCurrentTasks = catalogs => {
    const tasksOfCatalogs = this.getTasksOfCatalogs(catalogs);
    this.setState({
      tasksOfTypes: this.getTasksOfTypes(tasksOfCatalogs),
      catalogs
    });
  };

  getCurrentCatalogs = () => {
    const { options } = this.state;
    const cachedCatalogs = TaskNotice.getCacheCatalogs();

    if (cachedCatalogs.length > 0) {
      return cachedCatalogs;
    }

    return (options.length > 0 && [options[0].catalog]) || [];
  };

  getTasksOfCatalogs = catalogs => {
    return this.state.tasks.filter(task => catalogs.includes(task.catalog));
  };

  getTasksOfTypes = tasksOfCatalogs => {
    const tasksOfTypes = {};

    tasksOfCatalogs.forEach((task, idx) => {
      const { type } = task;
      if (tasksOfTypes[type]) {
        tasksOfTypes[type].push(task);
      } else {
        tasksOfTypes[type] = [task];
        tasksOfTypes[type].order = idx;
      }
    });

    return Object.values(tasksOfTypes).sort((a, b) => a.order - b.order);
  };

  showDefaultTasks = () => {
    const catalogs = this.getCurrentCatalogs();
    this.updateCurrentTasks(catalogs);
  };

  loadTasks = async () => {
    try {
      const getCatalog = getTableData(576324834651);
      const getTasks = getTableData(576325914269);

      const catalogRes = await getCatalog;
      const tasksRes = await getTasks;

      if (!catalogRes.error && !tasksRes.error) {
        this.setState(
          {
            options: (catalogRes.data || []).map(item =>
              TaskNotice.catalogDataPipe(item)
            ),
            tasks: (tasksRes.data || []).map(item =>
              TaskNotice.taskDataPipe(item)
            ),
            catalogs: this.getCurrentCatalogs(),
            loading: false
          },
          this.showDefaultTasks
        );
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  render() {
    const { options, tasksOfTypes, catalogs, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <Panel>
          <TaskFilter
            options={options}
            catalogs={catalogs}
            onSelect={this.handleSelect}
          />
        </Panel>
        <Panel>
          <TaskList tasks={tasksOfTypes} />
        </Panel>
      </Spin>
    );
  }
}
