import React from 'react';
import { Checkbox } from 'antd';
import './TaskFilterOption.less';

export default class TaskFilterOption extends React.PureComponent {
  static defaultProps = {
    iconClsSelected: 'checked',
    iconClsUnselected: 'unchecked'
  };

  handleClick = () => {
    const { catalog, onSelect } = this.props;
    onSelect(catalog);
  };

  render() {
    const {
      selected,
      catalog,
      iconClsSelected,
      iconClsUnselected,
      style
    } = this.props;

    return (
      <div className="home-task-filter-option" style={style}>
        <Checkbox onChange={this.handleClick} checked={selected}>
          {catalog}
        </Checkbox>
        {/* <div
          className="home-task-filter-option-icon"
          onClick={this.handleClick}
        >
          <i
            className={`iconfont icon-${
              selected ? iconClsSelected : iconClsUnselected
            }`}
          />
        </div> */}
        {/* <div className="home-task-filter-option-text">{catalog}</div> */}
      </div>
    );
  }
}
