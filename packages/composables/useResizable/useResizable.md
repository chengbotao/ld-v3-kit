# useResizable

使用 `useResizable` 可以让元素支持鼠标拖拽调整大小，提供丰富的配置选项，包括方向限制、最小/最大尺寸约束、安全区域保护等。

## 用法

以下是使用 `useResizable` 的多种场景及示例代码。

```ts
import { useResizable } from 'ld-v3-kit'
```

### 基本用法

监听单个 DOM 元素的尺寸变化，并在变化时执行回调函数。

```vue
<template>
  <div class="resizable-box" ref="boxRef">
    <p>拖拽边缘调整大小</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizable } from 'ld-v3-kit'

const boxRef = ref<HTMLElement | undefined>()
const enabled = ref(true)

const { restoreOriginalStyle } = useResizable(
  boxRef,
  () => enabled.value,
  200,  // minWidth
  200,  // minHeight
  800,  // maxWidth
  600   // maxHeight
)
</script>

<style scoped>
.resizable-box {
  width: 300px;
  height: 200px;
  border: 1px solid #ddd;
  padding: 20px;
}
</style>
```

### 限制调整方向

通过 `enabledEdges` 参数限制只允许某些方向的调整。

```vue
<template>
  <div class="resizable-box" ref="boxRef">
    <p>只能左右调整宽度</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizable, type ResizeDirection } from 'ld-v3-kit'

const boxRef = ref<HTMLElement | undefined>()

useResizable(
  boxRef,
  () => true,
  200,                    // minWidth
  200,                    // minHeight
  0,                      // maxWidth (0 表示无限制)
  0,                      // maxHeight (0 表示无限制)
  ['e', 'w'] as ResizeDirection[]  // 只允许左右拖拽
)
</script>
```

### 四角拖拽

如果只需要四角方向的调整（适合改变宽高比）。

```vue
<template>
  <div class="resizable-box" ref="boxRef">
    <p>只能四角拖拽调整</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizable, type ResizeDirection } from 'ld-v3-kit'

const boxRef = ref<HTMLElement | undefined>()

useResizable(
  boxRef,
  () => true,
  100,
  100,
  0,
  0,
  ['ne', 'nw', 'se', 'sw'] as ResizeDirection[]  // 只允许四角拖拽
)
</script>
```

### 安全区域约束

通过 `safeArea` 参数防止调整大小时元素超出视口或进入指定区域。

```vue
<template>
  <div class="container">
    <header>固定头部</header>
    <div class="resizable-box" ref="boxRef">
      <p>不会超出视口和安全区域</p>
    </div>
    <footer>固定底部</footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizable } from 'ld-v3-kit'

const boxRef = ref<HTMLElement | undefined>()

useResizable(
  boxRef,
  () => true,
  200,
  200,
  0,
  0,
  ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
  {
    top: 60,    // 顶部安全距离（ header 高度）
    left: 0,
    bottom: 60,  // 底部安全距离（ footer 高度）
    right: 0
  }
)
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
header, footer {
  height: 60px;
  background: #f5f5f5;
}
.resizable-box {
  flex: 1;
  border: 1px solid #ddd;
  margin: 10px;
  padding: 20px;
}
</style>
```

### 条件启用/禁用

通过函数参数动态控制是否启用调整大小功能。

```vue
<template>
  <button @click="toggleResizable">
    {{ resizable ? '禁用调整大小' : '启用调整大小' }}
  </button>
  <div class="resizable-box" ref="boxRef">
    <p>{{ resizable ? '可以拖拽调整大小' : '已禁用调整大小' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizable } from 'ld-v3-kit'

const boxRef = ref<HTMLElement | undefined>()
const resizable = ref(true)

const toggleResizable = () => {
  resizable.value = !resizable.value
}

useResizable(
  boxRef,
  () => resizable.value
)
</script>
```

### 恢复原始样式

通过返回的 `restoreOriginalStyle` 方法恢复元素的原始样式（取消绝对定位）。

```vue
<template>
  <button @click="restore">恢复原始样式</button>
  <div class="resizable-box" ref="boxRef">
    <p>拖拽调整后可以恢复</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResizable } from 'ld-v3-kit'

const boxRef = ref<HTMLElement | undefined>()

const { restoreOriginalStyle } = useResizable(boxRef, () => true)
</script>
```

### 完整示例

一个带拖拽调整大小的可缩放面板。

```vue
<template>
  <div class="demo-container">
    <div class="panel-wrapper">
      <div class="resizable-panel" ref="panelRef">
        <div class="panel-header">可调整大小的面板</div>
        <div class="panel-content">
          <p>当前尺寸: {{ width }} × {{ height }}</p>
          <p>拖拽边缘或角落调整大小</p>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="resetSize">重置尺寸</button>
      <button @click="toggleDirection">
        {{ onlyHorizontal ? '当前: 仅水平' : '当前: 所有方向' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useResizable, type ResizeDirection } from 'ld-v3-kit'

const panelRef = ref<HTMLElement | undefined>()
const width = ref(0)
const height = ref(0)
const onlyHorizontal = ref(false)

let edges: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

const { restoreOriginalStyle } = useResizable(
  panelRef,
  () => true,
  200,    // minWidth
  150,    // minHeight
  0,      // maxWidth (无限制)
  0,      // maxHeight (无限制)
  edges,
  { top: 10, left: 10, bottom: 10, right: 10 }
)

const updateSize = () => {
  if (panelRef.value) {
    width.value = panelRef.value.offsetWidth
    height.value = panelRef.value.offsetHeight
  }
}

const resetSize = () => {
  restoreOriginalStyle()
  if (panelRef.value) {
    panelRef.value.style.width = '400px'
    panelRef.value.style.height = '300px'
  }
}

const toggleDirection = () => {
  onlyHorizontal.value = !onlyHorizontal.value
  edges = onlyHorizontal.value ? ['e', 'w'] : ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
}

onMounted(updateSize)
</script>

<style scoped>
.demo-container {
  padding: 20px;
}
.panel-wrapper {
  width: 100%;
  height: 400px;
  position: relative;
  background: #fafafa;
}
.resizable-panel {
  position: absolute;
  left: 50px;
  top: 50px;
  width: 400px;
  height: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.panel-header {
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #eee;
  font-weight: 500;
}
.panel-content {
  padding: 16px;
}
.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #f5f5f5;
}
</style>
```

## 类型声明

```ts
import type { Ref } from 'vue';

/** 调整方向类型 */
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** 安全区域配置 */
interface SafeArea {
  top: number;    // 顶部安全距离
  left: number;    // 左侧安全距离
  bottom: number;  // 底部安全距离
  right: number;   // 右侧安全距离
}

export interface UseResizableReturn {
  onResizable: () => void;      // 手动绑定拖拽事件
  offResizable: () => void;     // 手动解绑拖拽事件
  restoreOriginalStyle: () => void;  // 恢复原始样式
}

export function useResizable(
  targetRef: Ref<HTMLElement | undefined>,
  resizable: () => boolean,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number,
  enabledEdges?: ResizeDirection[],
  safeArea?: SafeArea
): UseResizableReturn;
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `targetRef` | `Ref<HTMLElement \| undefined>` | — | 目标元素的引用 |
| `resizable` | `() => boolean` | — | 控制是否启用调整大小的函数 |
| `minWidth` | `number` | `200` | 最小宽度（px） |
| `minHeight` | `number` | `200` | 最小高度（px） |
| `maxWidth` | `number` | `0` | 最大宽度（px），`0` 表示无限制 |
| `maxHeight` | `number` | `0` | 最大高度（px），`0` 表示无限制 |
| `enabledEdges` | `ResizeDirection[]` | `['n','s','e','w','ne','nw','se','sw']` | 启用的调整方向 |
| `safeArea` | `SafeArea` | `{ top: 0, left: 0, bottom: 0, right: 0 }` | 安全区域配置，防止元素超出 |

### ResizeDirection 可选值

| 值 | 说明 |
|----|------|
| `'n'` | 上（北）- 调整高度 |
| `'s'` | 下（南）- 调整高度 |
| `'e'` | 右（东）- 调整宽度 |
| `'w'` | 左（西）- 调整宽度 |
| `'ne'` | 右上 - 调整宽度和高度 |
| `'nw'` | 左上 - 调整宽度和高度 |
| `'se'` | 右下 - 调整宽度和高度 |
| `'sw'` | 左下 - 调整宽度和高度 |

### SafeArea 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `top` | `number` | 顶部安全距离（px） |
| `left` | `number` | 左侧安全距离（px） |
| `bottom` | `number` | 底部安全距离（px） |
| `right` | `number` | 右侧安全距离（px） |

## 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `onResizable` | `() => void` | 手动绑定拖拽事件（通常不需要手动调用） |
| `offResizable` | `() => void` | 手动解绑拖拽事件（通常不需要手动调用） |
| `restoreOriginalStyle` | `() => void` | 恢复元素的原始样式（取消绝对定位转换） |

::: details 点我查看代码
<<< @/packages/composables/useResizable/index.ts
:::

## 原理说明

### 定位转换

当用户开始拖拽调整大小时，`useResizable` 会自动将目标元素的 `position` 转换为 `absolute`，以便通过 `left`、`top`、`width`、`height` 来调整大小。原始的 `position` 样式会被保存，在调用 `restoreOriginalStyle()` 后会恢复。

### 拖拽检测

组件通过检测鼠标位置与元素边缘的距离（默认 `5px`）来判断用户是否在拖拽边缘。如果鼠标在边缘区域内，则触发对应的拖拽方向。

### 安全区域

安全区域用于防止调整大小时元素超出视口或进入其他固定元素（如固定头部、底部导航等）。每次调整后都会应用安全区域约束。

## 注意事项

- **自动清理**：`useResizable` 在组件卸载时会自动解绑所有事件监听，避免内存泄漏。
- **定位影响**：拖拽调整大小时会改变元素的 `position` 为 `absolute`，如需恢复可调用 `restoreOriginalStyle()`。
- **边缘检测**：默认 `5px` 的边缘检测区域，可以通过修改代码中的 `resizeHandleSize` 常量来调整。
- **安全区域**：安全区域是相对于视口边缘计算的，不包括元素当前的实际位置。
- **手势冲突**：如果元素内部有可拖拽子元素（如拖拽排序），需要注意事件冒泡可能导致的冲突。
