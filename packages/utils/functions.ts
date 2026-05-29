/**
 * 无操作空函数（noop = no operation）
 * 用于默认值、回调兜底等场景，避免重复创建空函数实例
 */
function noop(): void {
  // 空实现，仅用于占位
}
// 冻结函数，防止被意外修改
Object.freeze(noop);

export { noop };
