# 左侧主表右侧多表单组件

## mode: string

- 是否必传：是
- 描述： 模式（这里），这里必须选 'multiple'！
- 可选值：'single' | 'multiple'
- 默认值：-
- 例子

```json
"mode": 'multiple'
```

---

## navListResid: number

- 是否必传：是
- 描述： 获取导航列表的 resid
- 可选值：-
- 默认值：-
- 例子

```json
"navListResid": 591533333401
```

---

## resid: number

- 是否必传：是
- 描述： 获取导航列表的 resid
- 可选值：-
- 默认值：-
- 例子

```json
"navListResid": 591533333401
```

---

## noDataTip: string

- 是否必传：否
- 描述： 右侧没有数据时的提示文字
- 可选值：-
- 默认值：'暂无数据，请选择员工'
- 例子

```json
"noDataTip": '请选择员工'
```

---

## searchFields: array

- 是否必传：是
- 描述：搜索主表记录的内部字段
- 可选值：-
- 默认值：-
- 例子：表示会根据工号，内部字段为 "C3_227192472953" 的工号进行搜索主表记录

```json
"searchFields": [
    {
      "text": "工号",
      "innerFieldName": "C3_227192472953"
    }
  ]
```

---

## userInfoFields: array

- 是否必传：否
- 需要显示在左侧的字段
- 可选值：-
- 默认值：[]
- 例子：会将姓名、工号、职务、部门显示在左侧；label 表示 label 的值，innerFieldName 表示字段所对应的内部字段

```json
"userInfoFields": [
    {
      "label": "姓名",
      "innerFieldName": "C3_227192484125"
    },
    {
      "label": "工号",
      "innerFieldName": "C3_227192472953"
    },
    {
      "label": "职务",
      "innerFieldName": "C3_417990929305"
    },
    {
      "label": "部门",
      "innerFieldName": "C3_227212499515"
    }
  ]
```

---

## userFieldsViewConfig: boolean

- 是否必传：否
- 描述：左侧显示字段的视图配置
- 可选值：true | false
- 默认值：{ mode: 'block' }
- 例子：以 'inline' 模式显示，且占两列

```json
"userFieldsViewConfig": {
  "mode": "inline", // 模式，可以为 'block'（每个字段占一行）和 'inline'（每行可以放多个字段）
  "colCount": 2 // 当 mode 为 'inline' 时，每行所放字段的数量
}
```

---

## hasFieldsLabel: boolean

- 是否必传：否
- 描述：label 是否显示
- 可选值：true | false
- 默认值：true
- 例子：不显示 label，只在左侧显示字段值

```json
"hasFieldsLabel": false
```

---

## avatarFieldName: string

- 是否必传：否
- 描述：头像的内部字段
- 可选值：-
- 默认值：''
- 例子：

```json
"avatarFieldName": "C3_XXX"
```

---

## searchText: string

- 是否必传：否
- 描述：搜索的文案
- 可选值：-
- 默认值：'请选择员工'
- 例子：

```json
"searchText": "请选择人员"
```

---

## advSearchConfig: object

- 是否必传：是
- 描述：高级搜索配置
- 可选值：-
- 默认值：-
- 例子：

```json
"advSearchConfig": {
  "defaultVisible": false,
  "containerName": "drawer",
  "drawerWidth": 500,
  "labelWidth": "24%",
  "rowWidth": "100%",
  "dateRanges": [ // 日期范围搜索
    {
      "title": "事件日期", // 标题
      "visible": [ // 全部设为 false
        false,
        false,
        false,
        false
      ],
      "innerFieldName": "C3_591545408070" // 内部字段
    }
  ],
  "tag": [ // 标签选择式搜索
    {
      "title": '部门',
      "op": "or", // 操作符：'or' | 'and'
      "tags": [
        {
          "label": "OA",
          "value": "OA",
          "isSelected": false, // 默认是否被选中
          "innerFieldName": "C3_590510763625" // 内部字段名
        },
        {
          "label": "OPS",
          "value": "OPS",
          "isSelected": false, // 默认是否被选中
          "innerFieldName": "C3_590510763625"
        }
      ]
    }
  ],
  "search": [ // 输入框搜索，每一个对象对应一个搜索框
    {
      "title": "工号/姓名/部门",
      "innerFieldNames": [
        "C3_590510737521",
        "C3_590510740042",
        '"C3_590510763625"
      ]
  },
}
```
