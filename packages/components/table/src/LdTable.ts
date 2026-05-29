import type { EmptyProps, PaginationProps, TableColumnCtx, TableProps } from 'element-plus';
import type { VNode } from 'vue';

export interface LdTableEmits {
  (e: 'pagination:current-change', current: number): void;
  (e: 'pagination:size-change', size: number): void;
  (e: 'pagination:change', pageSize: number, currentPage: number): void;
  (e: 'pagination:prev-click', currentPage: number): void;
  (e: 'pagination:next-click', currentPage: number): void;
}

export interface LdTableSlots {
  default: (scope: unknown) => VNode[];
  tablePaginationDefault: (scope: unknown) => VNode[];
  tableEmpty: (scope: unknown) => VNode[];
  tableEmptyDefault: (scope: unknown) => VNode[];
  tableEmptyDescription: (scope: unknown) => VNode[];
  tableEmptyImage: (scope: unknown) => VNode[];
  tableAppend: (scope: unknown) => VNode[];
  [key: string]: (scope: unknown) => VNode[];
}

export interface LdTablePaginationConfig {
  // 总页数
  total: number;
  // 当前页码
  currentPage: number;
  // 每页显示条数
  pageSize: number;
}

// 表格列配置接口
export interface ColumnOption<T = unknown> {
  // 列类型
  type?: 'selection' | 'expand' | 'index' | 'globalIndex';
  // 列属性名
  prop?: string;
  // 列标题
  label?: string;
  // 列宽度
  width?: string | number;
  // 最小列宽度
  minWidth?: string | number;
  // 固定列
  fixed?: boolean | 'left' | 'right';
  // 是否可排序
  sortable?: boolean;
  // 过滤器选项
  filters?: unknown[];
  // 过滤方法
  filterMethod?: (value: unknown, row: T) => boolean;
  // 过滤器位置
  filterPlacement?: string;
  // 是否禁用
  disabled?: boolean;
  // 是否显示列
  visible?: boolean;
  // 是否选中显示
  checked?: boolean;
  // 自定义渲染函数
  formatter?: (row: T) => unknown;
  // 插槽相关配置
  // 是否使用插槽渲染内容
  useSlot?: boolean;
  // 插槽名称（默认为 prop 值）
  slotName?: string;
  // 是否使用表头插槽
  useHeaderSlot?: boolean;
  // 表头插槽名称（默认为 `${prop}-header`）
  headerSlotName?: string;
  // 自定义渲染插槽
  render?: (row: T) => VNode[];
  // 自定义渲染表头插槽
  headerRender?: (row: T) => VNode[];
  // 其他属性
  [key: string]: unknown;
}

export type TableSize = 'large' | 'default' | 'small';

export interface LdTableColumnProps extends Partial<TableColumnCtx<Record<string, unknown>>> {
  prop?: string;
  label?: string;
  type?: string;
  hidden?: boolean;
  fixed?: 'left' | 'right' | boolean;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
}

export interface LdTableConfig {
  columns: LdTableColumnProps[];
  loading?: boolean;
  pagination?: LdTablePaginationConfig;
  paginationOptions?: PaginationProps;
  emptyHeight?: string | number;
  emptyOptions?: EmptyProps;
  fit?: boolean;
  showHeader?: boolean;
  stripe?: boolean;
  border?: boolean;
  size?: TableSize;
  height?: string | number;
  emptyText?: string;
}

export type LdTableProps = LdTableConfig & Partial<TableProps<Record<string, unknown>>>;
export type LdTablePaginationProps = PaginationProps & {
  align?: 'left' | 'center' | 'right';
};
