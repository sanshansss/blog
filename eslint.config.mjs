import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  astro: true,
  // `unocss: true` 暂时关闭，原因见 README-lint 说明：
  // @unocss/eslint-plugin 通过 synckit 把异步的 uno.parseToken() 包装成同步调用，
  // 该同步桥依赖 worker_threads + SharedArrayBuffer + Atomics.wait。
  // 在 Node 24 / Windows 上这套机制会不稳定地发生段错误（实测 5%–30% 的进程
  // 以 SIGSEGV 退出），导致 lint 与 pre-commit 钩子随机失败。
  // 关闭后段错误消失；代价是失去 class 属性里工具类顺序的自动检查与修复。
  // unocss: true,
  ignores: ['src/content/**'],
  rules: {
    'e18e/prefer-static-regex': 'off',
  },
})
