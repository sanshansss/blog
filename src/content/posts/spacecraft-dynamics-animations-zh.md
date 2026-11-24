---
title: 空间飞行器动力学教学动画
published: 2026-10-20
description: 9 支面向空间飞行器姿态动力学、轨道力学与姿态执行机构的中文教学动画。
tags:
  - 空间飞行器
  - 动力学
  - 教学动画
pin: 99
lang: zh
abbrlink: spacecraft-dynamics-animations
toc: false
---

学习空间飞行器动力学时，很多概念单看公式和静态配图并不直观——比如欧拉角转序为什么不可交换、存在能量耗散时最小惯量轴自旋为什么会发散，以及 CW 方程下的相对绕飞轨迹长什么样。

为此，我用 Python 自写动力学数值模型，配合 Manim 制作了一组共 9 支中文教学动画，尝试把姿态运动学、刚体自旋稳定性、轨道相对运动以及执行机构工作机理做成可以直接观察的动态过程。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 220" role="img" aria-label="空间飞行器动力学教学动画涵盖的三大主题：姿态动力学、轨道力学与姿态执行机构">
<g class="gnc-node" style="animation-delay:.05s">
  <rect class="gnc-card gnc-card--surface" x="20" y="18" width="268" height="184" rx="10"></rect>
  <text class="gnc-t--strong gnc-t--navy" x="154" y="42">姿态运动与自旋稳定性</text>
  <ellipse cx="154" cy="112" rx="54" ry="20" fill="none" stroke="var(--gnc-line)" stroke-dasharray="4 4"></ellipse>
  <g class="gnc-spin">
    <ellipse cx="154" cy="112" rx="44" ry="18" fill="var(--gnc-fill-1)" stroke="var(--gnc-blue)" stroke-width="1.4"></ellipse>
    <line x1="154" y1="74" x2="154" y2="150" stroke="var(--gnc-coral)" stroke-width="1.6"></line>
    <circle cx="154" cy="74" r="3.5" fill="var(--gnc-coral)"></circle>
  </g>
  <text class="gnc-t--xs" x="154" y="176">3-1-2 欧拉角 · Explorer 1 · 引力梯度</text>
</g>

<g class="gnc-node" style="animation-delay:.16s">
  <rect class="gnc-card gnc-card--surface" x="316" y="18" width="268" height="184" rx="10"></rect>
  <text class="gnc-t--strong gnc-t--teal" x="450" y="42">轨道力学与相对运动</text>
  <circle cx="450" cy="112" r="14" fill="var(--gnc-teal)" fill-opacity="0.25" stroke="var(--gnc-teal)" stroke-width="1.5"></circle>
  <ellipse cx="450" cy="112" rx="64" ry="30" fill="none" stroke="var(--gnc-teal)" stroke-width="1.3" class="gnc-flow gnc-flow--slow"></ellipse>
  <g class="gnc-spin gnc-spin--fast">
    <circle cx="514" cy="112" r="4.5" fill="var(--gnc-amber)"></circle>
    <circle cx="386" cy="112" r="2.5" fill="var(--gnc-teal)" fill-opacity="0.5"></circle>
  </g>
  <text class="gnc-t--xs" x="450" y="176">太阳同步轨道 · CW 绕飞与交会 · 引力弹弓</text>
</g>

<g class="gnc-node" style="animation-delay:.27s">
  <rect class="gnc-card gnc-card--surface" x="612" y="18" width="268" height="184" rx="10"></rect>
  <text class="gnc-t--strong gnc-t--amber" x="746" y="42">姿态执行机构与角动量</text>
  <circle cx="746" cy="112" r="36" fill="var(--gnc-fill-3)" stroke="var(--gnc-amber)" stroke-width="1.4"></circle>
  <g class="gnc-spin gnc-spin--fast gnc-spin--reverse">
    <circle cx="746" cy="112" r="24" fill="none" stroke="var(--gnc-amber)" stroke-width="2" stroke-dasharray="14 10"></circle>
    <line x1="746" y1="84" x2="746" y2="140" stroke="var(--gnc-navy)" stroke-width="1.4"></line>
    <line x1="718" y1="112" x2="774" y2="112" stroke="var(--gnc-navy)" stroke-width="1.4"></line>
  </g>
  <circle cx="746" cy="112" r="5" fill="var(--gnc-navy)"></circle>
  <text class="gnc-t--xs" x="746" y="176">反作用轮饱和卸载 · CMG 奇异几何</text>
</g>
</svg>
</div>
<figcaption>图 1　9 支教学动画覆盖的三个板块：刚体姿态动力学、轨道与相对运动力学、姿态执行机构。</figcaption>
</figure>

目前包含的主题如下：

- 3-1-2 欧拉角转序与旋转不可交换性；
- Explorer 1 在能量耗散下的最小惯量轴自旋失稳；
- 最大惯量轴与中间惯量轴自旋稳定性对比；
- 引力梯度稳定的天平动与不稳定构型发散过程；
- 太阳同步轨道的节点进动、倾角—高度关系与一年尺度地方时保持；
- CW 自然闭合绕飞与 V-bar 双脉冲交会；
- 引力弹弓在行星系与日心系中的速度变化；
- 反作用轮角动量交换、饱和卸载与 CMG 奇异几何。

全部成片视频与核心动力学仿真代码已整理到 GitHub：

::github{repo="sanshansss/spacecraft-dynamics-animations"}

- 项目仓库：<https://github.com/sanshansss/spacecraft-dynamics-animations>
- 个人主页：<https://sanshansss.github.io/astro-theme-retypeset/>
