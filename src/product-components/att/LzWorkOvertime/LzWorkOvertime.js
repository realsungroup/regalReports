import React from 'react';
import { Tabs, Card, message, Tag, Spin } from 'antd';
import './LzWorkOvertime.less';
import LzTable from '../../../lib/unit-component/LzTable';
import moment from 'moment';
import { getMainTableData } from 'Util/api';
const TabPane = Tabs.TabPane;
const { Fragment } = React;

const lzTableProps = {
  pagination: {
    current: 0,
    pageSize: 10
  },
  isSearch: true,
  hasRefresh: true,
  advSearchConfig: {
    // 高级搜索配置
    defaultVisible: false,
    containerName: 'drawer',
    drawerWidth: 500,
    labelWidth: '24%',
    rowWidth: '100%',
    search: [
      {
        title: '工号/姓名',
        innerFieldNames: ['C3_593201544378', 'C3_593718803621']
      }
    ],
    dateRanges: [
      {
        title: '开始结束日期',
        visible: [false, false, false, false],
        innerFieldName: 'C3_593361491636'
      }
    ],
    tag: [
      // tag
      {
        title: '累计是否超额',
        op: 'or', // 操作符：'or' | 'and'
        tags: [
          {
            label: '是',
            value: 'Y',
            isSelected: false,
            innerFieldName: 'C3_593719109530'
          },
          {
            label: '否',
            value: 'N',
            isSelected: false,
            innerFieldName: 'C3_593719109530'
          }
        ]
      }
    ]
  },

  isBackEndBtnsVisible: true,
  opIsFixed: true
};

/**
 * 加班审批
 */
export default class LzWorkOvertime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cardRecord: {},
      cardLoading: false
    };
  }

  componentDidMount = () => {
    this.getCardRecord();
  };

  getCardRecord = async () => {
    this.setState({ cardLoading: true });
    let res;
    try {
      res = await getMainTableData(593714258267, {
        cmswhere: `dates = ${moment().format('YYYYMMDD')}`
      });
    } catch (err) {
      this.setState({ cardLoading: false });
      message.error(err.message);
    }
    let cardRecord = {};
    if (res.data.length) {
      cardRecord = res.data[0];
    }
    this.setState({ cardRecord, cardLoading: false });
  };

  render() {
    const { cardRecord, cardLoading } = this.state;
    const hasCards = !!Object.keys(cardRecord).length;
    return (
      <div className="lz-work-overtime">
        <Fragment>
          <Spin spinning={cardLoading}>
            <span className="lz-work-overtime__time-tag">
              <i className="iconfont icon-rili" />
              {moment().format('YYYY-MM-DD')}
            </span>
            <div className="lz-work-overtime__cards">
              <Card
                className="lz-work-overtime__card"
                title={cardRecord.deptname}
                extra={
                  <span className="lz-work-overtime__cards-extra">日</span>
                }
              >
                <div className="lz-work-overtime__cards-content">
                  <span>> target HC</span>
                  <span>{cardRecord.OverDayTargetHc}</span>
                </div>
                <div className="lz-work-overtime__cards-content">
                  <span>> target HC / Total HC</span>
                  <span>
                    {Math.round(cardRecord.DayOvertTargetRatio * 100, 2) + '%'}
                  </span>
                </div>
                <div className="lz-work-overtime__cards-content">
                  <span>Average OT Hours</span>
                  <span>{cardRecord.AverageDayOtHrs}</span>
                </div>
                <div className="lz-work-overtime__cards-content">
                  <span>(target HC) - (> target HC)</span>
                  <span>{cardRecord.OvrDayAmountLimit}</span>
                </div>
              </Card>
              <Card
                className="lz-work-overtime__card"
                title={cardRecord.deptname}
                extra={
                  <span className="lz-work-overtime__cards-extra">月</span>
                }
              >
                <div className="lz-work-overtime__cards-content">
                  <span>> target HC</span>
                  <span>{cardRecord.OverMonthTargetHc}</span>
                </div>
                <div className="lz-work-overtime__cards-content">
                  <span>> target HC / Total HC</span>
                  <span>{cardRecord.MonthOvertTargetRatio * 100 + '%'}</span>
                </div>
                <div className="lz-work-overtime__cards-content">
                  <span>Average OT Hours</span>
                  <span>{cardRecord.AverageMonthOtHrs}</span>
                </div>
                <div className="lz-work-overtime__cards-content">
                  <span>(target HC) - (> target HC)</span>
                  <span>{cardRecord.OvrMonAmountLimit}</span>
                </div>
              </Card>
            </div>
          </Spin>
        </Fragment>
        <Tabs defaultActiveKey="待审批">
          <TabPane tab="待审批" key="待审批">
            <LzTable resid={593634015037} {...lzTableProps} />
          </TabPane>
          <TabPane tab="已审核" key="已审批">
            <LzTable resid={593689582453} {...lzTableProps} />
          </TabPane>
          <TabPane tab="已拒绝" key="已拒绝">
            <LzTable resid={593689653276} {...lzTableProps} />
          </TabPane>
          <TabPane tab="历史记录" key="历史记录">
            <LzTable resid={593689668754} {...lzTableProps} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
