# useEventListener

轻松使用 useEventListener 函数添加和清除 DOM 事件监听器，能够有效减少重复代码，避免冗余，同时防止因忘记卸载监听器或卸载不及时而产生的副作用。

## 用法

以下是使用 useEventListener 函数的多种不同场景及示例代码。在这些示例中，假设你已经正确导入了 useEventListener 函数，如下所示：

```ts
import { useEventListener } from "ld-v3-kit";
```

### 给一个 event 添加一个 listener

给 document 对象的 click 事件添加一个简单的监听器

```ts
const handleClick = (evt: Event) => {
  console.log(evt)
}
useEventListener(document, "click", handleClick);
// 当 click 事件被触发时，handleClick 函数将被调用，并且事件对象将作为参数传递给它。
```

### 给一个 event 添加多个 listener

为一个事件添加多个监听器，可以将这些监听器作为数组传递给 useEventListener 函数

```ts
const handleClick = (evt: Event) => {
  console.log(evt, "click handler 1");
};
const handleClick1 = (evt: Event) => {
  console.log(evt, "click handler 2");
};
useEventListener(document, "click", [handleClick, handleClick1]);
// 当 click 事件触发时，handleClick 和 handleClick1 函数将依次被调用，并且都将接收到事件对象作为参数。
```

### 给一个 event 添加一个 listener 且设置 listenerOptions

为单个监听器设置监听器选项，例如 capture、once、passive 等

```ts
const handleClick = (evt: Event) => {
  console.log(evt, "click");
};
useEventListener(document, "click", handleClick, { capture: true });
// 将 handleClick 监听器添加到 click 事件，并将 capture 选项设置为 true。这意味着事件将在捕获阶段触发该监听器
```

### 给一个 event 添加多个 listener 且设置相同 listenerOptions

为多个监听器设置相同的监听器选项

```ts
const handleClick = (evt: Event) => {
  console.log(evt, "click handler 1");
};
const handleClick1 = (evt: Event) => {
  console.log(evt, "click handler 2");
};
useEventListener(document, "click", [handleClick, handleClick1], { passive: true });
// handleClick 和 handleClick1 都将在 click 事件触发时被调用，并且它们都将使用 passive 选项，该选项可以提高性能，特别是在滚动等操作中。
```

### 给一个 event 添加多个 listener 且设置不同 listenerOptions

为多个监听器设置不同的监听器选项时，可以将监听器和选项作为元组传递

```ts
const handleClick = (evt: Event) => {
  console.log(evt, "click handler 1");
};
const handleClick1 = (evt: Event) => {
  console.log(evt, "click handler 2");
};
useEventListener(document, "click", [[handleClick, { capture: true }], [handleClick1, { once: true }]], undefined, false);
// handleClick 监听器将使用 capture 选项，而 handleClick1 监听器将使用 once 选项，意味着它只会被调用一次。
```

### 给多个 event 添加一个相同 listener

为多个事件添加相同的监听器，可以将事件列表作为数组传递

```ts

const handleEnd = (evt: Event) => {
  console.log(evt, "end event handler");
};
useEventListener(document, ["mouseup", "mouseleave"], handleEnd);
// 当 mouseup 或 mouseleave 事件触发时，handleEnd 函数将被调用
```

### 给多个 event 添加多个相同 listener

为多个事件添加多个相同的监听器，你可以将监听器列表和事件列表都作为数组传递。

```ts
const handleEnd = (evt: Event) => {
  console.log(evt, "end event handler 1");
};
const handleEnd1 = (evt: Event) => {
  console.log(evt, "end event handler 2");
};
useEventListener(document, ["mouseup", "mouseleave"], [handleEnd, handleEnd1]);
// 当 mouseup 或 mouseleave 事件触发时，handleEnd 和 handleEnd1 函数将依次被调用。
```

### 多个 event 一一对应 listener

对于多个事件和多个监听器，可以使用以下方式来实现一一对应关系。

1. 将监听器作为元组传递,默认是一一对应关系绑定

> 作为元组传递且不想一一对应关系, 需要设置第四个参数为 false,
> 对于 listenerOptions(第三个参数) 不需要设置时要用 undefined 占位

```ts
const handleMouseup = (evt: Event) => {
  console.log(evt, "mouseup handler");
};
const handleMouseleave = (evt: Event) => {
  console.log(evt, "mouseleave handler");
};
useEventListener(document, ["mouseup", "mouseleave"], [[handleMouseup], [handleMouseleave]]);
// useEventListener(document, ["mouseup", "mouseleave"], [[handleMouseup], [handleMouseleave]], undefined, false);
```

2. 监听器作为数组传递, 则需要第四个参数为 true, 对于 listenerOptions(第三个参数) 不需要设置时要用 undefined 占位

```ts
const handleMouseup = (evt: Event) => {
  console.log(evt, "mouseup handler");
};
const handleMouseleave = (evt: Event) => {
  console.log(evt, "mouseleave handler");
};
useEventListener(document, ["mouseup", "mouseleave"], [handleMouseup, handleMouseleave], undefined, true);
```

## 清理监听器

useEventListener 函数会返回一个清理函数，你可以在需要时调用它来手动清理事件监听器。

> 默认在绑定的 target 对象更新时,会先调用清理函数,再尝试绑定事件和如果当前 effectScope 销毁前会调用清理函数

```ts
const handleClick = (evt: Event) => {
  console.log(evt)
}
const stop = useEventListener(document, "click", handleClick);
// 当不再需要监听事件时，调用清理函数
stop();
```

## 类型声明

```ts
import type { ComponentPublicInstance, MaybeRef, MaybeRefOrGetter } from "vue";
import { getCurrentScope, onScopeDispose, toValue, watch } from "vue";

type EventListenerTarget = MaybeRefOrGetter<
  EventTarget | HTMLElement | Window | Document | null | undefined
>;
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
export default function useEventListener(
  target: EventListenerTarget,
  events: Events,
  listeners: ListenerAndOptions[] | Listeners,
  options?: boolean | AddEventListenerOptions,
  mapping?: boolean,
): () => void
```
## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `target` | `EventListenerTarget` | 是 | 要监听的事件目标，可以是 DOM 元素、窗口、文档等 |
| `events` | `Events` | 是 | 要监听的事件列表，可以是单个事件或事件数组 |
| `listeners` | `Listeners` | 是 | 要添加的事件监听器列表，可以是单个监听器或监听器数组 |
| `options` | `boolean \| AddEventListenerOptions` | 否 | 事件监听器选项，如捕获、一次触发等 |
| `mapping` | `boolean` | 否 | 是否是一一对应关系绑定，默认 true |

## 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `stop` | `() => void` | 手动停止监听的函数 |

::: details 点我查看代码
<<< @/packages/composables/useEventListener/index.ts
:::

## 注意事项

- **自动清理**：`useEventListener`在组件卸载时会自动清理事件监听器，避免内存泄漏。