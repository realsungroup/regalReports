import React from 'react';
import './PageBody.less';

const PageBody = props => (
  <div className="page-body">
    <div className="page-header-placeholder" />
    {props.children}
  </div>
);

export default PageBody;
