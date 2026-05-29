# 项目代码规范

## 代码风格规范

### Vue 组件结构

#### 组件文件结构顺序
1. `<script setup lang="ts">` - 脚本部分
2. `<template>` - 模板部分
3. `<style lang="scss" scoped>` - 样式部分

#### Script Setup 顺序
```vue
<script setup lang="ts">
// 1. 类型导入 (import type)
import type { ButtonProps } from './type.ts'

// 2. Vue 相关导入
import { computed, ref, type VNode } from 'vue'

// 3. Element Plus 组件导入
import { ElButton } from 'element-plus'

// 4. 项目内部导入
import { useCountdown } from '@ld-v3-kit/composables'

// 5. defineModel (如需要) - 放在前面因为其他响应式数据可能依赖它
const visible = defineModel('modelValue', {
  type: Boolean,
  default: false
})

// 6. defineSlots (如需要)
defineSlots<{
  default: () => VNode
}>()

// 7. defineProps
const props = withDefaults(defineProps<ButtonProps>(), {
  type: ''
})

// 8. defineEmits
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// 9. Composables - 和工具函数 - 放在响应式数据之前，因为通常会被依赖
const { time, isTiming, start, stop, reset } = useCountdown(10, () => {
  // ...
});

// 10. 响应式数据
const loading = ref(false)

// 11. 计算属性 - 依赖于上面的响应式数据和 composables
const bindProps = computed(() => {
  // ...
})

// 12. 方法定义 - 依赖于上面的所有
const handleClick = () => {
  // ...
}

// 13. defineExpose - 暴露给父组件的接口
defineExpose({
  // ...
})
</script>
```

### 命名规范

#### 文件命名
- 组件文件：使用 PascalCase（大驼峰），如 `LdTable.vue`
- 类型文件：使用 `type.ts`，如 `Table/src/type.ts`
- composables 文件：使用 camelCase（小驼峰），如 `useCountdown.ts`
- utils 文件：使用 kebab-case（短横线链接），如 `deep-merge.ts`
- 组件目录：使用 kebab-case，如 `button-group/`
- composables 目录：使用 camelCase（小驼峰），如 `useCountdown/`

#### 组件命名
- 组件名：使用 PascalCase，如 `LdTable`
- 组件导出：通过 `index.ts` 导出，如 `packages/components/table/index.ts`
- 全局注册前缀：默认使用 `Ld`，如 `LdTable`

#### 变量和函数命名
- 变量：使用 camelCase，如 `bindProps`
- 函数：使用 camelCase，如 `handleClick`
- 常量：使用 camelCase 或 PAGINATION_SPACING（根据使用场景）
- Props：使用 camelCase，如 `closeOnClickModal`

#### 事件命名
- 自定义事件：使用 kebab-case，如 `@click`、`@update:model-value`
- 事件处理函数：使用 `handle` 前缀 + PascalCase，如 `handleClick`

#### CSS 类名
- 使用 BEM 命名规范
- 格式：`${prefix}-${block}__${element}--${modifier}`
- 示例：`ld-button`

### TypeScript 规范

#### 类型定义
- 类型定义单独放在 `type.ts` 文件中
- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型、工具类型等
- 类型文件位置：`packages/components/{component}/src/type.ts`

#### 类型导入
- 使用 `import type` 导入类型，与值导入分开
```typescript
import type { ButtonProps } from './type.ts'
import { ElButton } from 'element-plus'
```

#### Props 类型定义
- 继承 Element Plus 组件类型并扩展
- 使用 `Partial` 和 `Omit` 工具类型
```typescript
export interface ButtonProps extends Partial<Omit<ElButtonProps, 'type'>> {
  type?: 'add' | 'edit' | 'delete' | '' | ElButtonProps['type']
}
```

#### 泛型使用
- 在 composables 和工具函数中使用泛型提高类型安全
```typescript
type ArrayAble<T> = T[] | T;
type Events =
  | ArrayAble<string>
  | ArrayAble<keyof WindowEventMap>
  | ArrayAble<keyof DocumentEventMap>;
type Listeners = ArrayAble<EventListenerOrEventListenerObject>;
type ListenerAndOptions = [
  EventListenerOrEventListenerObject,
  (boolean | AddEventListenerOptions)?,
];
```

### 组件开发规范

#### Props 定义
- 使用 `defineProps<PropsType>()` 定义 props
- 使用 `withDefaults()` 设置默认值
- Props 类型必须从 `type.ts` 导入

#### Emits 定义
- 使用 `defineEmits<{ (e: 'eventName', ...args): void }>()` 定义事件
- 事件名使用 kebab-case

#### 组件导出
- 每个组件目录必须有 `index.ts` 文件
- 导出组件实例类型：`export type LdTableInstance = ComponentPublicInstance & InstanceType<typeof Table> & unknown;`
- 默认导出组件：`export const LdTable = withInstall(Table);`

#### 组件注册
- 在 `packages/components/index.ts` 中统一导出所有组件
- 在 `packages/ld-v3-kit/components.ts` 中统一注册所有组件

### 工具函数和 Composables

#### Composables 命名
- 使用 `use` 前缀，如 `useCountdown`
- Composables 文件放在 `packages/composables/` 目录
- 通过 `packages/composables/index.ts` 统一导出

#### 工具函数
- 工具函数放在 `packages/utils/` 目录
- 通过 `packages/utils/index.ts` 统一导出
- 使用 TypeScript 严格类型

### 样式规范

#### SCSS 使用
- 使用 `<style lang="scss" scoped>` 定义组件样式
- 使用 scoped 避免样式污染

### 代码质量

#### ESLint 规则
- Vue 组件顺序：`[['script', 'template'], 'style']`
- 自定义事件使用 kebab-case
- 箭头函数参数需要括号
- 不使用尾随逗号
- 单行大括号允许

#### 注释规范
- 使用 JSDoc 注释描述函数和类型
- 复杂逻辑添加注释说明
```typescript
/**
 * 格式化日期
 * @param format 日期格式字符串
 * @param date 要格式化的日期对象
 * @returns 格式化后的日期字符串
 */
export function dateFormatter(format = 'YYYY-MM-DD HH:mm:ss', date = new Date()) {
  // ...
}
```

### 项目结构

```
packages/
  components/          # 组件目录
    {component}/       # 组件目录(kebab-case)
      index.ts         # 组件导出
      README.md        # 组件说明
      __tests__/       # 组件测试目录(私有)
      __demos__/       # 组件演示目录(私有)
      style/           # 组件样式目录
      src/
        {xxx}.ts       # 工具函数(可选,只服务当前组件)
        {component}.vue # 组件实现(PascalCase)
        type.ts        # 类型定义
  composables/         # 自定义组合式函数目录
    index.ts           # 组合式函数导出
    {composable}/      # 组合式函数目录(camelCase)
      index.ts         # 组合式函数实现
      README.md        # 组合式函数说明
      __tests__/       # 测试目录(私有)
      __demos__/       # 演示目录(私有)
  utils/               # 工具函数目录
    index.ts           # 工具函数导出
    {util}/            # 工具函数目录(kebab-case)
      index.ts         # 工具函数实现
      README.md        # 工具函数说明
      __tests__/       # 测试目录(私有)
      __demos__/       # 演示目录(私有)
  types/               # 全局类型定义
  styles/              # 全局样式目录
  ld-v3-kit/           # 包主入口目录
```