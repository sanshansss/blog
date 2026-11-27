/**
 * remark-inline-svg-blocks
 *
 * Markdown 的原始 HTML 块（CommonMark HTML block）遇到空行就会终止。
 * 博客里的示意图是手写的内联 `<svg>`，为了让源码可读，节点之间常留空行，
 * 于是同一张图会被拆成多个 HTML 块：
 *
 *   <figure class="gnc-fig">
 *   <svg viewBox="...">        <-- 第 1 个 HTML 块，到这里被空行截断
 *                               （空行）
 *   <g class="gnc-node">…      <-- 后续 HTML 块 / 段落
 *
 * 浏览器随后会把 `<svg>` 提前闭合，剩下的 `<g>`、`<text>`、`<path>`
 * 变成 SVG 之外的普通 HTML 元素 —— 分组框空着、文字挤在图片下面、
 * 连线与箭头消失、整张图高度失控。
 *
 * 还有第二种断法：SVG 内部按 4 空格缩进（`<g>` 里再套一层子节点），
 * 一旦前面的空行已经终止了 HTML 块，这些行会被解析成「缩进代码块」（code 节点），
 * 同样得合并回来。
 *
 * 这个插件在 mdast 阶段把所有"属于同一个未闭合 `<svg>`"的兄弟节点
 * 合并回单个 html 节点，源码里的空行与缩进因此都不影响渲染结果。
 */

const SVG_OPEN_RE = /<svg[\s>]/i
const SVG_CLOSE_RE = /<\/svg\s*>/i
// 防御性上限：避免异常输入导致无限合并
const MAX_MERGE_NODES = 400

/** 取节点在原始 Markdown 中的原文 */
function rawTextOf(node, source) {
  const start = node.position?.start?.offset
  const end = node.position?.end?.offset
  if (typeof start === 'number' && typeof end === 'number' && typeof source === 'string') {
    return source.slice(start, end)
  }

  // 没有位置信息时退化为拼接子节点内容
  if (typeof node.value === 'string') {
    return node.value
  }
  if (Array.isArray(node.children)) {
    return node.children.map(child => rawTextOf(child, source)).join('')
  }

  return ''
}

/**
 * 缩进 ≥4 空格的行会被 Markdown 当成「缩进代码块」。
 * SVG 内部为了层次清晰常缩进 4 空格，一旦前面有空行把它与上一个
 * HTML 块隔开，这些行就变成 code 节点，合并链在此中断，整张图又被拆碎。
 * 只在内容看起来是标签（以 `<` 开头）、且不是围栏代码块时才认作残片。
 */
function isIndentedMarkupBlock(node) {
  return node.type === 'code'
    && node.lang == null
    && /^\s*</.test(node.value ?? '')
}

/** 可能是同一个 HTML 块被空行拆开后的一段 */
function isHtmlFragment(node) {
  return node.type === 'html' || node.type === 'paragraph' || isIndentedMarkupBlock(node)
}

export function remarkInlineSvgBlocks() {
  return (tree, file) => {
    const source = typeof file?.value === 'string'
      ? file.value
      : undefined

    // 自底向上遍历所有子节点数组（含 root）
    const visitChildren = (parent) => {
      const children = parent.children
      if (!Array.isArray(children) || children.length === 0) {
        return
      }

      for (let i = children.length - 1; i >= 0; i--) {
        visitChildren(children[i])
      }

      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (!isHtmlFragment(node)) {
          continue
        }

        const leading = rawTextOf(node, source)
        if (!SVG_OPEN_RE.test(leading) || SVG_CLOSE_RE.test(leading)) {
          continue
        }

        // 向后找到同一张图的收尾 `</svg>`
        let last = i
        let raw = leading
        while (!SVG_CLOSE_RE.test(raw) && last + 1 < children.length && last - i < MAX_MERGE_NODES) {
          const next = children[last + 1]
          if (!isHtmlFragment(next)) {
            break
          }
          last++
          raw += `\n${rawTextOf(next, source)}`
        }

        if (last === i || !SVG_CLOSE_RE.test(raw)) {
          console.warn(
            `[remark-inline-svg-blocks] 无法闭合的内联 SVG（${file?.path ?? 'unknown'}），请检查 ${SVG_OPEN_RE} 块是否完整。`,
          )
          continue
        }

        const first = children[i]
        const start = first.position?.start
        const end = children[last].position?.end
        // 优先按原始源码切片（保留作者排版）；偏移不稳定时退化为拼接结果
        const sliced = typeof source === 'string' && start && end
          ? source.slice(start.offset, end.offset)
          : ''
        const htmlNode = {
          type: 'html',
          value: sliced && sliced.startsWith(leading.slice(0, 32))
            ? sliced
            : raw,
        }
        if (start && end) {
          htmlNode.position = { start, end }
        }

        children.splice(i, last - i + 1, htmlNode)
      }
    }

    visitChildren(tree)
  }
}
