# useCountdown

使用`useCountdown`轻松实现倒计时功能。它提供了启动、停止和重置倒计时的方法，并允许用户在倒计时结束时执行自定义回调函数。同时可以减少重复代码，避免冗余，并确保在组件卸载时自动清理定时器，防止内存泄漏。

## 用法

以下是使用`useCountdown`的多种场景及示例代码。在这些示例中，假设你已经正确导入了`useCountdown`，如下所示：

```ts
import { useCountdown } from "ld-v3-kit";
```

### 创建一个倒计时

创建一个简单的倒计时，倒计时结束后触发回调函数。

```ts
const { time, isTiming, start, stop, reset } = useCountdown(10, () => {
  console.log("倒计时结束！");
});
```

### 启动倒计时

调用`start`方法启动倒计时。

```ts
start();
// 倒计时开始，每秒递减 time 的值，直到 time 为 0。
```

### 停止倒计时

调用`stop`方法停止倒计时。

```ts
stop();
// 停止倒计时，time 的值保持不变。
```

### 重置倒计时

调用`reset`方法重置倒计时。

```ts
reset();
// 重置倒计时，将 time 的值恢复为初始值，并停止倒计时。
```

### 自定义倒计时结束逻辑

在倒计时结束时执行自定义逻辑。

```ts
const handleEnd = () => {
  console.log("倒计时结束，执行自定义逻辑");
};
const { time, isTiming, start, stop, reset } = useCountdown(10, handleEnd);
```

### 在 Vue 组件中使用

```vue

<template>
  <div>
    <p>倒计时：{{ time }} 秒</p>
    <button @click="start" :disabled="isTiming">开始倒计时</button>
    <button @click="stop" :disabled="!isTiming">停止倒计时</button>
    <button @click="reset" :disabled="!isTiming">重置倒计时</button>
  </div>
</template>

<script setup lang="ts">
  import { useCountdown } from "ld-v3-kit";

  const { time, isTiming, start, stop, reset } = useCountdown(10, () => {
    alert("倒计时结束！");
  });
</script>
```

## 类型声明

```ts
import { Ref } from "vue";

export default function useCountdown(
  duration: number, // 倒计时的初始时长（秒）
  onCountdownEnd?: () => void // 倒计时结束时的回调函数
): {
  time: Ref<number>; // 当前倒计时的剩余时间
  isTiming: Ref<boolean>; // 是否正在倒计时
  start: () => void; // 启动倒计时
  stop: () => void; // 停止倒计时
  reset: () => void; // 重置倒计时
};
```
## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `duration` | `number` | 是 | 倒计时的初始时长（秒） |
| `onCountdownEnd` | `() => void` | 否 | 倒计时结束时的回调函数 |

## 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `time` | `Ref<number>` | 当前倒计时的剩余时间 |
| `isTiming` | `Ref<boolean>` | 是否正在倒计时 |
| `start` | `() => void` | 启动倒计时 |
| `stop` | `() => void` | 停止倒计时 |
| `reset` | `() => void` | 重置倒计时 |

::: details 点我查看代码
<<< @/packages/composables/useCountdown/index.ts
:::

## 注意事项

- **自动清理**：`useCountdown`在组件卸载时会自动清理定时器，避免内存泄漏。
- **并发启动**：如果倒计时已经在运行时调用 `start`方法，倒计时不会重复启动。
- **倒计时结束后的重置**：倒计时结束后，`reset`方法会被自动调用，将剩余时间恢复为初始值。
- **自定义逻辑**：可以通过 `onCountdownEnd`回调函数在倒计时结束时执行自定义逻辑。