<script setup lang="ts">
  defineOptions({
    name: 'LdTableColumn',
  });
  defineProps({
    column: {
      type: Object,
      default: () => ({}),
    },
  });
</script>
<template>
  <el-table-column v-bind="column">
    <!-- 表头插槽 -->
    <template
      v-if="
        (!column.children || column.children.length === 0) &&
        column.prop &&
        (column.useHeaderSlot || column.renderHeader)
      "
      #header="{ row, column: elColumn, $index }"
    >
      <!-- 自定义表头插槽 -->
      <template v-if="column.useHeaderSlot">
        <slot :name="`${column.prop}-header`" :row="row" :column="elColumn" :index="$index">
          {{ column.label }}
        </slot>
      </template>
      <!-- 自定义渲染表头插槽 -->
      <template v-else>
        <component
          :is="column.renderHeader({ row, elColumn, $index })"
          :row="row"
          :column="elColumn"
          :index="$index"
        />
      </template>
    </template>
    <!-- 内容插槽 -->
    <template
      v-if="
        (column.children && column.children.length > 0) ||
        ((column.useSlot || column.render) && column.prop)
      "
      #default="{ row, column: elColumn, $index }"
    >
      <template v-if="column.children && column.children.length > 0">
        <!-- 递归渲染子列 -->
        <ld-table-column
          v-for="childCol in column.children"
          :key="childCol.prop || childCol.label"
          :column="childCol"
        />
      </template>
      <!-- 自定义渲染内容插槽 -->
      <template v-else-if="column.useSlot">
        <slot :name="column.prop" :row="row" :column="elColumn" :index="$index">
          {{
            column.formatter
              ? column.formatter(row, elColumn, row[column.prop], $index)
              : row[column.prop]
          }}
        </slot>
      </template>
      <!-- 自定义渲染内容插槽 -->
      <template v-else>
        <component
          :is="column.render({ row, elColumn, $index })"
          :row="row"
          :column="elColumn"
          :index="$index"
        />
      </template>
    </template>
  </el-table-column>
</template>
