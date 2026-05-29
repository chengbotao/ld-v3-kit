/**
 * 创建一个伪造元素（input 或 textarea），用于在不支持 navigator.clipboard 的浏览器中实现复制功能。
 * 伪造元素会被隐藏在页面中，不会影响页面布局。
 * @param value - 需要复制的文本内容
 * @returns 返回创建好的伪造元素
 */
function createFakeElement(value: string): HTMLTextAreaElement {
  const fakeElement = document.createElement('textarea');
  fakeElement.setAttribute('readonly', ''); // 设置为只读，防止用户编辑
  fakeElement.style.position = 'absolute'; // 设置为绝对定位
  fakeElement.style.left = '-9999px'; // 将元素隐藏在页面外
  fakeElement.style.opacity = '0';
  fakeElement.value = value; // 设置元素的值为需要复制的文本
  return fakeElement;
}

/**
 * 复制功能
 * 根据浏览器是否支持 navigator.clipboard API，选择合适的复制方法。
 * 如果支持 navigator.clipboard，则使用现代剪贴板 API 实现复制。
 * 如果不支持，则使用传统的 document.execCommand 方法实现复制。
 * @returns 返回一个复制函数，接受需要复制的文本作为参数
 */
export const clipboard = ((): ((text: string) => Promise<string>) => {
  if (navigator?.clipboard) {
    // 如果浏览器支持 navigator.clipboard，使用现代剪贴板 API
    return async (text: string) => {
      // 使用 navigator.clipboard.writeText 将文本写入剪贴板
      return await navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard successfully');
        return text; // 返回复制的文本
      });
    };
  } else {
    // 如果浏览器不支持 navigator.clipboard，使用传统的 document.execCommand 方法
    return (text: string) => {
      return new Promise((resolve, reject) => {
        const fakeElement = createFakeElement(text); // 创建伪造元素
        document.body.appendChild(fakeElement); // 将伪造元素添加到页面中
        fakeElement.select(); // 选中伪造元素的内容
        try {
          const result = document.execCommand('copy'); // 执行复制操作
          if (result) {
            resolve(text); // 复制成功时返回复制的文本
          } else {
            reject(new Error('Failed to copy text'));
          }
        } catch (error) {
          reject(error); // 复制失败时抛出错误
        } finally {
          fakeElement.remove(); // 移除伪造元素
        }
      });
    };
  }
})();
