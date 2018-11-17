import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

/**
 * 渲染多行多列的通用组件
 */
export default class LzRowCols extends React.Component {
  static propTypes = {
    /**
     * 要被处理渲染的数据
     * 默认：[]
     */
    renderData: PropTypes.array,

    /**
     * 列数量
     * 默认：1
     */
    colCount: PropTypes.number,

    /**
     * 在 renderData 对象数组中标识每一个元素的键值
     * 默认：''
     */
    keyName: PropTypes.string
  };

  static defaultProps = {
    renderData: [],
    colCount: 1,
    keyName: ''
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  dealArr = (data, colCount) => {
    if (!Array.isArray(data)) {
      return [];
    }
    let arr = [],
      i = -1;
    data.forEach((item, index) => {
      if (index % colCount === 0) {
        i++;
        arr[i] = [];
      }
      arr[i].push(item);
    });
    return arr;
  };

  render() {
    const { renderData, colCount, keyName, children } = this.props;
    const renderArr = this.dealArr(renderData, colCount);
    const span = 24 / colCount;
    return (
      <Fragment>
        {renderArr.map((arr, rowIndex) => {
          return (
            <Row key={`row-${rowIndex}`}>
              {arr.map((data, colIndex) => {
                return (
                  <Col
                    span={span}
                    key={keyName ? data[keyName] : rowIndex + colIndex + ''}
                  >
                    {children(data, rowIndex, colIndex)}
                  </Col>
                );
              })}
            </Row>
          );
        })}
      </Fragment>
    );
  }
}
