/**
 * EventCallback 事件回调函数。
 */
type EventCallback = (...args: unknown[]) => void;

/**
 * EventManager 管理事件的发布和订阅。
 */
export class EventManager {
  /**
   * 私有静态属性，存储 EventManager 的单例实例。
   * @private
   */
  static #instance: EventManager;
  /**
   * 存储事件监听器的映射表，键为事件名称，值为该事件的监听器集合。
   * @private
   */
  #listeners: Record<string, Set<EventCallback>> = {};
  /**
   * 构造函数是私有的，以确保只能通过 getInstance 方法获取 EventManager 的实例。
   */
  private constructor() {
    // 禁用默认的构造函数
  }
  /**
   * 获取 EventManager 的单例实例。
   * @returns EventManager 的单例实例。
   */
  static getInstance() {
    return (EventManager.#instance ??= new EventManager());
  }
  /**
   * 注册事件监听器。
   * @param event 事件名称。
   * @param listener 事件触发时调用的函数。
   */
  on(event: string, listener: EventCallback) {
    (this.#listeners[event] ??= new Set()).add(listener);
  }
  /**
   * 触发指定事件，调用所有注册的监听器。
   * @param event 事件名称。
   * @param args 传递给监听器的参数。
   */
  emit(event: string, ...args: unknown[]) {
    this.#listeners[event]?.forEach((cb) => cb(...args));
  }
  /**
   * 移除事件监听器。
   * @param event 事件名称。
   * @param listener 要移除的监听器函数。
   */
  off(event: string, listener: EventCallback) {
    this.#listeners[event]?.delete(listener);
  }
  /**
   * 注册单次事件监听器，事件触发后自动移除。
   * @param event 事件名称。
   * @param listener 事件触发时调用的函数。
   */
  once(event: string, listener: EventCallback) {
    const wrapper = (...args: unknown[]) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}
