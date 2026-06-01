import { type Ref, getCurrentScope, onScopeDispose, watchEffect } from 'vue';

/**
 * 调整方向类型
 * n: 上（北）
 * s: 下（南）
 * e: 右（东）
 * w: 左（西）
 * ne: 右上
 * nw: 左上
 * se: 右下
 * sw: 左下
 */
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** 拖拽状态的内部数据结构 */
interface ResizeState {
  isResizing: boolean; // 是否正在拖拽调整大小
  direction: ResizeDirection | null; // 当前拖拽方向
  startX: number; // 拖拽开始时的鼠标 X 坐标
  startY: number; // 拖拽开始时的鼠标 Y 坐标
  startWidth: number; // 拖拽开始时的元素宽度
  startHeight: number; // 拖拽开始时的元素高度
  startLeft: number; // 拖拽开始时的元素 left 位置
  startTop: number; // 拖拽开始时的元素 top 位置
}

/** 保存的原始样式，用于拖拽结束后恢复 */
interface OriginalStyle {
  position: string;
  left: string;
  top: string;
  width: string;
  height: string;
  margin: string;
  transform: string;
}

/** 安全区域配置，防止调整大小时超出视口边界 */
interface SafeArea {
  top: number; // 顶部安全距离
  left: number; // 左侧安全距离
  bottom: number; // 底部安全距离
  right: number; // 右侧安全距离
}

/**
 * 可调整大小的 Composable
 * @param targetRef - 目标元素引用
 * @param resizable - 是否可调整大小的响应式函数
 * @param minWidth - 最小宽度
 * @param minHeight - 最小高度
 * @param maxWidth - 最大宽度（0 表示无限制）
 * @param maxHeight - 最大高度（0 表示无限制）
 * @param enabledEdges - 启用的调整方向
 * @param safeArea - 安全区域配置
 */
export const useResizable = (
  targetRef: Ref<HTMLElement | undefined>,
  resizable: () => boolean,
  minWidth = 200,
  minHeight = 200,
  maxWidth = 0,
  maxHeight = 0,
  enabledEdges: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
  safeArea: SafeArea = { top: 0, left: 0, bottom: 0, right: 0 },
) => {
  /** 内部拖拽状态 */
  const resizeState = {
    isResizing: false,
    direction: null as ResizeDirection | null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,
  } as ResizeState;

  /** 拖拽手柄大小（用于判断鼠标是否在边缘） */
  const resizeHandleSize = 5;

  /** 保存的原始样式 */
  let originalStyle: OriginalStyle | null = null;

  /** 是否已转换为绝对定位 */
  let wasTransformed = false;

  /**
   * 应用安全区域约束
   * 确保元素不会超出视口和安全区域边界
   */
  const applySafeAreaConstraints = (x: number, y: number, width: number, height: number) => {
    // 计算最大可调整位置
    const maxX = window.innerWidth - width - safeArea.right;
    const maxY = window.innerHeight - height - safeArea.bottom;

    // 限制位置在安全区域内
    const constrainedX = Math.max(safeArea.left, Math.min(maxX, x));
    const constrainedY = Math.max(safeArea.top, Math.min(maxY, y));

    // 初始化宽高
    let constrainedWidth = width;
    let constrainedHeight = height;

    // 检查右边是否超出安全区域
    if (constrainedX + constrainedWidth > window.innerWidth - safeArea.right) {
      constrainedWidth = window.innerWidth - safeArea.right - constrainedX;
    }

    // 检查下边是否超出安全区域
    if (constrainedY + constrainedHeight > window.innerHeight - safeArea.bottom) {
      constrainedHeight = window.innerHeight - safeArea.bottom - constrainedY;
    }

    // 确保宽高不小于最小值
    constrainedWidth = Math.max(minWidth, constrainedWidth);
    constrainedHeight = Math.max(minHeight, constrainedHeight);

    return {
      x: constrainedX,
      y: constrainedY,
      width: constrainedWidth,
      height: constrainedHeight,
    };
  };

  /**
   * 保存元素的原始样式
   */
  const saveOriginalStyle = (el: HTMLElement) => {
    const style = window.getComputedStyle(el);
    originalStyle = {
      position: style.position,
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
      margin: el.style.margin,
      transform: style.transform,
    };
  };

  /**
   * 恢复元素的原始样式
   * 在拖拽结束后调用，将元素恢复到非绝对定位的原始状态
   */
  const restoreOriginalStyle = () => {
    if (!targetRef.value || !originalStyle || !wasTransformed) return;

    const el = targetRef.value;
    el.style.position = originalStyle.position;
    el.style.left = originalStyle.left;
    el.style.top = originalStyle.top;
    el.style.width = originalStyle.width;
    el.style.height = originalStyle.height;
    el.style.margin = originalStyle.margin;
    el.style.transform = originalStyle.transform;

    originalStyle = null;
    wasTransformed = false;
  };

  /**
   * 确保元素使用绝对定位或固定定位
   * 只有在元素不是绝对定位或固定定位时才转换
   */
  const ensureAbsolutePosition = () => {
    if (!targetRef.value) return;

    const el = targetRef.value;
    const style = window.getComputedStyle(el);

    if (style.position !== 'absolute' && style.position !== 'fixed') {
      saveOriginalStyle(el);
      wasTransformed = true;

      const rect = el.getBoundingClientRect();

      el.style.position = 'absolute';
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = '0';
      el.style.transform = '';
    }
  };

  /**
   * 根据鼠标位置判断拖拽方向
   * @returns 拖拽方向或 null（不在可拖拽区域）
   */
  const getDirection = (clientX: number, clientY: number): ResizeDirection | null => {
    if (!targetRef.value) return null;

    const rect = targetRef.value.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // 判断鼠标在元素的哪个边缘
    const isLeft = x <= resizeHandleSize;
    const isRight = x >= width - resizeHandleSize;
    const isTop = y <= resizeHandleSize;
    const isBottom = y >= height - resizeHandleSize;

    // 按优先级判断方向（四角优先于边缘）
    if (isTop && isLeft) return 'nw';
    if (isTop && isRight) return 'ne';
    if (isBottom && isLeft) return 'sw';
    if (isBottom && isRight) return 'se';
    if (isTop) return 'n';
    if (isBottom) return 's';
    if (isLeft) return 'w';
    if (isRight) return 'e';

    return null;
  };

  /**
   * 获取鼠标光标样式
   */
  const getCursorStyle = (direction: ResizeDirection): string => {
    const cursorMap: Record<ResizeDirection, string> = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      sw: 'nesw-resize',
    };
    return cursorMap[direction];
  };

  /**
   * 鼠标移动事件处理
   * 处理拖拽过程中的大小调整
   */
  const onMouseMove = (e: MouseEvent) => {
    if (!targetRef.value || !resizable()) return;

    // 正在拖拽中，执行大小调整逻辑
    if (resizeState.isResizing) {
      const { direction, startX, startY, startWidth, startHeight, startLeft, startTop } =
        resizeState;

      // 计算鼠标偏移量
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // 初始化新的尺寸和位置
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // 计算有效的最大尺寸
      // 0 表示无限制，使用视口尺寸减去当前位置
      const effectiveMaxWidth = maxWidth > 0 ? maxWidth : window.innerWidth - startLeft;
      const effectiveMaxHeight = maxHeight > 0 ? maxHeight : window.innerHeight - startTop;

      switch (direction) {
        // ==================== 右边框拖拽 ====================
        case 'e':
          newWidth = Math.max(minWidth, Math.min(effectiveMaxWidth, startWidth + deltaX));
          break;

        // ==================== 左边框拖拽 ====================
        case 'w': {
          // 向左拖拽时 deltaX 为负值
          // 1. 计算期望的新左边位置
          const desiredLeft = startLeft + deltaX;
          // 2. 限制不能超出左边界
          newLeft = Math.max(0, desiredLeft);
          // 3. 根据位置变化反推宽度（保持右边不动）
          newWidth = startWidth + (startLeft - newLeft);
          // 4. 确保宽度在有效范围内
          newWidth = Math.max(minWidth, Math.min(effectiveMaxWidth, newWidth));
          // 5. 如果达到最小宽度，重新计算位置
          if (newWidth === minWidth) {
            newLeft = startLeft + startWidth - minWidth;
          }
          break;
        }

        // ==================== 下边框拖拽 ====================
        case 's':
          newHeight = Math.max(minHeight, Math.min(effectiveMaxHeight, startHeight + deltaY));
          break;

        // ==================== 上边框拖拽 ====================
        case 'n': {
          // 向上拖拽时 deltaY 为负值
          // 1. 计算期望的新上边位置
          const desiredTop = startTop + deltaY;
          // 2. 限制不能超出上边界
          newTop = Math.max(0, desiredTop);
          // 3. 根据位置变化反推高度（保持下边不动）
          newHeight = startHeight + (startTop - newTop);
          // 4. 确保高度在有效范围内
          newHeight = Math.max(minHeight, Math.min(effectiveMaxHeight, newHeight));
          // 5. 如果达到最小高度，重新计算位置
          if (newHeight === minHeight) {
            newTop = startTop + startHeight - minHeight;
          }
          break;
        }

        // ==================== 右上角拖拽 ====================
        case 'ne':
          // 向右拖拽右边框（总是执行）
          newWidth = Math.max(minWidth, Math.min(effectiveMaxWidth, startWidth + deltaX));
          // 向上拖拽时调整上边和高度
          if (deltaY < 0) {
            const desiredTop = startTop + deltaY;
            newTop = Math.max(0, desiredTop);
            newHeight = startHeight + (startTop - newTop);
            newHeight = Math.max(minHeight, Math.min(effectiveMaxHeight, newHeight));
            if (newHeight === minHeight) {
              newTop = startTop + startHeight - minHeight;
            }
          }
          break;

        // ==================== 左上角拖拽 ====================
        case 'nw':
          // 向左拖拽时调整左边和宽度
          if (deltaX < 0) {
            const desiredLeft = startLeft + deltaX;
            newLeft = Math.max(0, desiredLeft);
            newWidth = startWidth + (startLeft - newLeft);
            newWidth = Math.max(minWidth, Math.min(effectiveMaxWidth, newWidth));
            if (newWidth === minWidth) {
              newLeft = startLeft + startWidth - minWidth;
            }
          }
          // 向上拖拽时调整上边和高度
          if (deltaY < 0) {
            const desiredTop = startTop + deltaY;
            newTop = Math.max(0, desiredTop);
            newHeight = startHeight + (startTop - newTop);
            newHeight = Math.max(minHeight, Math.min(effectiveMaxHeight, newHeight));
            if (newHeight === minHeight) {
              newTop = startTop + startHeight - minHeight;
            }
          }
          break;

        // ==================== 右下角拖拽 ====================
        case 'se':
          newWidth = Math.max(minWidth, Math.min(effectiveMaxWidth, startWidth + deltaX));
          newHeight = Math.max(minHeight, Math.min(effectiveMaxHeight, startHeight + deltaY));
          break;

        // ==================== 左下角拖拽 ====================
        case 'sw':
          // 向左拖拽时调整左边和宽度
          if (deltaX < 0) {
            const desiredLeft = startLeft + deltaX;
            newLeft = Math.max(0, desiredLeft);
            newWidth = startWidth + (startLeft - newLeft);
            newWidth = Math.max(minWidth, Math.min(effectiveMaxWidth, newWidth));
            if (newWidth === minWidth) {
              newLeft = startLeft + startWidth - minWidth;
            }
          }
          // 向下拖拽下边框（总是执行）
          newHeight = Math.max(minHeight, Math.min(effectiveMaxHeight, startHeight + deltaY));
          break;
      }

      // 应用安全区域约束并更新样式
      const constrained = applySafeAreaConstraints(newLeft, newTop, newWidth, newHeight);
      targetRef.value.style.width = `${constrained.width}px`;
      targetRef.value.style.height = `${constrained.height}px`;
      targetRef.value.style.left = `${constrained.x}px`;
      targetRef.value.style.top = `${constrained.y}px`;
      return;
    }

    // 非拖拽状态：更新鼠标光标样式
    const direction = getDirection(e.clientX, e.clientY);
    if (direction && enabledEdges.includes(direction)) {
      targetRef.value.style.cursor = getCursorStyle(direction);
    } else {
      targetRef.value.style.cursor = '';
    }
  };

  /**
   * 鼠标按下事件处理
   * 开始拖拽调整大小
   */
  const onMouseDown = (e: MouseEvent) => {
    if (!targetRef.value || !resizable()) return;

    // 获取拖拽方向
    const direction = getDirection(e.clientX, e.clientY);

    // 检查方向是否在启用的边缘列表中
    if (!direction || !enabledEdges.includes(direction)) return;

    e.preventDefault();
    e.stopPropagation();

    // 确保元素使用绝对定位
    ensureAbsolutePosition();

    // 获取元素当前尺寸和位置
    const rect = targetRef.value.getBoundingClientRect();

    // 保存拖拽开始状态
    resizeState.isResizing = true;
    resizeState.direction = direction;
    resizeState.startX = e.clientX;
    resizeState.startY = e.clientY;
    resizeState.startWidth = rect.width;
    resizeState.startHeight = rect.height;
    resizeState.startLeft = rect.left;
    resizeState.startTop = rect.top;
  };

  /**
   * 鼠标释放事件处理
   * 结束拖拽调整大小
   */
  const onMouseUp = () => {
    resizeState.isResizing = false;
    resizeState.direction = null;
  };

  /**
   * 绑定拖拽事件
   */
  const onResizable = () => {
    if (!targetRef.value) return;
    targetRef.value.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  /**
   * 解绑拖拽事件
   */
  const offResizable = () => {
    if (!targetRef.value) return;
    targetRef.value.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  watchEffect(() => {
    if (resizable()) {
      onResizable();
    } else {
      offResizable();
    }
  });

  // 组件卸载时解绑事件
  if (getCurrentScope()) {
    onScopeDispose(offResizable);
  }

  return {
    onResizable,
    offResizable,
    restoreOriginalStyle,
  };
};
