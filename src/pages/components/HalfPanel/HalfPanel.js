import React from 'react';
import './HalfPanel.less';

const HalfPanel = ({ title, iconUrl, children, className, prefix }) => (
  <div className={`half-panel ${className}`}>
    {title && (
      <div className="half-panel-title">
        {prefix ? prefix : <div className="half-panel-title-icon-default" />}
        <div className="half-panel-title-text">{title}</div>
      </div>
    )}
    {children}
  </div>
);

export default HalfPanel;
