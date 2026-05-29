# useResizeObserver

使用 `useResizeObserver` 监听 DOM 元素的尺寸变化，自动处理观察者的创建和销毁，避免内存泄漏。

## 用法

以下是使用 `useResizeObserver` 的多种场景及示例代码。

```ts
import { useResizeObserver } from "ld-v3-kit";
```

### 监听单个元素尺寸变化

监听单个 DOM 元素的尺寸变化，并在变化时执行回调函数。

```ts
import { ref } from 'vue'

const containerRef = ref<HTMLElement | null>(null)

useResizeObserver(containerRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    console.log('宽度:', entry.contentRect.width)
    console.log('高度:', entry.contentRect.height)
  }
})
```

### 监听多个元素尺寸变化

同时监听多个 DOM 元素的尺寸变化。

```ts
import { ref } from 'vue'

const box1Ref = ref<HTMLElement | null>(null)
const box2Ref = ref<HTMLElement | null>(null)

useResizeObserver([box1Ref, box2Ref], (entries) => {
  entries.forEach((entry) => {
    console.log('元素:', entry.target)
    console.log('尺寸:', entry.contentRect)
  })
})
```

### 监听组件实例

监听 Vue 组件实例的根元素尺寸变化。

```vue
<template>
  <div ref="componentRef">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const componentRef = ref<InstanceType<typeof SomeComponent> | null>(null)

useResizeObserver(componentRef, (entries) => {
  console.log('组件尺寸变化:', entries[0]?.contentRect)
})
</script>
```

### 设置观察选项

通过 `options` 参数设置观察选项，如 `box` 和 `devicePixelContentBoxSize`。

```ts
useResizeObserver(
  containerRef,
  (entries) => {
    console.log('尺寸变化:', entries[0]?.contentRect)
  },
  {
    box: 'content-box' // 'content-box' | 'border-box' | 'device-pixel-content-box'
  }
)
```

### 手动停止监听

通过返回的 `stop` 函数手动停止监听。

```ts
const { stop } = useResizeObserver(containerRef, (entries) => {
  console.log('尺寸变化:', entries[0]?.contentRect)
})

// 在需要时停止监听
stop()
```

### 检查浏览器支持

通过 `isSupported` 属性检查浏览器是否支持 ResizeObserver。

```ts
const { isSupported } = useResizeObserver(containerRef, (entries) => {
  console.log('尺寸变化:', entries[0]?.contentRect)
})

if (!isSupported.value) {
  console.warn('当前浏览器不支持 ResizeObserver')
}
```

### 在 Vue 组件中完整示例

```vue
<template>
  <div class="container" ref="containerRef">
    <p>容器宽度: {{ width }}px</p>
    <p>容器高度: {{ height }}px</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizeObserver } from '@ld-v3-kit/composables'

const containerRef = ref<HTMLElement | null>(null)
const width = ref(0)
const height = ref(0)

useResizeObserver(containerRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    width.value = Math.round(entry.contentRect.width)
    height.value = Math.round(entry.contentRect.height)
  }
})
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 200px;
  border: 1px solid #eee;
  padding: 20px;
}
</style>
```

## 类型声明

```ts
import { Ref, ComputedRef } from "vue";
import type { MaybeRef, MaybeRefOrGetter, ComponentPublicInstance } from "vue";

export interface UseResizeObserverReturn {
  isSupported: ComputedRef<boolean>; // 是否支持 ResizeObserver
  stop: () => void; // 停止监听的函数
}

export function useResizeObserver(
  target:
    | MaybeRefOrGetter<HTMLElement | SVGElement | ComponentPublicInstance | null | undefined>
    | MaybeRefOrGetter<HTMLElement | SVGElement | ComponentPublicInstance | null | undefined>[],
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
): UseResizeObserverReturn;
```

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `target` | `MaybeRefOrGetter<HTMLElement \| SVGElement \| ComponentPublicInstance \| null \| undefined> \| MaybeRefOrGetter[]` | 是 | 要观察的目标元素，可以是单个元素或元素数组，支持响应式引用 |
| `callback` | `ResizeObserverCallback` | 是 | 尺寸变化时的回调函数，接收 `ResizeObserverEntry[]` 作为参数 |
| `options` | `ResizeObserverOptions` | 否 | 观察选项，包含 `box` 属性 |

## 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isSupported` | `ComputedRef<boolean>` | 浏览器是否支持 ResizeObserver |
| `stop` | `() => void` | 手动停止观察的函数 |

::: details 点我查看代码
<<< @/packages/composables/useResizeObserver/index.ts
:::

## 注意事项

- **自动清理**：`useResizeObserver` 在组件卸载时会自动清理观察者，避免内存泄漏。
- **浏览器兼容性**：虽然现代浏览器普遍支持 ResizeObserver，但建议通过 `isSupported` 属性检查兼容性。
- **响应式目标**：支持响应式目标，当目标元素变化时会自动重新建立观察。
- **组件实例支持**：可以直接传入 Vue 组件实例，会自动获取其根元素。
