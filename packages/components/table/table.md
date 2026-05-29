# Table

> 基于 Element Plus 的 el-table 和 el-pagination 组件封装的高级表格组件，提供了更便捷的配置方式和增强的功能，包括动态列配置、自定义渲染、嵌套列支持、分页集成等。

## 基本用法

::: demo table/__demos__/BasicTable
通过 `data` 和 `columns` 属性配置表格数据和列信息。
:::

## 分页功能

::: demo table/__demos__/PaginationTable
通过 `pagination` 属性配置分页信息，支持分页事件监听。
:::


## API

### Attributes

> 支持 [`el-table`](https://element-plus.org/zh-CN/component/table.html) 属性

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| data | 表格数据 | `any[]` | `[]` |
| columns | 列配置数组 | `LdTableColumn[]` | `[]` |
| pagination | 分页配置 | `LdTablePaginationProps` | — |

### Columns 列配置

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| prop | 字段名 | `string` | — |
| label | 列标题 | `string` | — |
| type | 列类型，`globalIndex` 表示全局序号列 | `'globalIndex' \| string` | — |
| width | 列宽度 | `string \| number` | — |
| minWidth | 最小宽度 | `string \| number` | — |
| fixed | 是否固定列 | `'left' \| 'right' \| boolean` | — |
| align | 对齐方式 | `'left' \| 'center' \| 'right'` | — |
| headerAlign | 表头对齐方式 | `'left' \| 'center' \| 'right'` | — |
| hidden | 是否隐藏 | `boolean` | `false` |
| sortable | 是否可排序 | `boolean \| 'custom'` | — |

### Pagination 分页配置

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| currentPage | 当前页码 | `number` | `1` |
| pageSize | 每页条数 | `number` | `10` |
| total | 总条数 | `number` | `0` |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| pagination:size-change | `(size: number)` | 每页条数改变时触发 |
| pagination:current-change | `(current: number)` | 当前页码改变时触发 |
| pagination:change | `(pageSize: number, currentPage: number)` | 分页信息改变时触发 |
| pagination:prev-click | `(currentPage: number)` | 点击上一页时触发 |
| pagination:next-click | `(currentPage: number)` | 点击下一页时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义列内容 |
| tableEmpty | 自定义空状态内容 |
| tableEmptyDescription | 自定义空状态描述 |
| tableEmptyImage | 自定义空状态图片 |
| tableEmptyDefault | 自定义空状态默认内容 |
| tableAppend | 表格尾部内容 |
| tablePaginationDefault | 分页器自定义内容 |
| {prop}-header | 自定义列表头，如 `id-header` |
| {prop} | 自定义列内容，如 `id` |

### Expose

| 属性名 | 类型 | 说明 |
|--------|------|------|
| elTableRef | `Ref<InstanceType<typeof ElTable>>` | 内部 el-table 实例 |
| paginationRef | `Ref<HTMLElement>` | 分页器容器引用 |
