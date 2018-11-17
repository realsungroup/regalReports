# power-works

## 一、原型地址：https://pro.modao.cc/app/2c1f55c89534cf05aafb515b1eaf75f46d524b77

## 二、字体图标类名

1. 应用默认图标：icon-default-app

## 三、修改默认主题色

1. 找到 `public/theme.js` 文件：

```javascript
window.themeColor = {
  '@primary-color': '#2b87e9'
};
```

2. 修改 `@primary-color` 的值即可，如：

```javascript
window.themeColor = {
  '@primary-color': 'rgb(144, 144, 144)'
};
```
