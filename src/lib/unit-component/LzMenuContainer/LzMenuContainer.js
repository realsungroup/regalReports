import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal, Input, message, Spin, Menu, Icon, Avatar } from 'antd';

import './LzMenuContainer.less';
import { LzTable } from '../../../loadableComponents';
import MenuMultiple from './MenuMultiple';
import { getMainTableData, getSubTableData } from '../../util/api';
import LzRowCols from '../components/LzRowCols';

const Search = Input.Search;
const SubMenu = Menu.SubMenu;
/**
 * 菜单容器组件
 */
export default class LzMenuContainer extends React.Component {
  static propTypes = {
    /**
     * 模式
     * 可选：'single' 单张子表 | 'multiple' 多张子表
     * 默认：'single'
     */
    mode: PropTypes.oneOf(['single', 'multiple']).isRequired,

    /**
     * 主表 id
     * 默认：-
     */
    resid: PropTypes.number,

    /**
     * 获取导航列表的 resid（在 mode 为 'multiple' 时需要该参数）
     */
    navListResid: PropTypes.number,

    /**
     * 表格记录
     * 默认：-
     */
    record: PropTypes.object,

    /**
     * 右侧没有数据时的提示文字
     * 默认：''
     */
    noDataTip: PropTypes.string,

    /**
     * 搜索的字段
     * 默认：-
     */
    // 例如：
    // [
    //   {
    //     text: '姓名',
    //     innerFieldName: 'yyy',
    //   },
    //   {
    //     text: '工号',
    //     innerFieldName: 'xxx',
    //   }
    // ]
    searchFields: PropTypes.array.isRequired,

    /**
     * 用户信息的内部字段
     * 默认：[]
     */
    // 例如：
    // [
    //   {
    //     label: '姓名',
    //     innerFieldName: 'C3_590510740042'
    //   },
    //   {
    //     label: '工号',
    //     innerFieldName: 'C3_590510737521'
    //   },
    //   {
    //     label: '职务',
    //     innerFieldName: 'C3_590512134594'
    //   },
    //   {
    //     label: '部门',
    //     innerFieldName: 'C3_590510763625'
    //   },
    // ]
    userInfoFields: PropTypes.array,

    /**
     * 默认组件的 props
     * 默认：-
     */
    defaultComponentProps: PropTypes.object,

    /**
     * 搜索文案
     * 默认：'请选择员工'
     */
    searchText: PropTypes.string,

    /**
     * 显示头像的内部字段名称
     * 默认：''（使用 antd 默认的头像）
     */
    avatarFieldName: PropTypes.string,

    /**
     * 是否有字段的 label
     * 可选：true | false
     * 默认：true
     */
    hasFieldsLabel: PropTypes.bool,

    /**
     * 用户字段的显示模式配置
     * 默认：{ mode: 'block' }
     */
    userFieldsViewConfig: PropTypes.object
    // 例如：
    // {
    //   mode: 'inline', // 'block' 每个字段占一行 | 'inline' 每一行可放多个字段
    //   colCount: 2 // 在 mode 为 'inline' 时，每一行的字段数量
    // }
  };
  static defaultProps = {
    mode: 'single',
    userInfoFields: [],
    noDataTip: '暂无数据，请选择员工',
    searchText: '请选择员工',
    avatarFieldName: '',
    hasFieldsLabel: true,
    userFieldsViewConfig: { mode: 'block' }
  };
  constructor(props) {
    super(props);
    const record = this.props.record ? { ...this.props.record } : null;
    const { resid } = props;
    this.state = {
      avatar:
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1804819840,2974605393&fm=27&gp=0.jpg',
      name: '张楠楠',
      position: '市场部经理',
      menuStatus: 'expand', // 菜单栏的装填：'expand' 展开 | 'shrink' 收缩
      selectedIndex: -1,
      record, // 搜索工号得到的记录
      modalVisible: false,
      searchValue: '', // 搜索值：工号
      searchLoading: false,
      selectedKeys: [],
      resid: 0, // 主表 id
      subresid: 0, // 子表 id
      hostrecid: 0 // 主表记录 id
    };
  }

  componentDidMount() {}

  // 切换菜单
  toggleMenu = index => {
    this.setState({ selectedIndex: index });
  };

  renderContent = () => {
    const { record } = this.state;
    const { mode, noDataTip } = this.props;

    // 记录为空时
    if (!record) {
      return (
        <div className="no-data-tip">
          <div className="icon-wrap">
            <i className="iconfont icon-default-nodata" />
          </div>
          <p>{noDataTip}</p>
        </div>
      );
    } else {
      // 有记录时

      // 显示默认的视图
      if (mode === 'single') {
        const { defaultComponetProps } = this.props;
        const { record } = this.state;
        const props = {
          ...defaultComponetProps,
          hostrecid: record.REC_ID,
          searchValue: this.state.searchValue
        };
        return <LzTable {...props} key={props.hostrecid} />;
      } else {
        const { subresid, resid, hostrecid } = this.state;
        const { advSearchConfig } = this.props;
        const formTitle = this.getFormTitle(this.props.menuList, subresid);
        const props = {
          formTitle,
          key: subresid,
          resid,
          subresid,
          hostrecid
        };
        return <MenuMultiple {...props} advSearchConfig={advSearchConfig} />;
      }
    }
  };

  getFormTitle = (menuList, resid) => {
    let formTitle = '';
    menuList.some(menu => {
      if (menu.subMenuList) {
        const flag = menu.subMenuList.some(subMenu => {
          if (subMenu.RES_ID === resid) {
            formTitle = subMenu.RES_NAME;
            return true;
          }
        });
        return flag;
      } else {
        if (menu.RES_ID === resid) {
          formTitle = menu.RES_NAME;
          return true;
        }
      }
    });
    return formTitle;
  };

  chooseStaff = () => {
    this.setState({ modalVisible: true });
  };

  handleCancel = () => {
    this.setState({ modalVisible: false });
  };

  getPlaceholder = () => {
    const { searchFields } = this.props;
    if (!searchFields) {
      return '';
    }
    let text = '请输入';
    let textArr = [];
    searchFields.forEach(field => textArr.push(field.text));
    text += ` ${textArr.join('/')}`;
    return text;
  };

  getCmswhere = () => {
    const { searchValue } = this.state;
    const { searchFields } = this.props;
    let where = '';
    searchFields.forEach((searchField, index) => {
      where +=
        index === searchFields.length - 1
          ? ` (${searchField.innerFieldName} = '${searchValue}') `
          : ` (${searchField.innerFieldName} = '${searchValue}') or`;
    });
    return where;
  };

  searchStaff = async value => {
    this.setState({ searchLoading: true });
    let res;
    try {
      const cmswhere = this.getCmswhere();
      res = await getMainTableData(this.props.resid, {
        cmswhere
      });
    } catch (err) {
      this.setState({ searchLoading: false });
      return message.error(err.message);
    }
    if (!res.data.length) {
      this.setState({ searchLoading: false });
      return message.error('没有该员工');
    }
    message.success('搜索成功');
    const record = res.data[0];
    this.setState({
      modalVisible: false,
      searchLoading: false,
      record
    });
  };

  searchChange = event => {
    this.setState({ searchValue: event.target.value });
  };

  changeMenuStatus = menuStatus => {
    if (this.state.menuStatus === menuStatus) {
      return;
    }
    this.setState({ menuStatus });
  };

  switchMenuItem = async ({ item, key, selectedKeys }) => {
    const { record } = this.state;
    if (!record) {
      return message.error('请选择员工');
    }
    const { resid } = this.props;
    const hostrecid = record.REC_ID;
    const subresid = parseInt(key, 10);
    this.setState({
      resid,
      subresid,
      hostrecid,
      selectedKeys
    });
  };

  // 渲染导航列表
  renderNavList = () => {
    const { mode } = this.props;
    if (mode === 'single') {
    } else if (mode === 'multiple') {
      const { menuList } = this.props;
      const { selectedKeys } = this.state;
      return (
        <Menu
          mode="inline"
          className="nav-list"
          onSelect={this.switchMenuItem}
          selectedKeys={selectedKeys}
        >
          {menuList.map((menu, menuIndex) => {
            if (!menu.subMenuList) {
              return (
                <Menu.Item key={menu.RES_ID}>
                  <Icon type="align-right" theme="outlined" />
                  <span>{menu.RES_NAME}</span>
                </Menu.Item>
              );
            } else {
              return (
                <SubMenu
                  key={menu.RES_ID}
                  title={
                    <span>
                      <span>{menu.RES_NAME}</span>
                    </span>
                  }
                >
                  {menu.subMenuList.map(subMenu => (
                    <Menu.Item key={subMenu.RES_ID}>
                      <Icon type="align-right" theme="outlined" />
                      <span>{subMenu.RES_NAME}</span>
                    </Menu.Item>
                  ))}
                </SubMenu>
              );
            }
          })}
        </Menu>
      );
    }
  };

  getAvatarSrc = () => {
    const { record } = this.state;
    const { avatarFieldName } = this.props;
    if (avatarFieldName && record) {
      return {
        src: record[avatarFieldName]
      };
    } else {
      return {};
    }
  };

  getRenderData = (userInfoFields, record, hasFieldsLabel) => {
    if (!Array.isArray(userInfoFields)) {
      return [];
    }
    const arr = [];
    userInfoFields.forEach(userInfoField => {
      let text = record[userInfoField.innerFieldName];
      if (hasFieldsLabel) {
        text = userInfoField.label + '：' + text;
      }
      arr.push({
        label: userInfoField.label,
        innerFieldName: userInfoField.innerFieldName,
        text,
        id: userInfoField.innerFieldName
      });
    });
    return arr;
  };

  renderUserFields = () => {
    const { record } = this.state;
    const { searchText } = this.props;
    console.log('this.props.record:', this.props.record);
    // 没有选取人员时
    if (!record) {
      return (
        <p style={{ marginTop: 16 }}>
          <span>{searchText}</span>

          <i className="iconfont icon-search" onClick={this.chooseStaff} />
        </p>
      );
    }
    // 选取了人员时
    const { userInfoFields, hasFieldsLabel, userFieldsViewConfig } = this.props;
    const mode = userFieldsViewConfig.mode;

    const renderData = this.getRenderData(
      userInfoFields,
      record,
      hasFieldsLabel
    );
    let colCount = 1;
    if (mode === 'inline') {
      colCount = userFieldsViewConfig.colCount || 1;
    }
    return (
      <Fragment>
        <p style={{ marginTop: 16 }}>
          {!this.props.record && (
            <i className="iconfont icon-search" onClick={this.chooseStaff} />
          )}
        </p>
        <LzRowCols renderData={renderData} colCount={colCount} keyName="id">
          {data => {
            return (
              <div className="user-info-item">
                {hasFieldsLabel && (
                  <div
                    className={classNames('label', {
                      'haslabel-block': hasFieldsLabel && mode === 'block',
                      'haslabel-inline': hasFieldsLabel && mode === 'inline',

                      'nolabel-inline': !hasFieldsLabel && mode === 'inline'
                    })}
                  >
                    {data.label + '：'}
                  </div>
                )}
                <div
                  className={classNames('item-value', {
                    'haslabel-block': hasFieldsLabel && mode === 'block',
                    'haslabel-inline': hasFieldsLabel && mode === 'inline',

                    'nolabel-block': !hasFieldsLabel && mode === 'block',
                    'nolabel-inline': !hasFieldsLabel && mode === 'inline'
                  })}
                >
                  {record[data.innerFieldName]}
                </div>
              </div>
            );
          }}
        </LzRowCols>
      </Fragment>
    );
  };

  render() {
    const { menuStatus, modalVisible, searchValue, searchLoading } = this.state;
    const { searchText } = this.props;
    return (
      <div className="lz-menu-container">
        {/* menu */}
        <div
          className={classNames('menu', {
            expand: menuStatus === 'expand',
            shrink: menuStatus === 'shrink'
          })}
        >
          <div className="user-info">
            <Avatar
              className="avatar"
              size={120}
              icon="user"
              {...this.getAvatarSrc()}
            />
            {this.renderUserFields()}
          </div>
          {this.renderNavList()}
          <i
            className="iconfont icon-expand-v"
            onClick={() =>
              this.changeMenuStatus(
                menuStatus === 'expand' ? 'shrink' : 'expand'
              )
            }
            onMouseEnter={() =>
              this.setState({
                menuStatus: 'expand'
              })
            }
          />
        </div>
        {/* container */}
        <div
          className={classNames('lz-menu-container-container', {
            expand: menuStatus === 'expand',
            shrink: menuStatus === 'shrink'
          })}
        >
          {this.renderContent()}
        </div>
        <Modal
          title="选择人员"
          visible={modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
          footer={null}
          bodyStyle={{ height: 120 }}
        >
          <Spin spinning={searchLoading}>
            <Search
              style={{ marginTop: 20 }}
              placeholder={this.getPlaceholder()}
              value={searchValue}
              onChange={this.searchChange}
              onSearch={this.searchStaff}
              autoFocus
            />
          </Spin>
        </Modal>
      </div>
    );
  }
}
