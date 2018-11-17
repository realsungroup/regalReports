import moment from 'moment';

// 数据格式化：返回格式化后的值
const timeFormat = value => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
};

const config = {
  // 加班申请
};

config[592764714618] = {
  unitComponents: {
    name: 'LzTable',
    props: {
      customColRender: [
        {
          innerFieldName: 'TIMES',
          format: timeFormat
        }
      ]
    }
  }
};

export default config;
