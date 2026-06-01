<script setup lang="ts">
  import { useResizeObserver } from '@ld-v3-kit/composables';
  import { ref, useTemplateRef, useAttrs, computed, nextTick } from 'vue';

  import type { LdTableEmits, LdTablePaginationProps, LdTableProps, LdTableSlots } from './LdTable';

  defineOptions({
    name: 'LdTable',
  });

  const elTableRef = useTemplateRef('elTableRef');
  const paginationRef = useTemplateRef('paginationRef');
  const paginationHeight = ref(0);
  // 分页器与表格之间的间距常量
  const PAGINATION_SPACING = 6;
  useResizeObserver(paginationRef, (entries) => {
    const entry = entries[0];
    if (entry) {
      requestAnimationFrame(() => {
        paginationHeight.value = entry.contentRect.height;
      });
    }
  });

  const props = withDefaults(defineProps<LdTableProps>(), {
    columns: () => [],
    fit: true,
    showHeader: true,
    stripe: undefined,
    border: undefined,
    size: undefined,
    emptyHeight: '100%',
    emptyText: '暂无数据',
  });
  // const instance = getCurrentInstance();
  const attrs = useAttrs();
  const emits = defineEmits<LdTableEmits>();
  const slots = defineSlots<LdTableSlots>();

  // 合并分页组件配置
  const mergedPaginationOptions = computed(() => {
    const defaultOptions: Partial<LdTablePaginationProps> = {
      pageSizes: [10, 20, 30, 50, 100],
      align: 'center',
      background: true,
      layout: 'total, prev, pager, next, sizes, jumper',
      hideOnSinglePage: false,
      size: 'default',
      pagerCount: 7,
    };

    return { ...defaultOptions, ...props.paginationOptions } as LdTablePaginationProps;
  });
  // 空数据判断
  const isEmpty = computed(() => {
    return props.data && props.data.length === 0;
  });
  // 表格高度逻辑
  const tableHeight = computed(() => {
    // 空数据且非加载状态时固定高度
    if (isEmpty.value && !props.loading) return props.emptyHeight;
    // 使用传入的高度
    if (props.height) return props.height;
    // 默认占满容器高度
    return '100%';
  });
  // 容器高度计算
  const containerHeight = computed(() => {
    const matchPaginationHeight = showPagination.value ? paginationHeight.value : 0;
    const offset = matchPaginationHeight + PAGINATION_SPACING;
    return {
      height: offset === 0 ? '100%' : `calc(100% - ${offset}px)`,
    };
  });

  const mergedTableProps = computed(() => {
    return {
      ...attrs,
      ...props,
      height: tableHeight.value,
    };
  });

  const showPagination = computed(() => {
    return props.pagination && !isEmpty.value;
  });

  // 合并空状态组件配置
  const mergedEmptyOptions = computed(() => {
    const defaultOptions = {
      description: props.emptyText,
      imageSize: 120,
    };
    return { ...defaultOptions, ...props.emptyOptions };
  });

  const tableColumns = computed(() => {
    return props.columns
      .map((column) => ({
        hidden: column.hidden ?? false,
        ...column,
      }))
      .filter((column) => !column.hidden);
  });

  const getGlobalIndex = (index: number) => {
    if (!props.pagination) return index + 1;
    const { currentPage = 1, pageSize = 10 } = props.pagination;

    return isNaN((currentPage - 1) * pageSize + index + 1)
      ? index + 1
      : (currentPage - 1) * pageSize + index + 1;
  };
  const handleSizeChange = (size: number) => {
    emits('pagination:size-change', size);
  };
  const handleCurrentChange = (current: number) => {
    emits('pagination:current-change', current);
    scrollToTop(); // 页码改变后滚动到表格顶部
  };
  const handlePaginationChange = (pageSize: number, currentPage: number) => {
    emits('pagination:change', pageSize, currentPage);
  };
  const handlePrevClick = (currentPage: number) => {
    emits('pagination:prev-click', currentPage);
  };
  const handleNextClick = (currentPage: number) => {
    emits('pagination:next-click', currentPage);
  };
  // 滚动表格内容到顶部
  const scrollToTop = () => {
    nextTick(() => {
      if (elTableRef.value) {
        elTableRef.value.setScrollTop(0);
      }
    });
  };

  defineExpose({
    elTableRef,
    paginationRef,
  });
</script>

<template>
  <div class="ld-table" :class="{ 'ld-table--empty': isEmpty }" :style="containerHeight">
    <el-table ref="elTableRef" v-loading="!!loading" v-bind="mergedTableProps">
      <template v-for="col in tableColumns">
        <!-- 渲染全局序号列 -->
        <el-table-column
          v-if="col.type === 'globalIndex'"
          v-bind="{ ...col }"
          :key="'globalIndex-' + (col.prop || col.type)"
          :fixed="col.fixed || 'left'"
          :align="col.align || 'center'"
          :header-align="col.headerAlign || 'center'"
        >
          <template #header="{ column, $index }">
            <slot :name="`${column.prop}-header`" :column="column" :index="$index">
              <span>{{ col.label || '序号' }}</span>
            </slot>
          </template>
          <template #default="{ row, column, $index }">
            <slot :name="`${column.prop}`" :row="row" :column="column" :index="$index">
              <span>{{ getGlobalIndex($index) }}</span>
            </slot>
          </template>
        </el-table-column>

        <!-- 渲染列 -->
        <ld-table-column v-else :key="col.prop || col.label" :column="col">
          <template v-for="(_, slotName) in slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps" />
          </template>
        </ld-table-column>
      </template>
      <template #empty>
        <slot name="tableEmpty">
          <div v-if="loading"></div>
          <el-empty v-else v-bind="mergedEmptyOptions">
            <template v-if="slots['tableEmptyDescription']" #description>
              <slot name="tableEmptyDescription"></slot>
            </template>
            <template v-if="slots['tableEmptyImage']" #image>
              <slot name="tableEmptyImage"></slot>
            </template>
            <template v-if="slots['tableEmptyDefault']" #default>
              <slot name="tableEmptyDefault"></slot>
            </template>
          </el-empty>
        </slot>
      </template>
      <template #append>
        <slot name="tableAppend"></slot>
      </template>
    </el-table>

    <div
      v-if="showPagination"
      ref="paginationRef"
      class="ld-table__pagination ld-table__pagination--custom"
      :class="'ld-table__pagination--' + mergedPaginationOptions.align"
    >
      <el-pagination
        v-bind="mergedPaginationOptions"
        :total="pagination?.total"
        :disabled="loading"
        :page-size="pagination?.pageSize"
        :current-page="pagination?.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @change="handlePaginationChange"
        @prev-click="handlePrevClick"
        @next-click="handleNextClick"
      >
        <template v-if="slots['tablePaginationDefault']" #default>
          <slot name="tablePaginationDefault"></slot>
        </template>
      </el-pagination>
    </div>
  </div>
</template>
