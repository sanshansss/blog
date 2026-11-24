---
title: 大模型在航天任务中的已有工作：一份文献版图
published: 2026-11-23
description: 三十余篇公开文献的横向梳理：六个研究领域、五个彼此不可比的评测基准，以及三点相对确定的判断。
tags:
  - 文献综述
  - 航天
  - AI
  - agent
lang: zh
abbrlink: llm-aerospace-survey
toc: true
---

<!--
姊妹篇：GNC 单机配置智能体的实践与思考（/posts/gnc-design-agent/）
说明：原为《GNC 单机配置智能体的实践与思考》的文献综述章节，因篇幅与主题独立成篇。
-->

这篇是 [《GNC 单机配置智能体的实践与思考》](../gnc-design-agent/) 的姊妹篇。

在讨论下一步的工程拓展之前，有必要先了解一个基础问题：把大模型用于航天任务，目前学术界和工程界已经做到了哪一步。为此，我检索了这一方向近年公开的代表性工作，包括期刊综述、arXiv 预印本和机构技术报告，合计三十余篇。本文不追求穷举所有文献，而是先按工程环节划分领域，再为每个领域选取代表性工作说明其技术路线，最后梳理现有评测基准并总结几点认识。

## 一、研究领域的划分

如果按照「自动化了工程链路上的哪一环」来划分，现有公开工作大致分布在六个领域：

1. **任务与轨道设计**：处理从自然语言任务意图到轨迹或优化问题的转换，涵盖交会轨迹、低推力转移以及任务与运动规划；
2. **在轨控制与 GNC**：处理姿态与轨道控制律的辅助生成与监督，内部大致分为微调模型与改造上下文两条路线；
3. **在轨服务与空间机器人**：面向带视觉感知的近距离操作，如交会、接近与在轨巡检；
4. **遥测异常检测与运维**：面向在轨健康监测、故障诊断与地面系统运维；
5. **需求工程与基于模型的系统工程（MBSE）**：处理从文档到规范化需求、从需求到系统模型的转换与一致性验证；
6. **空间态势感知与调度规划**：涵盖星座和观测任务的资源分配，以及空间目标机动意图的推断与威胁评估。

从现有文献来看，这六个方向虽然具体任务不同，但在系统架构上普遍采用了相近的分工方式：语言模型负责语义翻译、规则组织和任务编排，具体的数值计算与物理求解仍交给确定性求解器或规划器完成，模型本身不直接承担物理计算。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 372" role="img" aria-label="六个研究领域与五个评测基准的版图">
<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card" x="20" y="30" width="270" height="70" rx="7"></rect><text class="gnc-t--strong" x="155" y="56">任务与轨道设计</text><text class="gnc-t--sm" x="155" y="80">PLUTO · HELIOS</text></g>
<g class="gnc-node" style="animation-delay:.12s"><rect class="gnc-card" x="315" y="30" width="270" height="70" rx="7"></rect><text class="gnc-t--strong" x="450" y="56">在轨控制与 GNC</text><text class="gnc-t--sm" x="450" y="80">ASTREA（唯一在轨验证）</text></g>
<g class="gnc-node" style="animation-delay:.19s"><rect class="gnc-card" x="610" y="30" width="270" height="70" rx="7"></rect><text class="gnc-t--strong" x="745" y="56">在轨服务与空间机器人</text><text class="gnc-t--sm" x="745" y="80">SpaceMind</text></g>
<g class="gnc-node" style="animation-delay:.26s"><rect class="gnc-card" x="20" y="120" width="270" height="70" rx="7"></rect><text class="gnc-t--strong" x="155" y="146">遥测异常检测与运维</text><text class="gnc-t--sm" x="155" y="170">ESA-ADB · ATSADBench</text></g>
<g class="gnc-node" style="animation-delay:.33s"><rect class="gnc-card" x="315" y="120" width="270" height="70" rx="7"></rect><text class="gnc-t--strong" x="450" y="146">需求工程与 MBSE</text><text class="gnc-t--sm" x="450" y="170">推理时干预（Capella）</text></g>
<g class="gnc-node" style="animation-delay:.4s"><rect class="gnc-card" x="610" y="120" width="270" height="70" rx="7"></rect><text class="gnc-t--strong" x="745" y="146">态势感知与调度规划</text><text class="gnc-t--sm" x="745" y="170">GURU</text></g>
<text class="gnc-label gnc-t--sm gnc-t--coral" x="450" y="216">共同范式：语言模型做语义翻译与任务编排，确定性求解器做计算</text>
<path class="gnc-edge gnc-edge--hair" d="M20 232 H880"></path>
<text class="gnc-label gnc-t--xs gnc-t--start" x="20" y="252">五个评测基准（任务契约不同，彼此不可比）</text>
<g class="gnc-node" style="animation-delay:.5s"><rect class="gnc-card gnc-card--surface" x="20" y="266" width="160" height="60" rx="6"></rect><text class="gnc-t--sm" x="100" y="288">AstroAgentBench</text><text class="gnc-t--xs" x="100" y="308">任务规划</text></g>
<g class="gnc-node" style="animation-delay:.55s"><rect class="gnc-card gnc-card--surface" x="195" y="266" width="160" height="60" rx="6"></rect><text class="gnc-t--sm" x="275" y="288">AstroMind</text><text class="gnc-t--xs" x="275" y="308">态势感知</text></g>
<g class="gnc-node" style="animation-delay:.6s"><rect class="gnc-card gnc-card--surface" x="370" y="266" width="160" height="60" rx="6"></rect><text class="gnc-t--sm" x="450" y="288">ATSADBench</text><text class="gnc-t--xs" x="450" y="308">时序异常</text></g>
<g class="gnc-node" style="animation-delay:.65s"><rect class="gnc-card gnc-card--surface" x="545" y="266" width="160" height="60" rx="6"></rect><text class="gnc-t--sm" x="625" y="288">APBench</text><text class="gnc-t--xs" x="625" y="308">领域知识</text></g>
<g class="gnc-node" style="animation-delay:.7s"><rect class="gnc-card gnc-card--amber" x="720" y="266" width="160" height="60" rx="6"></rect><text class="gnc-t--sm" x="800" y="288">ESA-ADB</text><text class="gnc-t--xs" x="800" y="308">真实在轨数据</text></g>
</svg>
</div>
<figcaption>图 1　按工程环节划分的六个研究领域及现有的五个评测基准。不同基准覆盖的知识层、规划层、态势层与运维层各不相同，彼此难以直接横向比较。</figcaption>
</figure>

## 二、各领域的代表性工作

**任务与轨道设计**领域最能体现上述分工思路。斯坦福提出的 **PLUTO**（arXiv:2610.07573）将自然语言任务描述映射为形式化数学约束，再接入序列凸规划的自动凸化流程，最终构造出可执行的最优控制问题。在覆盖十类约束的 50 个任务提示上，系统全部生成了可行轨迹，其中 94% 同时满足定量与定性要求。模型在这里只承担「自然语言到数学约束」的转换，轨迹求解仍由成熟优化器完成。同类工作还包括将需求直接转译为轨迹优化代码的语义约束合成方法，以及辅助完成庞特里亚金横截条件推导、符号验证与打靶代码生成的 HELIOS。

**在轨控制与 GNC** 领域值得优先关注 **ASTREA**（arXiv:2509.13380），它是目前公开文献中唯一完成在轨验证的系统。该项目部署在国际空间站的飞行继承硬件上，以热控为验证用例，采用资源受限的语言模型与强化学习控制器的异步协同架构。地面实验中，语言模型的监督提升了热稳定性；但在轨验证初期出现了明显问题——模型推理延迟与近地轨道快速热循环的时间尺度不匹配，直到后续把推理节奏与轨道周期对齐，性能才超过基线。这一实践经验很有参考价值：制约模型上星的往往不只是推理能力本身，还包括推理延迟与物理系统时间常数之间的耦合。

**在轨服务与空间机器人**方向以 **SpaceMind**（arXiv:2604.14399）为代表，其架构思路也与我们在 GNC 智能体中的实践比较接近。它将知识、工具和推理拆分成三个可独立扩展的模块：带动态路由的技能库、可配置的 MCP 工具集以及可注入的推理模式技能。借助 MCP-Redis 接口层，同一套代码可以在仿真与实物环境之间直接迁移；同时系统支持技能自演化，在不微调模型权重的前提下，将操作经验沉淀为持久化的技能文件。论文报告了覆盖 5 颗卫星、3 类任务、2 种环境的 192 次闭环测试，并在零代码改动的情况下迁移到物理机器人平台，交会任务成功率达到 100%。

**遥测异常检测与运维**方向可以参考 ESA 的异常检测基准对比研究（arXiv:2607.07335）。该工作基于 ESA-ADB 数据集，系统比较了多尺度卷积网络、图卷积网络、图注意力网络等监督方法，以及椭圆包络、经验累积分布离群检测等非监督方法，并专门评测了运行时间与可扩展性——这两项指标在工程落地时往往比单一精度分数更关键。另外，**ATSADBench**（arXiv:2601.12448）提供了首个专门面向航天时序数据的异常检测基准。

**需求工程与 MBSE** 领域可以关注基于推理时干预的方法（arXiv:2503.14130）。它既不依赖微调，也不单纯依赖提示词，而是通过在推理阶段干预模型内部状态来实现细粒度控制，并在 Capella 的 SysML 模型图表示上检查需求是否得到满足。这条路线正好对应需求、架构、行为协同建模中容易缺失的验证环节。此外，也有工作使用模块化检索增强生成流水线，结合任务简报与工程标准自动起草需求文档，并在真实任务资料上做过验证。

**空间态势感知与调度规划**领域中，**GURU**（arXiv:2611.01001）的设计原则很有代表性：AI 可以用于更快地搜索候选安全动作，但不应由它直接裁定什么是安全的。据此，系统将决策权拆分为三层：学习模型负责提议、排序和加速；符号规则引擎在执行前按硬性限值逐项校验关键动作；经过验证的物理模型负责最终确认。在一个交会风险判定实验中，由经验证轨道传播过程约束的冻结自监督世界模型，得分高于包括全量微调语言模型在内的其他四种方法，且不同随机种子间的方差显著更低。这说明引入确定性物理约束不仅提升了可信度，也不必以牺牲精度为代价。

## 三、评测基准的现状

将现有文献梳理一遍后可以看到，航天大模型方向目前只有五个相对成体系的公开评测基准，且覆盖层面差异很大：

- **AstroAgentBench**（arXiv:2601.11354）：面向可执行的航天任务规划，包含调度、观测规划、星座设计和中继支持等七个任务家族。Agent 提交规划产物后，由外部验证器检查格式合法性、时序、几何、资源约束与任务价值，并与专用求解器的参考解对比。在 5 个 Agent 系统和 35 个留出案例上，最强系统在部分任务接近甚至超过参考分，但整体上仍存在质量波动。在目前已知的 Agent 基准中，明确纳入星座设计的只有这一家。
- **AstroMind**（arXiv:2605.24573）：面向空间态势感知，结合高保真天体动力学仿真与真实观测约束，构造意图推断、机动参数估计和威胁评估三类推理任务，并引入真实传感噪声和多源文本情报，重点考察对「为何机动」的解释能力。
- **ATSADBench**（arXiv:2601.12448）：面向航天软件时序异常检测，由 9 项任务组合三类异常模式、单变量与多变量信号以及闭环/开环反馈场景构成，合计十万余个数据点，用于评估开源模型在直接标注和基于预测两种方式下的表现。
- **APBench**（配套 Taramandal-GPT，arXiv:2609.24246）：面向航天领域知识问答，包含 299 道题目，涵盖基础到高阶航天科学内容，主要测试多步推理与符号计算能力。
- **ESA-ADB**：目前唯一基于真实在轨数据的基准，来自 ESA 三个实际任务的遥测记录与人工标注异常，已经衍生出多项横向对比研究。它的优势是数据真实且可复现，但范围仅限于异常检测。

整体来看，这五个基准大致覆盖了知识、规划、态势和运维几个环节，但彼此的任务定义、评价指标和成功标准互不相通，尚无法在统一口径下横向比较不同系统的综合工程能力。

## 四、三点判断

结合以上文献和自身项目实践，可以得出三点相对确定的认识。

**第一，权威分层正在成为航天智能体的基本约束。** GURU 的「提议—检查—判定」三层架构、PLUTO 的约束校验、ASTREA 的人工监督，以及领域综述中强调的「权威接地（Authoritative Grounding）」，在思路上指向同一件事。Alandihallaj 等人发表于 *IEEE Access* 的综述（2026 年，第 14 卷，153884–153914 页）也进一步指出，即便完成了工具与物理接地，仍不足以直接满足飞行就绪要求，还必须配套完整的验证与确认（V&V）、运行时监控和安全防护机制。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 265" role="img" aria-label="航天智能体的三层权威边界：提议、规则检查与物理确认">
<defs>
<marker id="as2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="as2-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
<marker id="as2-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-teal)"></path></marker>
</defs>

<g class="gnc-node" style="animation-delay:.05s">
  <rect class="gnc-card gnc-card--core gnc-seq" x="28" y="34" width="210" height="92" rx="8" style="animation-delay:0s"></rect>
  <text class="gnc-t--on-solid gnc-t--strong" x="133" y="62">第一层：语言 / 学习模型</text>
  <text class="gnc-t--on-solid gnc-t--sm" x="133" y="84">提议 · 排序 · 语义翻译</text>
  <text class="gnc-t--on-solid gnc-t--xs" x="133" y="106">不具备安全裁定权</text>
</g>

<g class="gnc-node" style="animation-delay:.16s">
  <rect class="gnc-card gnc-card--amber gnc-seq" x="290" y="34" width="210" height="92" rx="8" style="animation-delay:1.8s"></rect>
  <text class="gnc-t--strong gnc-t--amber" x="395" y="62">第二层：符号与规则引擎</text>
  <text class="gnc-t--sm" x="395" y="84">硬约束校验 · 接口与限值检查</text>
  <text class="gnc-t--xs" x="395" y="106">PLUTO 约束校验 / GURU 规则检查</text>
</g>

<g class="gnc-node" style="animation-delay:.27s">
  <rect class="gnc-card gnc-card--teal gnc-seq" x="552" y="34" width="210" height="92" rx="8" style="animation-delay:3.6s"></rect>
  <text class="gnc-t--strong gnc-t--teal" x="657" y="62">第三层：经验证物理模型</text>
  <text class="gnc-t--sm" x="657" y="84">动力学仿真 · 优化器最终确认</text>
  <text class="gnc-t--xs" x="657" y="106">形成可核查的验证证据</text>
</g>

<g class="gnc-node" style="animation-delay:.38s">
  <rect class="gnc-card gnc-card--surface" x="796" y="48" width="84" height="64" rx="7"></rect>
  <text class="gnc-t--sm gnc-t--strong" x="838" y="72">执行 /</text>
  <text class="gnc-t--sm gnc-t--strong" x="838" y="90">输出方案</text>
</g>

<path class="gnc-edge gnc-flow" d="M240 80 H286" marker-end="url(#as2-arrow)"></path>
<path class="gnc-edge gnc-flow" d="M502 80 H548" marker-end="url(#as2-arrow)"></path>
<path class="gnc-edge gnc-edge--teal gnc-flow" d="M764 80 H792" marker-end="url(#as2-arrow-teal)"></path>

<g class="gnc-node" style="animation-delay:.48s">
  <rect class="gnc-card gnc-card--surface" x="200" y="182" width="500" height="50" rx="8"></rect>
  <text class="gnc-t--sm gnc-t--strong" x="450" y="201">运行时监控 · V&amp;V 证据链 · 人工审批兜底</text>
  <text class="gnc-t--xs" x="450" y="220">ASTREA 人工监督与时间尺度同步 / IEEE Access (2026) 飞前就绪限定</text>
</g>

<path class="gnc-edge gnc-edge--coral gnc-flow" d="M657 128 V162 H133 V130" marker-end="url(#as2-arrow-coral)"></path>
<text class="gnc-label gnc-t--xs gnc-t--coral" x="395" y="152">不满足约束或仿真越界时退回重提</text>
</svg>
</div>
<figcaption>图 2　跨领域收敛出的三层权威边界。语言模型只负责提出候选与编排，安全边界由符号规则和经验证的物理模型共同把关。</figcaption>
</figure>

**第二，领域知识资产可以沉淀在模型之外，并持续演进。** SpaceMind 通过技能自演化把操作经验蒸馏为文件，GUIDE 在不修改模型权重的前提下演化规则手册，两者都说明工程能力未必非要通过反复微调模型来获得。这与 Simulink 官方提供的技能目录、STK 配套的专业技能集，本质上是同一种工程思路。

**第三，当前公开研究仍存在几处明显空白。** 例如，软硬件联合设计尚未见到直接覆盖的工作；现有研究大多停留在任务级与系统级，单机或部组件级选型几乎没有公开讨论；国内院所普遍使用的封闭型号软件如何封装为可调用工具，公开资料也很少涉及；此外，型号工程所需的验证证据链、本地部署小模型与涉密数据的结合，以及除热控之外的在轨验证案例，目前都还比较欠缺。姊妹篇中讨论的 GNC 软硬件联合设计方向，正好处于这些空白之中。

总体来看，推进这一方向并不一定需要从头发明全新的基础算法，更务实的路径是把上述已经分别验证过的能力模块，逐步接到一条完整的航天工程设计链条上。
