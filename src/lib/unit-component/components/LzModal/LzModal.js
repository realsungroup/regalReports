import React, { Fragment } from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './LzModal.less';

export default class LzModal extends React.Component {
  static propTypes = {
    modalWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    modalHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onClose: PropTypes.func.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      scaleStatus: 'normal'
    };
  }

  scaleStatusChange = () => {
    this.setState({
      scaleStatus: this.state.scaleStatus === 'normal' ? 'max' : 'normal'
    });
  };

  onClose = () => {
    const { onClose } = this.props;
    onClose && onClose();
  };

  render() {
    const { title } = this.props;
    const { scaleStatus, modalWidth, modalHeight } = this.state;
    const modalTitle = (
      <div>
        <i
          className={classNames({
            iconfont: true,
            'scale-btn': true,
            'icon-scale-max': scaleStatus === 'normal',
            'icon-scale-normal': scaleStatus === 'max'
          })}
          onClick={this.scaleStatusChange}
        />
        {title}
      </div>
    );
    let width = modalWidth || '70%',
      height = modalHeight || '90%',
      top = 20;
    if (scaleStatus === 'max') {
      width = height = '100%';
      top = 0;
    }

    return (
      <Modal
        className={classNames({
          'lz-modal': true,
          top0: scaleStatus === 'max'
        })}
        title={modalTitle}
        visible={true}
        maskClosable={false}
        width={width}
        height={height}
        footer={null}
        top={top}
        destroyOnClose={true}
        onCancel={this.onClose}
      >
        {this.props.children}
      </Modal>
    );
  }
}
