import React from 'react';
import { message } from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getGroupApps } from '../../util/api';
import './LzNavigate.less';
const matchStyle = { position: 'static', left: 0, transform: '(0, 0)' };

// 导航卡片
const NavigateCard = ({ title, navigateList }) => {
  return (
    <div className="navigate-card">
      <div className="navigate-card-title">{title}</div>
      <div className="navigate-list-wrap">
        {navigateList.map(navigate => (
          <Link
            to={{
              pathname: `/fnmodule/${navigate.id}`
            }}
            key={navigate.id}
            className="navigate-bar"
          >
            {navigate.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

/**
 * 快捷导航组件
 */
export default class LzNavigate extends React.Component {
  static propTypes = {
    /**
     * 表 resid 数组
     */
    resids: PropTypes.array
  };
  static defaultProps = {
    resids: [589025789339, 589026206736]
  };

  constructor(props) {
    super(props);

    this.state = {
      navigateCards: [
        // {
        //   title: '查看',
        //   navigateList: [
        //     {
        //       title: '患者信息',
        //       id: '588524362038'
        //     },
        //     {
        //       title: '考勤异常报表',
        //       id: '123123'
        //     },
        //     {
        //       title: '部门考勤统计',
        //       id: '321'
        //     }
        //   ]
        // }
      ]
    };
  }

  componentDidMount() {
    this.getNavigateList();
  }

  getNavigateList = async () => {
    const { resids } = this.props;
    if (!resids.length) {
      return message.error('resids 数组不能为空');
    }
    let res;
    try {
      res = await getGroupApps(resids.join(','));
    } catch (err) {
      return message.error(err.message);
    }
    const navigateCards = res.data.map(item => {
      const card = { title: item.resname };
      card.navigateList = item.AppLinks.map(app => {
        return {
          title: app.resname,
          id: app.resid
        };
      });
      return card;
    });
    this.setState({ navigateCards });
  };

  render() {
    const { navigateCards } = this.state;
    return (
      <div className="lz-navigate">
        {navigateCards.map(navigateCard => (
          <NavigateCard
            key={navigateCard.title}
            title={navigateCard.title}
            navigateList={navigateCard.navigateList}
          />
        ))}
      </div>
    );
  }
}
