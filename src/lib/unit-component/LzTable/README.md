# 表格组件

## tableTitle: string

- 描述： 表格标题
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "tableTitle": "表格标题"
}
```

---

## dataMode: string

- 描述： 数据模式
- 是否必传：否
- 默认值：'main'
- 可选值：'main' | 'sub'
- 例子

```json
{
  "dataMode": "sub"
}
```

---

## viewMode: string

- 描述： 视图模式
- 是否必传：否
- 默认值：'table'
- 可选值：'table' 显示表格；'cards' 显示卡片；'forms' 显示表单
- 例子

```json
"viewMode": "table"
```

---

## resid: number

- 描述： 主表 id
- 是否必传：是
- 默认值：-
- 可选值：-
- 例子

```json
{
  "resid": 592244695755
}
```

---

## subresid: number

- 描述： 子表 id
- 是否必传：当 dataMode 为 'sub' 时，必传
- 默认值：-
- 可选值：-
- 例子

```json
{
  "dataMode": "sub",
  "subresid": 592244695755
}
```

---

## hostrecid: number

- 描述： 主表记录 id
- 是否必传：当 dataMode 为 'sub' 时，必传
- 默认值：-
- 可选值：-
- 例子

```json
{
  "dataMode": "sub",
  "hostrecid": "C3_xxx"
}
```

---

## cmscolumns: string

- 描述： 获取特定字段的数据，每个字段以逗号分隔
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "cmscolumns": "C3_511302422114,C3_511302066880,C3_511302131411"
  // 表格只会获取到上面这三个字段的值
}
```

---

## cmswhere: string

- 描述： 表 cmswhere 查询条件
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "cmswhere": "C3_511302422114 = 1"
}
```

---

## formsName: string | object

- 描述： 窗体名称。为字符串时，行内编辑和模态窗中的表单都用该窗体；可以配置对象类型，给行内编辑和模态窗分别设置不同的窗体
- 是否必传：否
- 默认值：'default'
- 可选值：-
- 例子

```json
{
  "formsName": {
    "rowFormName": "default", //  rowFormName 表示行内编辑所用的窗体名称
    "formFormName": "default" // formFormName 表示表单中所用的窗体名称
  }
}
```

---

## btnsVisible: object

- 描述：edit 编辑 | save 保存 | cancel 取消 | mod 修改 | check 查看 | del 删除 按钮是否显示
- 是否必传：否
- 默认值：{ "edit": false, "save": false, "cancel": false, "mod": false, "check": false, "del": false }，即所有按钮不显示
- 可选值：-
- 例子

```json
{
  "btnsVisible": {
    "edit": true,
    "save": true,
    "cancel": true,
    "mod": true,
    "check": true,
    "del": false
  }
}
```

---

## editableRow: object

- 描述：行内编辑配置
- 是否必传：否
- 默认值：- ，即不开启行内编辑
- 可选值：-
- 例子

```json
{
  "editableRow": {
    "mode": "single" // 行内编辑模式：'single' 表示最多可以同时编辑一行；'multiple' 表示最多可以同时编辑多行
  }
}
```

---

## isSortBE: boolean

- 描述：是否开启后端排序功能。若开启了该功能，可以配合 sortFields 来使用
- 是否必传：否
- 默认值：false
- 可选值：true | false
- 例子

```json
{
  "isSortBE": true // 开启了后端排序功能
}
```

---

## sortFields: array

- 描述：后端排序字段
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "sortFields": ["人员编号", "部门名称"]
}
```

---

## isSortFE: boolean

- 描述：是否开启前端排序功能。若开启了该功能，可以配合 sortFns 来使用
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "isSortFE": true
}
```

---

## sortFns: array

- 描述：前端排序配置。开启了前端排序功能，则必须传入此前端排序配置数组
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "sortFns": [
    {
      "text": "人员编号", // 要排序字段的名称
      "sortFn": (a, b) => a.C3_582216497309 - b.C3_582216497309 // 排序函数。a 和 b 为对象，包含了本行数据。需要使用内部字段，来进行排序
    }
  ]
}
```

---

## tableSize: string

- 描述：表格尺寸
- 是否必传：否
- 默认值："default"
- 可选值："default" 默认尺寸表格 | "small" 小尺寸表格
- 例子

```json
{
  "tableSize": "small"
}
```

---

## columnWidth: number

- 描述：列宽度
- 是否必传：否
- 默认值：200，即 "200px"
- 可选值：-
- 例子

```json
{
  "columnWidth": 300 // 表格中的每列宽度变为 300
}
```

---

## customColumnWidth: object

- 描述：自定义某列宽度
- 是否必传：否
- 默认值：-
- 可选值：-
- 例子

```json
{
  "customColumnWidth": { "人员编号": 100, "部门名称": 300 } // 人员编号列宽度设为 100px；部门名称列宽度设为 300px；其他列宽度使用默认的 200px
}
```

---

## opWidth: number

- 描述：操作列的宽度
- 是否必传：否
- 默认值：200
- 可选值：-
- 例子

```json
{
  "opWidth": 100 // 操作列宽度设为 100px
}
```

---
