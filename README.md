# 子新的笔记

个人博客，基于 Astro。写三类东西：空间飞行器动力学与姿态控制、论文阅读笔记、以及一些工具上的折腾。

**线上地址 → [sanshansss.github.io/blog](https://sanshansss.github.io/blog/)**

## 内容

| 文章 | 说明 |
| --- | --- |
| [我以为 memory 是 LLM 之后才有的](https://sanshansss.github.io/blog/posts/bboc-agent-memory/) | BBOC 假设、三类算法创新与 agent memory 方向的阅读记录 |
| [把 Magpie Routing 带进 Herdr](https://sanshansss.github.io/blog/posts/herdr-magpie-routing/) | 从路由图到 Context Window 的一个布局实践 |
| [空间飞行器动力学教学动画](https://sanshansss.github.io/blog/posts/spacecraft-dynamics-animations/) | 用 Manim 做轨道力学与姿态控制的可视化 |

## 本地运行

```bash
pnpm install
pnpm dev      # 本地预览
pnpm build    # 构建到 dist/
```

写新文章用 `pnpm new-post <文件名>`，生成的 md 放在 `src/content/posts/`。

推送 `master` 会自动触发 GitHub Actions 构建并部署到 Pages。

## 主题

界面用的是 [Retypeset](https://github.com/radishzzz/astro-theme-retypeset)（MIT），做过这些改造：

- 站点标题、描述、关于页换成自己的内容
- 移除上游的 umami 统计、Waline 评论实例、apiflash 硬编码 key
- OG 字体从 `public/` 移到 `assets/`，不再随站点发布（构建产物 39M → 11M）
- 语言从 6 种收敛到中英两种，移除主题自带演示文章

原文的 [README](https://github.com/radishzzz/astro-theme-retypeset#readme) 里有完整的配置文档。

## License

内容版权归本人所有。主题部分遵循 MIT，原版权声明见 [LICENSE](./LICENSE)。
