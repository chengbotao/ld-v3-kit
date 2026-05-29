import type { ComponentPublicInstance, MaybeRef, MaybeRefOrGetter } from 'vue';
import { getCurrentScope, onScopeDispose, toValue, watch } from 'vue';
import { noop } from '@ld-v3-kit/utils';

export type EventListenerTarget = MaybeRefOrGetter<
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
export function useEventListener(
  target: EventListenerTarget,
  events: Events,
  listeners: ListenerAndOptions[] | Listeners,
  options?: boolean | AddEventListenerOptions,
  mapping?: boolean,
) {
  if (!target) return noop;
  events = Array.isArray(events) ? events : [events];
  listeners = Array.isArray(listeners) ? listeners : [listeners];
  listeners = listeners.map((listener) => {
    if (Array.isArray(listener)) {
      mapping = mapping ?? true;
      return [listener[0], listener[1] ?? options];
    } else {
      mapping = mapping ?? false;
      return [listener, options];
    }
  }) as ListenerAndOptions[];

  let cleanups: (() => void)[] = [];
  const cleanup = () => {
    cleanups.forEach((fn) => fn());
    cleanups = [];
  };

  const register = (
    target: EventTarget | HTMLElement | Window | Document,
    event: keyof WindowEventMap | keyof DocumentEventMap | string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    target.addEventListener(event, listener, options);
    return () => target.removeEventListener(event, listener, options);
  };

  const stopWatch = watch(
    () =>
      (
        toValue(
          target as unknown as MaybeRef<
            HTMLElement | SVGElement | ComponentPublicInstance | undefined | null
          >,
        ) as ComponentPublicInstance
      )?.$el ?? toValue(target),

    (el) => {
      cleanup();
      if (!el) return;
      cleanups.push(
        ...events.flatMap((event, i) => {
          if (!mapping) {
            return listeners.map((listener) =>
              register(el, event, ...(listener as ListenerAndOptions)),
            );
          }
          return [register(el, event, ...(listeners[i] as ListenerAndOptions))];
        }),
      );
    },
    { immediate: true, flush: 'post' },
  );

  const stop = () => {
    stopWatch();
    cleanup();
  };

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return stop;
}
