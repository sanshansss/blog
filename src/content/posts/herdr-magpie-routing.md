---
title: 把 Magpie Routing 带进 Herdr：从路由图到 Context Window
published: 2026-11-13
description: 在 Herdr 中通过本地 mod 复刻 Magpie 的 Routing 与 Context Window 面板，基于本机 jsonl 日志实时查看 Agent 路由去向与会话上下文占用。
tags:
  - Herdr
  - Magpie
  - 工具实践
  - Agent
lang: zh
abbrlink: herdr-magpie-routing
toc: true
---

## 一、缘起与目标

Herdr 的界面布局和侧边面板支持通过本地 mod 自由组合。之前看到 [lexrus 的推文和评论](https://x.com/lexrus/status/2119443089760960679) 后，我产生了一个很直接的想法：把 Magpie 里已有的 Routing 监控界面直接搬进 Herdr，这样平时在 Herdr 里并行开多个 Agent 时，不用来回切窗口就能看到请求路由情况。

具体想要的效果包含两部分：

1. 在顶部 `Files`、`Changes` 按钮旁边增加一个 `Routing` 开关，打开后展示各个 Agent 会话到不同模型的实时路由连线；
2. 在面板下方增加按会话切换的 `Context Window` 视图，选中某个会话后，可以查看它最近一次请求时的上下文窗口占用和构成。

最初我只打算复刻上半部分的路由图，后来用了一阵子觉得光看路由去向还不够，又顺手把 Magpie 下方的 Context Window 统计也接了进来。整个开发过程主要是让 Agent 读 Herdr 的 `AGENTS.md` 和 Magpie 的本地源码，先复刻路由视觉结构，再按 Herdr 的 mod 规范封装成可开关的独立面板。

![Herdr 中的 Magpie Routing 布局](https://raw.githubusercontent.com/sanshansss/herdr-routing-layout/main/layouts/layout.png)

![按会话查看 Context Window](https://raw.githubusercontent.com/sanshansss/herdr-routing-layout/main/layouts/contextwindow.png)

（注：截图中的工作空间名、会话标识、本地路径和终端正文均已做马赛克处理。）

## 二、数据驱动与动画实现

面板的数据来源是 Magpie 在本机写入的 `~/.config/magpie/routing/*.jsonl` 路由日志。为了兼顾实时性和开销，面板通过文件系统目录监听来响应日志更新，同时保留一个 25 秒的定时刷新作为兜底，防止偶发漏事件。

在信息边界上，面板只解析日志中记录的路由去向、token 计数、窗口总容量、上下文 parts 分布和条目分类，不读取也不展示原始对话正文。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 350" role="img" aria-label="Herdr 中 Magpie Routing 与 Context Window 面板的数据流与动态路由示意">
<defs>
<marker id="hr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
</defs>

<!-- Left: Local log source -->
<g class="gnc-node" style="animation-delay:.05s">
  <rect class="gnc-card gnc-card--amber" x="18" y="46" width="166" height="148" rx="8"></rect>
  <text class="gnc-t--strong gnc-t--amber" x="101" y="76">本机路由日志</text>
  <text class="gnc-t--xs gnc-t--mono" x="101" y="102">~/.config/magpie/</text>
  <text class="gnc-t--xs gnc-t--mono" x="101" y="120">routing/*.jsonl</text>
  <rect class="gnc-card gnc-card--surface" x="34" y="140" width="134" height="38" rx="5"></rect>
  <text class="gnc-t--xs" x="101" y="159">目录监听 + 25s 兜底</text>
</g>

<path class="gnc-edge gnc-flow" d="M186 120 H218" marker-end="url(#hr-arrow)"></path>

<!-- Right container: Herdr Mod Panel -->
<rect class="gnc-card gnc-card--ghost" x="224" y="16" width="658" height="318" rx="10"></rect>
<text class="gnc-label gnc-t--xs gnc-t--navy gnc-t--start" x="242" y="34">Herdr Routing Mod（顶部 Files / Changes / Routing 开关控制）</text>

<!-- Agent nodes -->
<g class="gnc-node" style="animation-delay:.14s">
  <rect class="gnc-card gnc-card--core" x="246" y="54" width="134" height="52" rx="7"></rect>
  <text class="gnc-t--on-solid gnc-t--strong" x="313" y="74">Agent 会话 A</text>
  <text class="gnc-t--on-solid gnc-t--xs" x="313" y="92">主控 / 复杂推理</text>
</g>
<g class="gnc-node" style="animation-delay:.22s">
  <rect class="gnc-card" x="246" y="126" width="134" height="52" rx="7"></rect>
  <text class="gnc-t--strong" x="313" y="146">Agent 会话 B</text>
  <text class="gnc-t--xs" x="313" y="164">检索 / 轻量工具调用</text>
</g>

<!-- Bezier routing edges -->
<path class="gnc-edge gnc-edge--teal gnc-flow" d="M382 72 C480 72 480 68 594 68"></path>
<path class="gnc-edge gnc-edge--amber gnc-flow gnc-flow--slow" d="M382 88 C480 88 480 124 594 124"></path>
<path class="gnc-edge gnc-edge--teal gnc-flow gnc-flow--slow" d="M382 146 C480 146 480 132 594 132"></path>
<path class="gnc-edge gnc-edge--coral gnc-flow" d="M382 162 C480 162 480 184 594 184"></path>

<!-- Traveling packets along Bezier curves -->
<circle r="4" class="gnc-packet" style="offset-path: path('M382 72 C480 72 480 68 594 68'); fill: var(--gnc-teal); animation-delay: 0s;"></circle>
<circle r="4" class="gnc-packet" style="offset-path: path('M382 88 C480 88 480 124 594 124'); fill: var(--gnc-amber); animation-delay: 0.9s;"></circle>
<circle r="4" class="gnc-packet" style="offset-path: path('M382 146 C480 146 480 132 594 132'); fill: var(--gnc-teal); animation-delay: 1.5s;"></circle>
<circle r="4" class="gnc-packet" style="offset-path: path('M382 162 C480 162 480 184 594 184'); fill: var(--gnc-coral); animation-delay: 0.4s;"></circle>

<!-- Model nodes -->
<g class="gnc-node" style="animation-delay:.3s">
  <rect class="gnc-card gnc-card--teal" x="598" y="46" width="144" height="44" rx="6"></rect>
  <text class="gnc-t--sm gnc-t--strong" x="670" y="68">Frontier 模型</text>
</g>
<g class="gnc-node" style="animation-delay:.36s">
  <rect class="gnc-card gnc-card--amber" x="598" y="106" width="144" height="44" rx="6"></rect>
  <text class="gnc-t--sm gnc-t--strong" x="670" y="128">Balanced 模型</text>
</g>
<g class="gnc-node" style="animation-delay:.42s">
  <rect class="gnc-card gnc-card--coral" x="598" y="166" width="144" height="44" rx="6"></rect>
  <text class="gnc-t--sm gnc-t--strong" x="670" y="188">Fast / Local 模型</text>
</g>

<!-- Right status legend -->
<g class="gnc-node" style="animation-delay:.48s">
  <rect class="gnc-card gnc-card--surface" x="760" y="46" width="104" height="164" rx="6"></rect>
  <text class="gnc-t--xs gnc-t--strong" x="812" y="72">仅解析元数据</text>
  <text class="gnc-t--xs" x="812" y="102">· token 统计</text>
  <text class="gnc-t--xs" x="812" y="124">· 窗口容量</text>
  <text class="gnc-t--xs" x="812" y="146">· parts 分类</text>
  <text class="gnc-t--xs gnc-t--coral" x="812" y="176">不含对话正文</text>
</g>

<!-- Bottom: Context Window bar -->
<g class="gnc-node" style="animation-delay:.54s">
  <rect class="gnc-card gnc-card--surface" x="246" y="232" width="618" height="86" rx="8"></rect>
  <text class="gnc-t--xs gnc-t--strong gnc-t--start" x="262" y="252">Context Window（按选中会话展示最近一次统计）</text>
  <text class="gnc-t--xs gnc-t--mono gnc-t--end" x="848" y="252">118k / 200k tokens (59%)</text>
  <!-- Segmented bar -->
  <rect x="262" y="266" width="586" height="18" rx="4" fill="var(--gnc-line)" fill-opacity="0.28"></rect>
  <rect class="gnc-bar" x="262" y="266" width="96" height="18" rx="4" fill="var(--gnc-navy)" style="animation-delay:0s"></rect>
  <rect class="gnc-bar" x="360" y="266" width="114" height="18" rx="2" fill="var(--gnc-teal)" style="animation-delay:.4s"></rect>
  <rect class="gnc-bar" x="476" y="266" width="140" height="18" rx="2" fill="var(--gnc-amber)" style="animation-delay:.8s"></rect>
  <text class="gnc-t--xs gnc-t--start" x="262" y="302">■ System</text>
  <text class="gnc-t--xs gnc-t--start gnc-t--teal" x="360" y="302">■ Tools / Skills</text>
  <text class="gnc-t--xs gnc-t--start gnc-t--amber" x="486" y="302">■ History &amp; Context Parts</text>
  <text class="gnc-t--xs gnc-t--end" x="848" y="302">□ Remaining Window</text>
</g>
</svg>
</div>
<figcaption>图 1　Herdr Routing Mod 的结构与数据流。日志更新触发面板刷新，上方用贝塞尔曲线与飞行光点呈现路由去向，下方按会话展示 Context Window 构成。</figcaption>
</figure>

在动画实现上遇到了一个底层框架限制：Herdr 的 mod 基于 GPUI 原生组件构建，目前没有提供沿任意贝塞尔曲线做关键帧动画的接口。我的折中处理是保留贝塞尔曲线本身作为静态连线，而飞行圆点则通过 GPUI 原生 transition 在路径端点之间移动。最终的动态观感和 Magpie 比较接近，但并不是逐帧完全一致。

## 三、获取与安装

完整的布局和 mod 文件放在 [GitHub 仓库](https://github.com/sanshansss/herdr-routing-layout)，包含布局定义、Routing 面板、顶部开关以及一个基于 Skillshare 的辅助面板。这套配置目前已经在 Herdr app 0.1.14 上验证通过。

使用前需要确认两项依赖：Routing 面板需要本机运行 Magpie 并正常写入路由日志；Skillshare 面板的功能则需要本机已安装 `skillshare` CLI。

如果希望直接让本机 Agent 协助安装，可以把下面这段说明交给它执行：

```text
读 ~/.config/herdr-app/AGENTS.md，然后从 https://github.com/sanshansss/herdr-routing-layout 获取 magpie-routing-v1/，按其中 RECIPE.md 安装布局和所需 mods。先检查并备份同名文件，不要改动其他配置；安装后运行 herdr-app check 和 herdr-app status，确认无错误后切换到这个布局。
```
