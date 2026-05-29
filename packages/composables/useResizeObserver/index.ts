import {
  computed,
  toValue,
  watch,
  getCurrentScope,
  onScopeDispose,
  type MaybeRef,
  type MaybeRefOrGetter,
  type ComponentPublicInstance,
} from 'vue';

function unrefElement(
  el: MaybeRef<HTMLElement | SVGElement | ComponentPublicInstance | undefined | null>,
) {
  const _el = toValue(el);
  return (_el as ComponentPublicInstance)?.$el ?? _el;
}

export const useResizeObserver = (
  target:
    | MaybeRefOrGetter<HTMLElement | SVGElement | ComponentPublicInstance | null | undefined>
    | MaybeRefOrGetter<HTMLElement | SVGElement | ComponentPublicInstance | null | undefined>[],
  callback: ResizeObserverCallback,
  options: ResizeObserverOptions = {},
) => {
  let observer: ResizeObserver | undefined;
  const isSupported = computed(() => window && 'ResizeObserver' in window);

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };

  const targets = computed(() => {
    const _targets = toValue(target);
    return Array.isArray(_targets)
      ? _targets.map((el) => unrefElement(el as ComponentPublicInstance))
      : [unrefElement(_targets)];
  });

  const stopWatch = watch(
    targets,
    (els) => {
      cleanup();
      if (isSupported.value && window) {
        observer = new ResizeObserver(callback);
        for (const _el of els) {
          if (_el) observer.observe(_el, options);
        }
      }
    },
    { immediate: true, flush: 'post' },
  );

  const stop = () => {
    cleanup();
    stopWatch();
  };

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return {
    isSupported,
    stop,
  };
};
