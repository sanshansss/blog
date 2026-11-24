---
title: 从 BBOC 假说重看 Agent Memory：记忆、梯度与计算流
published: 2026-11-04
description: 读 Dario Amodei 2017 年文章《The Big Blob of Compute Hypothesis》的笔记：梳理记忆架构的脉络、参数化策略与外部内容的边界，以及对当前 Agent Memory 工作的分类思考。
tags:
  - 论文笔记
  - AI
  - agent-memory
  - scaling
  - 读书笔记
lang: zh
abbrlink: bboc-agent-memory
toc: true
paperTitle: The Big Blob of Compute Hypothesis
paperAuthors: Dario Amodei
paperYear: 2017
---

<!--
首次发布：2026-11-04
说明：本文由个人阅读记录整理而成，并做过发布加工（新增 论文笔记 标签、
paperTitle/paperAuthors/paperYear 字段）。博客版本与研究记录可能存在分叉，
后续更新以本文件为准。
-->

## 一、一个引发疑问的句子

最近读 Dario Amodei 在 2017 年写的《The Big Blob of Compute Hypothesis》（下称 BBOC）时，有一句话让我停下来多看了几遍：

> 记忆架构可能成为未来候选，因为它们利用了普遍的稀疏性。

看到这句话时，我最先觉得有点意外：这是一篇近十年前的文章，那时候怎么就已经在认真讨论 memory 架构了？

在平时的印象里，memory 似乎是近两年大语言模型普及之后才火起来的方向，比如长上下文、RAG、向量数据库、MemGPT 以及各种 agent memory 框架。回顾 2017 年前后的深度学习，主流讨论大多集中在 CNN、RNN 和 LSTM 上。带着这个疑问，我顺着文章的逻辑查了一些背景，也在几个具体问题上重新梳理了自己的理解。

## 二、记忆架构的历史脉络与层次差异

顺着时间线查了一遍才发现，之前把「术语的流行时间」和「问题本身的年龄」混在一起了。神经网络里的记忆研究比大语言模型早得多：

- 1982 年，Hopfield 网络提出联想记忆；
- 1997 年，LSTM 明确引入了门控记忆单元；
- 2014 年，Neural Turing Machine（NTM）尝试把可微的外部存储与读写头接入神经网络；
- 2014–2015 年，Memory Networks 与 End-to-End MemN2N 相继提出；
- 2016 年，Differentiable Neural Computer（DNC）和 MERLIN 等工作继续推进这一方向。

2014 到 2016 年正好是 memory-augmented neural network 的研究热潮。所以 BBOC 里提到记忆架构，并不是在预言十年后的 agent memory，而是在回应当时的热点：在作者看来，这类工作之所以有希望成立，是因为它们利用了数据中普遍存在的稀疏访问结构。

把不同阶段的「记忆」放在一起对比，可以看到它们虽然共用同一个词，但处在不同的层次上：

| 层次 | 记忆的形态 | 读写机制如何确定 |
| --- | --- | --- |
| BBOC 讨论的记忆架构 | 利用稀疏性的模型结构先验 | 梯度训练 |
| Memory Networks / NTM | 网络内部的可微外部存储 | 梯度训练 |
| 当前多数 Agent Memory | 模型外部的存储与检索系统 | 多数为人工编写的规则 |

以前讨论的 memory 是神经网络计算图的一部分；今天大多数 agent memory 则是包在模型外围的一套工程系统。两者有思想上的延续，但并不是同一层面的对象。

## 三、参数化记忆与「进梯度」的边界

既然 BBOC 把参数视为持久存储，我顺着往下想了一个问题：从这个框架出发，是不是应该把记忆直接存进模型权重里？

仔细对照原文后，我觉得这个想法只对了一半。文章把存储分成两类：一类是训练中学到的通用信息，存放在权重里；另一类是执行过程中遇到的任务实例信息，存放在激活状态里。按照这个划分：

- 通用、可复用的结构适合进入权重；
- 与具体任务、具体用户强相关且带有时效性的事实，本来就属于临时或实例级信息，放在外部存储更合理。

此外，这篇文章写于大语言模型之前，没有把权重更新的成本不对称和灾难性遗忘纳入讨论。修改一条事实如果要重新训练权重，工程代价极高，而在外部键值库里更新一条记录只需要常数级开销。这也是外部记忆在当前工程实践中被广泛采用的直接原因。

因此，更准确的区分方式是把记忆拆成三个部分来看：

| 成分 | 含义 | 是否需要参与梯度训练 |
| --- | --- | --- |
| 内容（Content） | 具体记录下来的事实、日志与片段 | 一般不需要 |
| 表示（Representation） | 内容的编码、压缩与索引方式 | 可以参与 |
| 策略（Policy） | 何时写、写什么、何时读、何时忘 | 应该参与 |

这里所说的「进梯度」，并不是指把每一条事实都塞进参数，而是指控制记忆读写的策略函数是由训练学出来的，而不是靠开发者用 `if-else` 或固定提示词写死的。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 340" role="img" aria-label="记忆系统中的梯度边界：可学习的策略与外部存储内容">
<defs>
<marker id="bb1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="bb1-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-teal)"></path></marker>
<marker id="bb1-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
</defs>
<rect class="gnc-lane gnc-lane--teal" x="20" y="24" width="530" height="292" rx="10"></rect>
<text class="gnc-label gnc-t--sm gnc-t--teal gnc-t--start" x="38" y="48">计算图与梯度优化范围内（可学习）</text>
<rect class="gnc-card gnc-card--ghost" x="580" y="24" width="300" height="292" rx="10"></rect>
<text class="gnc-label gnc-t--sm gnc-t--amber gnc-t--start" x="598" y="48">计算图外（O(1) 读写，不进权重）</text>

<g class="gnc-node" style="animation-delay:.06s"><rect class="gnc-card" x="45" y="105" width="130" height="68" rx="7"></rect><text class="gnc-t--strong" x="110" y="131">输入 / 任务状态</text><text class="gnc-t--sm" x="110" y="153">xₜ, hₜ</text></g>
<g class="gnc-node" style="animation-delay:.16s"><rect class="gnc-card gnc-card--core" x="215" y="95" width="150" height="88" rx="8"></rect><rect class="gnc-halo" x="215" y="95" width="150" height="88" rx="8"></rect><text class="gnc-t--on-solid gnc-t--strong" x="290" y="126">读写策略 πθ</text><text class="gnc-t--on-solid gnc-t--sm" x="290" y="148">写什么 / 何时读 / 何时忘</text><text class="gnc-t--on-solid gnc-t--xs" x="290" y="168">由梯度或强化学习优化</text></g>
<g class="gnc-node" style="animation-delay:.26s"><rect class="gnc-card gnc-card--teal" x="405" y="105" width="120" height="68" rx="7"></rect><text class="gnc-t--strong" x="465" y="131">表示编码器</text><text class="gnc-t--sm" x="465" y="153">压缩 / 索引</text></g>

<g class="gnc-node" style="animation-delay:.36s"><rect class="gnc-card gnc-card--amber" x="625" y="95" width="215" height="88" rx="8"></rect><text class="gnc-t--strong" x="732" y="128">外部记忆内容</text><text class="gnc-t--sm" x="732" y="150">用户偏好 · 历史记录 · 时效事实</text><text class="gnc-t--xs" x="732" y="168">KV / 向量库 / 结构化数据库</text></g>

<g class="gnc-node" style="animation-delay:.46s"><rect class="gnc-card gnc-card--surface" x="215" y="238" width="150" height="52" rx="7"></rect><text class="gnc-t--strong" x="290" y="258">任务损失 / 奖励</text><text class="gnc-t--sm" x="290" y="276">L(y, ŷ) / R</text></g>

<path class="gnc-edge" d="M177 139 H211" marker-end="url(#bb1-arrow)"></path>
<path class="gnc-edge gnc-edge--teal gnc-flow" d="M367 126 H401" marker-end="url(#bb1-arrow-teal)"></path>
<path class="gnc-edge gnc-edge--teal gnc-flow" d="M527 126 H621" marker-end="url(#bb1-arrow-teal)"></path>
<text class="gnc-label gnc-t--xs gnc-t--teal" x="574" y="114">写入 / 查询</text>
<path class="gnc-edge gnc-edge--teal gnc-flow gnc-flow--slow" d="M621 154 H527" marker-end="url(#bb1-arrow-teal)"></path>
<path class="gnc-edge gnc-edge--teal gnc-flow gnc-flow--slow" d="M401 154 H367" marker-end="url(#bb1-arrow-teal)"></path>
<text class="gnc-label gnc-t--xs gnc-t--teal" x="574" y="170">召回上下文</text>

<path class="gnc-edge gnc-edge--coral gnc-flow" d="M290 236 V187" marker-end="url(#bb1-arrow-coral)"></path>
<text class="gnc-label gnc-t--xs gnc-t--coral gnc-t--start" x="300" y="212">梯度 / 策略更新</text>
<path class="gnc-edge gnc-edge--coral gnc-edge--hair gnc-flow gnc-flow--slow" d="M367 264 H465 V177" marker-end="url(#bb1-arrow-coral)"></path>

<g class="gnc-node" style="animation-delay:.56s"><rect class="gnc-card gnc-card--surface" x="625" y="238" width="215" height="52" rx="7"></rect><text class="gnc-t--sm" x="732" y="258">纯外挂框架（MemGPT / Mem0 等）</text><text class="gnc-t--xs" x="732" y="276">策略也移到图外，由人工规则驱动</text></g>
</svg>
</div>
<figcaption>图 1　记忆系统的梯度边界。理想的折中路线是让读写策略与表示编码处于优化回路内，同时将具体实例内容保留在计算图外的低成本存储中。</figcaption>
</figure>

顺着这个划分，判断一项 agent memory 工作偏向工程封装还是算法改进，可以用一个很直观的标准：如果关掉梯度训练，系统的记忆读写方式是否完全不变？如果不变，说明读写策略是人工写死的；如果离不开训练，才说明策略本身是学出来的。

按这个标准看，目前常见的一批 agent memory 框架，比如 MemGPT、Mem0、LangChain memory，大多属于计算图之外的工程系统。它们在工程落地和可用性上当然有价值，但这种价值主要来自系统设计与上下文管理，而不是学习算法本身。

## 四、重新理解 BBOC 的核心观点

读到一半时，我曾把 BBOC 的主旨简单概括为「认可梯度训练、不需要再改进算法、核心在基础设施」。但回头重读原文，发现这个概括偏得比较远。

首先，BBOC 认可的是以深度学习栈作为基底，它反对的是「目前缺少某种尚未发现的核心学习算法（例如替代反向传播的新机制）」这种看法。作者并不是说梯度下降在理论上完美无缺，而是认为从头另起炉灶的做法大概率走不通。

其次，文章并没有否定算法改进，而是认为真正有效的算法改进集中在三个比较窄的方向上：

| 类别 | 解决的核心问题 |
| --- | --- |
| 利用对称性与结构先验 | 减少模型需要从数据中学习的自由度 |
| 改善数值条件化 | 保持优化过程的数值稳定，使训练能够顺利推进 |
| 让计算图更顺滑 | 减少人为切块，让算力和信息流能够自由传递 |

也就是说，作者强调的不是「不用改算法」，而是改动的对象应该是计算的组织方式，而不是底层学习规则。

第三，文章也没有把问题简化成「基础设施对抗算法」。基础设施只是提供算力的条件，BBOC 真正看重的是在充足的低结构算力之上，如何通过环境设计、经验分布和训练目标这些高层因素去塑造模型行为。原文也明确留了一句限定：「这并不意味着扩大当前精确算法的规模就能带来 AGI。」

## 五、用两维坐标梳理当前的 Agent Memory 工作

结合「记忆是否在计算图内」和「读写策略是学出来的还是写出来的」这两个维度，可以把现有的 agent memory 相关工作放进一个 2×2 的象限里来看。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 390" role="img" aria-label="Agent Memory 工作的两维象限分布">
<defs>
<marker id="bb2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="bb2-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
</defs>

<path class="gnc-edge" d="M120 330 V34" marker-end="url(#bb2-arrow)"></path>
<path class="gnc-edge" d="M120 330 H860" marker-end="url(#bb2-arrow)"></path>
<text class="gnc-label gnc-t--sm gnc-t--navy" x="62" y="108">策略由训练</text>
<text class="gnc-label gnc-t--sm gnc-t--navy" x="62" y="126">学习得到</text>
<text class="gnc-label gnc-t--sm" x="62" y="255">策略由人工</text>
<text class="gnc-label gnc-t--sm" x="62" y="273">规则编写</text>

<text class="gnc-label gnc-t--sm gnc-t--navy" x="305" y="356">记忆在计算图内</text>
<text class="gnc-label gnc-t--sm" x="670" y="356">记忆在计算图外</text>

<g class="gnc-node" style="animation-delay:.08s">
  <rect class="gnc-card gnc-card--teal" x="145" y="46" width="330" height="126" rx="8"></rect>
  <text class="gnc-t--strong gnc-t--teal" x="310" y="74">象限 I：结构与计算流均进图</text>
  <text class="gnc-t--sm" x="310" y="102">Memory Layers · Titans / TTT</text>
  <text class="gnc-t--sm" x="310" y="122">NTM / DNC · RETRO</text>
  <text class="gnc-t--xs" x="310" y="148">最契合 BBOC 框架的形态，工程改动门槛高</text>
</g>

<g class="gnc-node" style="animation-delay:.18s">
  <rect class="gnc-card gnc-card--amber" x="505" y="46" width="330" height="126" rx="8"></rect>
  <text class="gnc-t--strong gnc-t--amber" x="670" y="74">象限 II：策略进梯度，内容在图外</text>
  <text class="gnc-t--sm" x="670" y="106">Memory-R1 · MemAgent · Mem-alpha</text>
  <text class="gnc-t--xs" x="670" y="148">兼顾可学习性与工程更新成本的现实折中</text>
</g>

<g class="gnc-node" style="animation-delay:.28s">
  <rect class="gnc-card gnc-card--surface" x="145" y="192" width="330" height="120" rx="8"></rect>
  <text class="gnc-t--strong" x="310" y="220">象限 III：手工架构，但在图内</text>
  <text class="gnc-t--sm" x="310" y="250">Transformer-XL · Compressive Transformer</text>
  <text class="gnc-t--xs" x="310" y="286">通过固定窗口或压缩机制扩展序列记忆</text>
</g>

<g class="gnc-node" style="animation-delay:.38s">
  <rect class="gnc-card gnc-card--surface" x="505" y="192" width="330" height="120" rx="8"></rect>
  <text class="gnc-t--strong" x="670" y="220">象限 IV：外部工程脚手架</text>
  <text class="gnc-t--sm" x="670" y="250">MemGPT / Letta · Mem0 · Zep · RAG · LangChain</text>
  <text class="gnc-t--xs" x="670" y="286">当前大多数应用层产品所在位置</text>
</g>

<path class="gnc-edge gnc-edge--coral gnc-flow" d="M670 190 V176" marker-end="url(#bb2-arrow-coral)"></path>
<path class="gnc-edge gnc-edge--coral gnc-flow gnc-flow--slow" d="M503 109 H479" marker-end="url(#bb2-arrow-coral)"></path>
</svg>
</div>
<figcaption>图 2　按「记忆是否在计算图内」与「读写策略是否由训练习得」划分的四个象限。从应用工程走向算法研究，通常需要沿箭头方向向上或向左推进。</figcaption>
</figure>

对我来说，这张图最大的作用不是给不同工作排高下，而是明确自己所处的位置。如果当前任务主要是做第四象限的外部记忆管理，那就应该按系统工程的标准去打磨检索质量、延迟和一致性；如果目标是做算法层面的研究，就需要把问题往上或者往左推进一格，要么让读写策略通过训练学出来，要么让记忆机制真正进入模型计算图。

## 六、对 BBOC 框架保留的几点怀疑

整理完上面这些收获后，我对 BBOC 本身仍然保留了一些怀疑，并不打算全盘接受。

最大的问题在于它的后验解释力过强，而可证伪性较弱。任何一种算法成功了，都可以事后归结为「它利用了某种合理的对称性」；任何一种算法失败了，也都可以说成「引入的结构先验过于僵化」。这种弹性让框架听起来很自洽，但很难作为严格的研究判据。

另外还有几处细节不够有说服力：

- 文中支撑核心论点的「Google 实验」没有披露具体替换成了哪类机器学习模型，属于无法核验的单一来源；
- 文中用雪花形态作类比时存在一层偷换：雪花的结构完全由物理定律决定，而智能体的行为在很大程度上受制于人工设定的环境与训练目标；
- 一方面强调具体算法并不关键，另一方面又把「利用对称性」列为最有效的创新方向，而对称性本身就是典型的手工结构先验。原文用「模型最终也会自己发现对称性」来化解这一矛盾，但这个说法只在假说自身成立的前提下才说得通。

因此，我更倾向于把 BBOC 当作一个筛选思路的参考框架，而不是当成已经证实的结论。

## 七、小结

读完这篇文章，并没有直接得到某个具体的实现方案，但它提供了几个在评估 agent memory 工作时可以反复对照的问题：

1. 这项工作利用了什么真实存在的数据或任务结构？记忆的访问策略是学出来的，还是人工写死的？
2. 它是在改善模型的优化或表示条件，还是仅仅在做上下文数据的搬运与拼接？
3. 记忆机制是否处于计算图之内？如果去掉提示词规则，梯度能否穿过读写过程？

记忆作为一个研究问题其实一直存在，只是在不同技术阶段，大家会用当时手头的工具重新提出一遍。在急着叠加新模块之前，先看清数据、策略和计算流分别落在哪一层，往往比套一个新框架更有用。
