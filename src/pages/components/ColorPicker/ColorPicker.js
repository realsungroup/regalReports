import React from 'react';
import { SketchPicker } from 'react-color';

export default class ColorPicker extends React.Component {
  render() {
    const { onChangeComplete, color } = this.props;
    return (
      <SketchPicker
        color={color}
        onChangeComplete={color => {
          onChangeComplete(color.hex, color);
        }}
        presetColors={[
          window.themeColor['@primary-color'],
          '#D0021B',
          '#F5A623',
          '#F8E71C',
          '#8B572A',
          '#7ED321',
          '#417505',
          '#BD10E0',
          '#9013FE',
          '#4A90E2',
          '#50E3C2',
          '#B8E986',
          '#000000',
          '#4A4A4A',
          '#9B9B9B',
          '#FFFFFF'
        ]}
      />
    );
  }
}
