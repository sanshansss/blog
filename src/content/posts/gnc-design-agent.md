---
title: GNC 单机配置智能体的实践与思考
published: 2026-11-23
description: 一次 GNC 单机配置智能体的实践记录：为什么工程智能体离不开型号库、知识库与仿真工具，以及从配置决策走向软硬件联合设计的下一步。
tags:
  - 航天
  - AI
  - agent
  - GNC
  - 技术传承
lang: zh
abbrlink: gnc-design-agent
toc: true
---

<!--
说明：本文为网页版，插图由原 TikZ 静态图改写为内联 SVG + CSS 动画；
原第五部分「文献综述」已独立成篇《大模型在航天任务中的已有工作》。
-->

## 一、已有实践：GNC 单机配置智能体

### 1. 项目背景与整体思路

本项目主要面向航天器 GNC（制导、导航与控制）分系统方案设计，研究如何利用大语言模型和智能体技术，实现从总体任务需求到单机设备选型、系统配置及仿真验证的自动化设计流程。

传统的航天器单机配置流程通常是需求驱动的：首先根据总体指标，逐层分解出分系统指标，再进一步得到敏感器、执行机构等单机设备的性能要求，最后依据单机指标进行型号选型。这种方式具有明确的工程逻辑，但对设计人员的专业经验依赖较强，而且需要人工处理大量指标映射、设备手册和型号数据。

在引入大语言模型之后，我们考虑能否改变这一传统交互方式。大模型经过大规模预训练，具备较广泛的专业知识和语义推理能力，因此用户不一定需要手动完成所有中间指标的填写和转换，可以直接提供总体任务需求，由大模型理解任务、分析约束，并提出符合要求的单机型号及组合方案。

这里需要强调，并不是在工程上完全取消指标分解，而是希望减少人工显式分解和逐项选型的工作，将指标预算、物理约束和型号匹配更多地封装到智能体内部，使用户能够通过更自然的需求描述完成设计。

但仅仅连接一个通用大模型 API，或者直接使用网页上的 DeepSeek、GPT 等产品，并不能形成真正有工程价值的航天设计智能体。

主要存在两个问题：

第一，型号真实性无法保证。通用大模型可能生成不存在的设备型号、错误的性能参数，或者推荐公开资料中没有覆盖的设备。对于航天院所而言，部分内部型号和技术资料也无法直接通过互联网获取。

第二，本地部署模型的知识能力存在局限。考虑到数据安全和实际部署要求，工程应用往往需要使用本地模型，但本地模型的参数规模和预训练知识可能不如最先进的通用大模型，直接进行端到端的专业设计推理，容易出现知识不足和工程规则理解偏差。

因此，本项目没有采用单纯依赖大模型的方式，而是构建了两个重要的辅助系统：单机型号数据库和航天工程知识库。

### 2. 核心架构：大模型、数据库、知识库与仿真工具协同

整个系统可以理解为由大模型负责理解和决策，数据库负责提供真实型号，知识库负责提供专业规则，物理模型和仿真程序负责工程计算与验证。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 420" role="img" aria-label="GNC 单机配置智能体的协同架构">
<defs>
<marker id="g1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="g1-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-teal)"></path></marker>
<marker id="g1-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
<marker id="g1-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-amber)"></path></marker>
</defs>
<path class="gnc-edge gnc-edge--amber gnc-flow gnc-flow--slow" d="M267 58 V32 H631 V54" marker-end="url(#g1-arrow-amber)"></path>
<text class="gnc-label gnc-t--xs gnc-t--amber" x="450" y="20">调用仿真</text>
<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card" x="10" y="60" width="150" height="70" rx="7"></rect><text x="85" y="88">任务需求</text><text class="gnc-t--sm" x="85" y="110">r</text></g>
<g class="gnc-node" style="animation-delay:.15s"><rect class="gnc-card gnc-card--core" x="192" y="60" width="150" height="70" rx="7"></rect><rect class="gnc-halo" x="192" y="60" width="150" height="70" rx="7"></rect><text class="gnc-t--on-solid gnc-t--strong" x="267" y="86">大模型编排</text><text class="gnc-t--on-solid gnc-t--sm" x="267" y="108">πθ</text></g>
<g class="gnc-node" style="animation-delay:.25s"><rect class="gnc-card" x="374" y="60" width="150" height="70" rx="7"></rect><text x="449" y="88">候选配置</text><text class="gnc-t--sm" x="449" y="110">C = {c₁ … cₙ}</text></g>
<g class="gnc-node" style="animation-delay:.35s"><rect class="gnc-card gnc-card--teal" x="556" y="60" width="150" height="70" rx="7"></rect><text x="631" y="88">模型 / 仿真</text><text class="gnc-t--sm" x="631" y="110">M, S</text></g>
<g class="gnc-node" style="animation-delay:.45s"><rect class="gnc-card gnc-card--amber" x="738" y="60" width="150" height="70" rx="7"></rect><text x="813" y="88">结果评价</text><text class="gnc-t--sm" x="813" y="110">J(C, y)</text></g>
<path class="gnc-edge" d="M162 95 H188" marker-end="url(#g1-arrow)"></path>
<path class="gnc-edge" d="M344 95 H370" marker-end="url(#g1-arrow)"></path>
<path class="gnc-edge" d="M526 95 H552" marker-end="url(#g1-arrow)"></path>
<path class="gnc-edge" d="M708 95 H734" marker-end="url(#g1-arrow)"></path>
<rect class="gnc-card gnc-card--ghost" x="205" y="225" width="150" height="110" rx="8"></rect>
<text class="gnc-label gnc-t--sm gnc-t--teal" x="280" y="245">工程资源</text>
<g class="gnc-node" style="animation-delay:.55s"><rect class="gnc-card gnc-card--teal" x="218" y="258" width="124" height="30" rx="5"></rect><text class="gnc-t--sm" x="280" y="273">型号库 D</text></g>
<g class="gnc-node" style="animation-delay:.65s"><rect class="gnc-card gnc-card--teal" x="218" y="296" width="124" height="30" rx="5"></rect><text class="gnc-t--sm" x="280" y="311">知识库 K</text></g>
<path class="gnc-edge gnc-edge--teal gnc-flow" d="M267 142 V221" marker-start="url(#g1-arrow-teal)" marker-end="url(#g1-arrow-teal)"></path>
<text class="gnc-label gnc-t--sm gnc-t--teal gnc-t--start" x="277" y="180">检索</text>
<path class="gnc-edge gnc-edge--teal" d="M357 273 H449 V134" marker-end="url(#g1-arrow-teal)"></path>
<path class="gnc-edge gnc-edge--coral gnc-flow" d="M813 132 V395 H176 V78 H188" marker-end="url(#g1-arrow-coral)"></path>
<text class="gnc-label gnc-t--sm gnc-t--coral gnc-t--start" x="430" y="386">ΔC = J(C, y)　反馈修正</text>
</svg>
</div>
<figcaption>图 1　GNC 单机配置智能体的协同架构。大模型只做语义理解与任务编排，型号库和知识库提供真实数据与工程规则，模型/仿真提供确定性计算，评价结果沿底部回路回流修正配置。</figcaption>
</figure>

**（1）单机型号数据库：保证型号与参数的真实性**

我们采用关系型数据库管理航天器敏感器和执行机构型号，将不同单机的参数统一整理成标准化字段，形成可供程序快速检索和筛选的型号数据库。

目前整理了9类单机、400余种型号，覆盖星敏感器、太阳敏感器、地球敏感器、陀螺仪、磁强计、反作用飞轮、控制力矩陀螺、磁力矩器和推力器等设备。

数据库不仅记录型号名称，还包含质量、功耗、精度、更新率、力矩、角动量、工作温度、可靠性等不同类型的工程参数。

在实际运行中，大模型不再凭借自身记忆编造型号，而是根据任务需求调用数据库查询工具，通过 SQL 进行参数筛选和硬约束过滤，获得真实存在且满足基本工程条件的候选设备。

这样就将大模型的语义理解能力与数据库的确定性查询能力结合起来。

**（2）航天工程知识库：补充专业知识与工程规则**

数据库能够解决型号和参数的真实性问题，但无法覆盖所有航天工程知识。

例如，不同轨道环境下的设备适用性、不同姿态控制任务对执行机构的要求、设备之间的兼容性，以及一些设计人员默认掌握但没有明确写入数据库的工程规则。

对于通用大模型而言，这些知识可能存在于预训练数据中；但对于本地部署的小模型而言，不能假设其已经充分掌握这些专业知识。

因此，我们引入 RAG（检索增强生成）技术，将院所已有的设备资料、设计规范、技术报告、专业书籍和历史设计案例整理为外部知识库。

在每次任务执行过程中，智能体会根据当前问题进行多轮知识检索，将检索结果作为上下文提供给大模型，再由大模型结合这些专业资料进行判断。

项目采用 LightRAG 等技术组织知识，结合语义检索和知识图谱关系检索，提高专业知识的召回能力。

这样，大模型在回答专业问题时，不再完全依赖预训练阶段形成的知识，而是能够参考特定领域的工程资料和设计规则。

从这个角度看，专业智能体的关键并不一定是重新训练一个航天领域的大模型，也可以通过外部知识、结构化数据和专业工具，将通用模型组织成具有特定工程能力的专家智能体。

相较于直接训练垂类模型，这种方式的资源消耗相对较低，知识更新也更加灵活。模型本身可以更换，知识库和数据库也可以独立更新，还能够根据不同任务选择是否引入特定领域知识。

当然，这并不意味着 RAG 可以完全弥补模型能力不足。检索质量、知识来源和模型本身的推理能力仍然会共同影响最终结果。

**（3）物理模型与仿真工具：保证设计结果的工程可行性**

除了知识和数据，航天器设计还必须依赖专业物理模型。

单机参数满足数据库中的静态约束，并不代表组合起来之后一定能够满足整个姿态控制系统的动态性能要求。

因此，项目中还构建了指标分解模型、敏感器模型、执行机构模型以及姿态动力学仿真程序。

这些模型分别承担不同任务：指标分解模型将总体需求转化为可计算的单机性能约束；敏感器和执行机构模型描述真实设备的测量和控制特性；姿态动力学模型则用于验证设备组合之后的闭环控制性能。

通过仿真结果，可以进一步判断姿态稳定度、指向精度、机动能力、控制力矩和执行机构饱和等指标是否满足要求。

这也是该系统区别于普通大模型问答的重要地方：它不仅需要给出一个看似合理的型号配置，还需要将配置放入工程模型中进行验证。

### 3. 大模型在整个系统中的具体作用

大模型在整个系统中主要承担需求理解、任务编排、工具调用、方案推理和结果解释等工作。

首先，用户输入总体任务需求后，大模型负责理解自然语言，提取任务类型、轨道条件、姿态控制指标和资源约束，将其转换为工具能够处理的结构化参数。

随后，大模型根据当前任务调用知识库和数据库，获取相关工程规则及设备候选型号。

在获得候选设备之后，大模型负责进行组合决策，生成不同侧重点的配置方案，例如高性能方案、均衡方案和经济方案。

接下来，智能体调用仿真程序，将配置参数传入动力学模型，执行姿态控制仿真。仿真完成后，大模型再读取仿真指标，判断哪些约束满足、哪些指标存在问题，并根据反馈提出新的配置调整建议。

因此，整个过程可以概括为：

> 需求理解 → 知识检索 → 型号筛选 → 配置生成 → 仿真验证 → 结果评价 → 反馈修正。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 280" role="img" aria-label="配置流程的七个阶段与迭代状态">
<defs>
<marker id="g2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="g2-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
</defs>
<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card gnc-seq" x="17" y="50" width="110" height="60" rx="7" style="animation-delay:0s"></rect><text x="72" y="80">需求理解</text></g>
<g class="gnc-node" style="animation-delay:.12s"><rect class="gnc-card gnc-seq" x="143" y="50" width="110" height="60" rx="7" style="animation-delay:.8s"></rect><text x="198" y="80">知识检索</text></g>
<g class="gnc-node" style="animation-delay:.19s"><rect class="gnc-card gnc-seq" x="269" y="50" width="110" height="60" rx="7" style="animation-delay:1.6s"></rect><text x="324" y="80">型号筛选</text></g>
<g class="gnc-node" style="animation-delay:.26s"><rect class="gnc-card gnc-card--core gnc-seq" x="395" y="50" width="110" height="60" rx="7" style="animation-delay:2.4s"></rect><text class="gnc-t--on-solid gnc-t--strong" x="450" y="80">配置生成</text></g>
<g class="gnc-node" style="animation-delay:.33s"><rect class="gnc-card gnc-card--teal gnc-seq" x="521" y="50" width="110" height="60" rx="7" style="animation-delay:3.2s"></rect><text x="576" y="80">仿真验证</text></g>
<g class="gnc-node" style="animation-delay:.4s"><rect class="gnc-card gnc-card--amber gnc-seq" x="647" y="50" width="110" height="60" rx="7" style="animation-delay:4s"></rect><text x="702" y="80">结果评价</text></g>
<g class="gnc-node" style="animation-delay:.47s"><rect class="gnc-card gnc-card--coral gnc-seq" x="773" y="50" width="110" height="60" rx="7" style="animation-delay:4.8s"></rect><text x="828" y="80">反馈修正</text></g>
<path class="gnc-edge" d="M129 80 H139" marker-end="url(#g2-arrow)"></path>
<path class="gnc-edge" d="M255 80 H265" marker-end="url(#g2-arrow)"></path>
<path class="gnc-edge" d="M381 80 H391" marker-end="url(#g2-arrow)"></path>
<path class="gnc-edge" d="M507 80 H517" marker-end="url(#g2-arrow)"></path>
<path class="gnc-edge" d="M633 80 H643" marker-end="url(#g2-arrow)"></path>
<path class="gnc-edge" d="M759 80 H769" marker-end="url(#g2-arrow)"></path>
<text class="gnc-label gnc-t--xs gnc-t--start" x="300" y="182">迭代状态</text>
<g class="gnc-node" style="animation-delay:.6s"><rect class="gnc-card gnc-card--surface" x="300" y="195" width="300" height="45" rx="8"></rect><text x="450" y="218">sₖ = (r, q, C, y, J)</text></g>
<path class="gnc-edge gnc-edge--coral gnc-flow" d="M828 112 V217 H604" marker-end="url(#g2-arrow-coral)"></path>
<text class="gnc-label gnc-t--sm gnc-t--coral" x="716" y="206">Φ(sₖ)</text>
<path class="gnc-edge gnc-edge--coral gnc-flow gnc-flow--slow" d="M296 217 H72 V114" marker-end="url(#g2-arrow-coral)"></path>
<text class="gnc-label gnc-t--sm gnc-t--coral" x="190" y="206">下一轮 k+1</text>
</svg>
</div>
<figcaption>图 2　一次配置的七个环节与迭代状态。阶段本身是串行的；闭环由评价之后的反馈修正完成，状态 sₖ 把本轮的约束、候选、仿真结果与评分一起带入下一轮。</figcaption>
</figure>

从智能体技术角度看，这实际上是一个典型的工具调用与反馈循环，具有 ReAct（Reasoning and Acting）的基本特征。

目前系统整体仍然偏向 Workflow，即预先定义好主要执行节点和流程顺序，再由大模型在各个节点完成具体的理解和决策。其优势是每个环节的输入输出比较明确，容易控制和追溯；不足是大模型的自主规划能力受到工作流设计限制。例如，检索次数、执行顺序和部分分支条件需要预先设置，而不是完全由模型自主决定。

### 4. 运行效果与当前不足

目前系统已经能够通过网页界面输入总体任务指标，一键执行需求解析、型号筛选、方案生成和动力学仿真，最终输出一套 GNC 分系统硬件配置及相应的仿真结果和指标分析。

在程序调用方面，目前主要通过智能体调用已有 Python 仿真程序，也具备通过程序接口调用 MATLAB 的技术可行性。

需要注意，调用仿真程序并不等于大模型能够自动生成任意工程仿真软件。现阶段更多是由大模型理解任务、生成仿真参数和配置，再调用已经开发好的程序执行计算。

当前系统仍然存在几个比较明显的不足。

第一，工作流的自主性有限。目前主要依靠预先设计好的执行流程，尚未充分实现根据任务复杂程度自主规划、动态选择工具和调整执行策略的 Agentic 能力。

第二，数据资产的规范性不足。项目在获取院所单机资料时，部分数据最初以 Word 文档等非结构化形式提供，型号参数缺乏统一管理和标准化字段。这种情况不仅增加了数据库建设成本，也限制了后续与 AI 系统的深度结合。

第三，知识库质量难以保证。不同来源的书籍、论文和型号报告在准确性、完整性和适用范围上存在差异，低质量文本、错误识别内容和过时规则可能影响模型判断，甚至与模型自身已有知识产生冲突。因此，知识库不能简单地把所有资料导入后就认为形成了专家知识，还需要经过筛选、校验、分类和版本管理。

第四，工程模型的覆盖范围有限。目前主要依赖已有的单机数学模型和姿态动力学仿真程序，尚未形成覆盖不同层级、不同专业和不同复杂度的完整模型库。

第五，仿真工具的自动化接入仍然存在困难。航天领域常用的软件并不一定天然支持大模型调用，部分工具接口封闭、文档不完善，或者需要依赖特定版本和授权环境。如何将这些专业软件统一封装成智能体可以调用的工具，是后续工程化的重要问题。

总体来看，现有项目已经验证了 AI 可以参与航天器专业设备选型、系统配置和工程仿真，但目前主要解决的是配置决策问题，距离完整的工程模型自动构建和软硬件联合设计还有进一步发展的空间。

## 二、技术拓展：从调用已有程序到自动构建工程模型

### 1. MATLAB Agent 论文的主要思路

最近阅读的论文《基于 AI Agent 的载人航天软件需求—架构—行为协同建模与可执行验证方法》，提供了一个值得借鉴的方向。

这篇论文研究的不是航天器硬件选型，而是利用 AI Agent 将自然语言需求转化为软件架构、行为模型和可执行验证结果。

其核心思路是：不再仅仅让大模型调用已经写好的仿真程序，而是通过 Agent 和 MATLAB 工具接口，让模型能够在运行过程中创建、配置和修改工程模型，再利用 MATLAB 自身的模型检查和仿真能力完成验证。

论文采用了几个关键技术。

首先是结构化语义中间表示（SIR）。自然语言需求不能直接作为复杂工程模型的可靠输入，因此需要将需求转换为结构化信息，明确需求标识、触发条件、时间约束、优先级、输入输出接口、功能组件、行为状态以及验证场景等内容。

其次是 Skill。Skill 将需求句法、命名规则、状态建模方法、接口模板、检查顺序和人工确认节点封装起来，使大模型能够按照预先定义的工程规范执行操作。

然后是 AI Agent。Agent 负责任务分解、维护不同建模任务之间的依赖关系，以及选择相应的工具执行操作。

最后通过 MATLAB MCP Server，将 Agent 的操作连接到 System Composer、Stateflow、Requirements Toolbox 和 Simulink 等工程软件，完成组件创建、接口连接、状态机配置、模型检查和仿真。

整个流程并不是让大模型直接凭空生成一个完整工程软件，而是让大模型理解需求、组织建模任务，再通过工程工具接口执行确定性的模型创建和修改操作。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 360" role="img" aria-label="MATLAB Agent 的需求到模型链路">
<defs>
<marker id="g3-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="g3-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-teal)"></path></marker>
<marker id="g3-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
</defs>
<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card gnc-card--amber" x="10" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--sm" x="65" y="45">结构化语义 q</text></g>
<g class="gnc-node" style="animation-delay:.1s"><rect class="gnc-card gnc-card--surface" x="120" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="175" y="45">标识 id</text></g>
<g class="gnc-node" style="animation-delay:.13s"><rect class="gnc-card gnc-card--surface" x="230" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="285" y="45">触发 trg</text></g>
<g class="gnc-node" style="animation-delay:.16s"><rect class="gnc-card gnc-card--surface" x="340" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="395" y="45">时间 t</text></g>
<g class="gnc-node" style="animation-delay:.19s"><rect class="gnc-card gnc-card--surface" x="450" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="505" y="45">接口 io</text></g>
<g class="gnc-node" style="animation-delay:.22s"><rect class="gnc-card gnc-card--surface" x="560" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="615" y="45">组件 cmp</text></g>
<g class="gnc-node" style="animation-delay:.25s"><rect class="gnc-card gnc-card--surface" x="670" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="725" y="45">状态 st</text></g>
<g class="gnc-node" style="animation-delay:.28s"><rect class="gnc-card gnc-card--surface" x="780" y="26" width="110" height="38" rx="6"></rect><text class="gnc-t--xs" x="835" y="45">场景 scn</text></g>
<path class="gnc-edge gnc-edge--hair" stroke-dasharray="5 4" d="M225 108 V66"></path>
<text class="gnc-label gnc-t--xs gnc-t--amber gnc-t--start" x="235" y="88">字段契约</text>
<g class="gnc-node" style="animation-delay:.32s"><rect class="gnc-card" x="10" y="110" width="130" height="60" rx="7"></rect><text x="75" y="140">自然语言需求</text></g>
<g class="gnc-node" style="animation-delay:.38s"><rect class="gnc-card gnc-card--amber" x="160" y="110" width="130" height="60" rx="7"></rect><text x="225" y="140">SIR　q</text></g>
<g class="gnc-node" style="animation-delay:.44s"><rect class="gnc-card" x="310" y="110" width="130" height="60" rx="7"></rect><text x="375" y="140">Skill　Kₛ</text></g>
<g class="gnc-node" style="animation-delay:.5s"><rect class="gnc-card gnc-card--core" x="460" y="110" width="130" height="60" rx="7"></rect><rect class="gnc-halo" x="460" y="110" width="130" height="60" rx="7"></rect><text class="gnc-t--on-solid gnc-t--strong" x="525" y="140">Agent　π</text></g>
<g class="gnc-node" style="animation-delay:.56s"><rect class="gnc-card" x="610" y="110" width="130" height="60" rx="7"></rect><text x="675" y="140">MATLAB MCP</text></g>
<g class="gnc-node" style="animation-delay:.62s"><rect class="gnc-card gnc-card--teal" x="760" y="110" width="130" height="60" rx="7"></rect><text x="825" y="140">MATLAB 工具</text></g>
<path class="gnc-edge" d="M142 140 H156" marker-end="url(#g3-arrow)"></path>
<path class="gnc-edge" d="M292 140 H306" marker-end="url(#g3-arrow)"></path>
<path class="gnc-edge" d="M442 140 H456" marker-end="url(#g3-arrow)"></path>
<path class="gnc-edge" d="M592 140 H606" marker-end="url(#g3-arrow)"></path>
<path class="gnc-edge" d="M742 140 H756" marker-end="url(#g3-arrow)"></path>
<g class="gnc-node" style="animation-delay:.7s"><rect class="gnc-card gnc-card--surface" x="460" y="250" width="130" height="60" rx="7"></rect><text x="525" y="280">断言 A ⊨ q</text></g>
<g class="gnc-node" style="animation-delay:.76s"><rect class="gnc-card gnc-card--surface" x="610" y="250" width="130" height="60" rx="7"></rect><text x="675" y="280">检查 / 仿真</text></g>
<g class="gnc-node" style="animation-delay:.82s"><rect class="gnc-card gnc-card--teal" x="760" y="250" width="130" height="60" rx="7"></rect><text x="825" y="280">模型制品 A</text></g>
<path class="gnc-edge gnc-edge--teal" d="M825 172 V248" marker-end="url(#g3-arrow-teal)"></path>
<path class="gnc-edge gnc-edge--teal" d="M758 280 H742" marker-end="url(#g3-arrow-teal)"></path>
<path class="gnc-edge gnc-edge--teal" d="M608 280 H592" marker-end="url(#g3-arrow-teal)"></path>
<path class="gnc-edge gnc-edge--coral gnc-flow" d="M525 248 V172" marker-end="url(#g3-arrow-coral)"></path>
<text class="gnc-label gnc-t--sm gnc-t--coral gnc-t--start" x="537" y="214">受限修复</text>
</svg>
</div>
<figcaption>图 3　论文中的 Agent 链路：需求先被拆成结构化语义（SIR），Skill 约束 Agent 通过 MATLAB MCP 操作工程工具，最后用检查与场景断言判定模型是否满足需求；失败时只允许做受限修复。</figcaption>
</figure>

### 2. 论文中的代码和模型是否实时生成？

这是一个需要区分的问题。

根据论文的描述，Agent 能够在运行过程中通过 MATLAB 工具接口创建和配置模型制品，工程师没有直接在 MATLAB 图形界面中手工增删模型元素。

因此，可以认为它具备运行时自动构建和修改工程模型的能力。

但这并不等于所有 MATLAB 代码都是由大模型实时从零生成的。

论文没有充分披露所有底层工具调用和代码生成细节，也没有证明其能够在没有预置 Skill、工具封装和建模规则的情况下，直接生成任意复杂的 MATLAB 源代码。

更准确地说，这种方式是预先准备工程工具、接口和规则，由 Agent 在运行过程中动态组织操作，创建和修改工程模型。

这实际上是一种更适合工程应用的技术路线：不要求大模型重新实现 MATLAB 的建模能力，而是让它学会使用 MATLAB 已经具备的建模和仿真能力。

### 3. 论文的运行效果与不足

论文以载人航天器舱内热环境监测与双风机控制为案例，构建了包含18条需求、7个功能、5个逻辑组件、5个状态、19条状态转移和9个仿真场景的工程模型。

实验结果中，34项接口检查全部通过，18条需求全部建立了完整追溯关系，9个场景中的41项机器断言全部通过。

更值得关注的是，系统在仿真过程中发现了一个双风机同时失效时执行机构降级标志的语义错误。这个错误虽然能够通过静态结构检查和模型编译，但在场景断言中被发现，随后由 Agent 修改并重新验证。

这个案例说明，Agent 不仅可以生成工程模型，还能够利用仿真结果发现模型中的逻辑问题，并进行受限修复。

不过，这篇论文也有比较明显的局限。

首先，案例属于非敏感合成场景，只有一个相对简单的控制系统，不能充分证明该方法已经具备复杂航天型号软件的工程泛化能力。

其次，论文虽然展示了完整的 Agent、Skill 和 MATLAB MCP 工具调用链路，但对底层 Agent 框架、规划器和执行器的具体实现披露有限，难以判断其自主规划能力究竟达到什么程度。

另外，论文验证的是模型级的创建、检查和仿真，并没有涉及实际飞行软件代码生成、实时操作系统集成、硬件在环试验和型号软件保证活动。100%的通过率也仅对应已经定义的场景和断言，不能直接理解为系统整体可靠性达到100%。

因此，我认为这篇论文的价值主要在于展示了一种可落地的工程技术路线，而不是已经证明 AI 能够独立完成复杂航天软件设计。

### 4. 与现有 GNC 单机配置智能体的区别

两者有相似之处，但解决的问题并不相同。

现有 GNC 单机配置智能体主要解决的是硬件配置决策问题。它从任务需求出发，利用数据库和知识库选择真实的敏感器、执行机构型号，再将组合方案放入姿态动力学模型中进行验证。

MATLAB Agent 论文主要解决的是软件工程模型构建问题。它从软件需求出发，生成结构化需求表示、软件架构和行为模型，再利用 MATLAB 工具完成检查与仿真验证。

两者的核心差异可以概括为：

- GNC 单机配置智能体：重点在于选择什么设备、如何组合、能否满足系统指标。
- MATLAB Agent：重点在于如何把需求转化为工程模型、如何建立架构与行为之间的联系、如何验证模型是否符合需求。

现有 GNC 智能体的优势在于拥有真实型号数据库、专业航天知识和物理动力学验证能力，解决的是一个具有明确工程对象的设计问题。

MATLAB Agent 的优势在于能够进一步操作工程软件，自动创建和修改模型，并通过需求追溯、接口检查和场景断言形成验证证据。

两者实际上具有互补性。前者负责硬件配置决策，后者可以为后续软件建模和自动化验证提供技术参考。

从扩展性来看，GNC 智能体增加新的设备类型，需要扩充型号数据、指标约束、设备模型和设计规则；MATLAB Agent 增加新的工程任务，则需要扩充相应的 Skill、模型组件模板、接口操作和验证规则。

因此，两者都不是简单更换一个大模型就能够扩展到其他领域，而是需要持续积累特定工程领域的数据、模型和工具。

我认为最值得借鉴的地方，是将现有 GNC 智能体从调用已有仿真程序，进一步拓展为能够根据配置方案自动创建、修改工程模型，并完成仿真验证。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 350" role="img" aria-label="GNC 配置代理与 MATLAB Agent 的分工对比">
<defs>
<marker id="g4-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
</defs>
<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card" x="190" y="20" width="675" height="38" rx="6"></rect><text class="gnc-t--sm gnc-t--navy" x="265" y="39">任务理解</text><text class="gnc-t--sm gnc-t--navy" x="440" y="39">任务编排</text><text class="gnc-t--sm gnc-t--navy" x="615" y="39">工具调用</text><text class="gnc-t--sm gnc-t--navy" x="790" y="39">证据反馈</text></g>
<text class="gnc-label gnc-t--xs gnc-t--end" x="180" y="39">共享机制</text>
<path class="gnc-edge gnc-edge--hair" d="M352 20 V58"></path>
<path class="gnc-edge gnc-edge--hair" d="M527 20 V58"></path>
<path class="gnc-edge gnc-edge--hair" d="M702 20 V58"></path>
<rect class="gnc-lane" x="8" y="74" width="874" height="72" rx="8"></rect>
<rect class="gnc-lane gnc-lane--teal" x="8" y="174" width="874" height="72" rx="8"></rect>
<text class="gnc-label gnc-t--sm gnc-t--coral gnc-t--start" x="18" y="100">GNC 单机配置</text>
<text class="gnc-label gnc-t--xs gnc-t--start" x="18" y="120">硬件配置决策</text>
<text class="gnc-label gnc-t--sm gnc-t--teal gnc-t--start" x="18" y="200">MATLAB Agent</text>
<text class="gnc-label gnc-t--xs gnc-t--start" x="18" y="220">软件建模验证</text>
<g class="gnc-node" style="animation-delay:.15s"><rect class="gnc-card gnc-card--surface" x="190" y="88" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="265" y="110">需求 rₕ</text></g>
<g class="gnc-node" style="animation-delay:.21s"><rect class="gnc-card gnc-card--surface" x="365" y="88" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="440" y="110">数据 / 知识 D, K</text></g>
<g class="gnc-node" style="animation-delay:.27s"><rect class="gnc-card gnc-card--surface" x="540" y="88" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="615" y="110">动力学模型 M</text></g>
<g class="gnc-node" style="animation-delay:.33s"><rect class="gnc-card gnc-card--amber" x="715" y="88" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="790" y="110">硬件配置 C</text></g>
<g class="gnc-node" style="animation-delay:.39s"><rect class="gnc-card gnc-card--surface" x="190" y="188" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="265" y="210">需求 rₛ</text></g>
<g class="gnc-node" style="animation-delay:.45s"><rect class="gnc-card gnc-card--surface" x="365" y="188" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="440" y="210">语义表示 q</text></g>
<g class="gnc-node" style="animation-delay:.51s"><rect class="gnc-card gnc-card--surface" x="540" y="188" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="615" y="210">Skill / Agent</text></g>
<g class="gnc-node" style="animation-delay:.57s"><rect class="gnc-card gnc-card--teal" x="715" y="188" width="150" height="44" rx="6"></rect><text class="gnc-t--sm" x="790" y="210">软件模型 A</text></g>
<path class="gnc-edge" d="M342 110 H363" marker-end="url(#g4-arrow)"></path>
<path class="gnc-edge" d="M517 110 H538" marker-end="url(#g4-arrow)"></path>
<path class="gnc-edge" d="M692 110 H713" marker-end="url(#g4-arrow)"></path>
<path class="gnc-edge" d="M342 210 H363" marker-end="url(#g4-arrow)"></path>
<path class="gnc-edge" d="M517 210 H538" marker-end="url(#g4-arrow)"></path>
<path class="gnc-edge" d="M692 210 H713" marker-end="url(#g4-arrow)"></path>
<g class="gnc-node" style="animation-delay:.65s"><rect class="gnc-card gnc-card--surface" x="250" y="278" width="400" height="44" rx="8"></rect><text class="gnc-t--sm" x="450" y="300">互补：配置决策 ＋ 工程模型构建</text></g>
<path class="gnc-edge gnc-flow" d="M865 110 H882 V300 H654" marker-end="url(#g4-arrow)"></path>
<path class="gnc-edge gnc-edge--hair gnc-flow" d="M865 210 H882 V300"></path>
</svg>
</div>
<figcaption>图 4　两条路线的分工。它们共享同一套任务理解、任务编排、工具调用与证据反馈机制，区别在于前者输出硬件配置决策，后者输出可检查、可仿真的工程模型。</figcaption>
</figure>

## 三、下一步思考：从 GNC 单机配置走向软硬件联合设计

### 1. 制造业智能体的核心不只是大模型，而是工程工具

结合目前大模型的发展情况，我认为要真正做好航天领域的专业智能体，不能依靠大模型完成所有工程工作。

尤其对于制造业和航天领域，专业工具的重要性甚至不亚于大模型本身。

例如，如果要做星座设计，就没有必要完全依靠大模型重新编写轨道计算和星座分析程序。STK 已经具备非常成熟的轨道分析、覆盖分析和任务仿真能力，应该优先考虑如何让 Agent 调用这些已有工具。

同样，MATLAB、Simulink、Ansys 等工程软件也已经具备相对成熟的计算和建模能力。真正需要解决的是如何让大模型理解这些软件的功能，并能够按照工程任务调用它们。

这就涉及工具接口问题。

目前常见的方式包括官方 API、SDK、命令行脚本以及 MCP 等。MCP 可以理解为一层面向大模型的标准化工具接口，将传统软件的功能封装成 Agent 能够理解和调用的工具。

对于已经提供相关接口的软件，可以直接进行集成；对于没有合适接口的软件，也可以根据其 API、SDK 或脚本能力自行开发适配层。

如果需要同时调用多个软件，例如先利用 STK 获取轨道和覆盖参数，再利用 MATLAB 进行控制系统仿真，最后利用其他工程软件进行结构或热分析，就需要建立统一的工具编排和数据交换机制。

因此，智能体的核心能力不只是调用单个软件，而是能够根据工程任务组织多个专业工具，形成完整的工作流程。

### 2. 从专家知识到可传承的工程资产

这里还有一个比工具调用更加重要的问题，就是专业知识和工程经验如何积累。

从航天技术传承的需求出发，我认为最终希望建设的并不是一个简单的航天知识问答系统，也不是一个只会调用大模型的通用智能体。

真正有价值的是将航天领域长期积累的专业知识、设计方法、工程模型和专家经验逐步沉淀下来，使其能够被智能体理解、调用和复用，最终形成面向特定功能航天器的设计智能体。

传统工程经验往往分散在专家个人经验、设计手册、历史型号报告、仿真程序和工程软件中。即使这些资料都已经存在，也不代表它们能够直接被 AI 使用。

例如，一份历史型号设计报告可能记录了最终采用的设备型号，但没有记录为什么选择这个型号、当时排除了哪些候选方案、使用了哪些约束条件，以及这个方案在什么情况下不再适用。

如果只是将报告导入 RAG，智能体或许能够回答相关问题，但未必真正掌握其中的设计方法。

因此，我认为航天技术传承至少需要沉淀以下几类资产：

**第一，专业数据资产。**

包括单机型号、设备参数、航天器历史型号数据、任务数据、轨道数据、系统接口和设计约束等。数据需要统一字段、单位、来源、版本和适用条件，使其能够被程序直接查询和计算。

**第二，专业知识资产。**

包括设计规范、技术手册、计算方法、设计准则、工程经验、专家决策依据以及历史问题案例。尤其要保留设计方案的选择理由、适用边界和失败经验，而不仅仅是最终设计结果。

**第三，工程模型资产。**

包括航天器总体模型、姿态动力学模型、轨道模型、敏感器模型、执行机构模型、控制系统模型以及不同专业的仿真模型。

这些模型需要具有明确的输入输出、参数定义、适用条件和验证记录，能够被 Agent 通过统一接口调用。

**第四，工程工具资产。**

包括已经成熟的仿真程序、专业软件、模型生成工具、优化算法和验证程序。需要逐步完成标准化封装，使智能体能够自动调用、配置、执行和读取结果。

从这个角度看，专业知识库只是技术传承的一部分。真正要传承的是一套可以被执行的工程设计方法。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 360" role="img" aria-label="四类工程资产与验证基准">
<defs>
<marker id="g5-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-blue)"></path></marker>
<marker id="g5-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-amber)"></path></marker>
</defs>
<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card gnc-card--core" x="250" y="25" width="360" height="55" rx="8"></rect><rect class="gnc-halo" x="250" y="25" width="360" height="55" rx="8"></rect><text class="gnc-t--on-solid gnc-t--strong" x="430" y="45">特定功能设计智能体</text><text class="gnc-t--on-solid gnc-t--sm" x="430" y="65">A_design</text></g>
<g class="gnc-node" style="animation-delay:.2s"><rect class="gnc-card" x="25" y="175" width="180" height="75" rx="7"></rect><text class="gnc-t--strong" x="115" y="200">D</text><text class="gnc-t--sm" x="115" y="226">专业数据</text></g>
<g class="gnc-node" style="animation-delay:.27s"><rect class="gnc-card" x="235" y="175" width="180" height="75" rx="7"></rect><text class="gnc-t--strong" x="325" y="200">K</text><text class="gnc-t--sm" x="325" y="226">专业知识</text></g>
<g class="gnc-node" style="animation-delay:.34s"><rect class="gnc-card" x="445" y="175" width="180" height="75" rx="7"></rect><text class="gnc-t--strong" x="535" y="200">M</text><text class="gnc-t--sm" x="535" y="226">工程模型</text></g>
<g class="gnc-node" style="animation-delay:.41s"><rect class="gnc-card" x="655" y="175" width="180" height="75" rx="7"></rect><text class="gnc-t--strong" x="745" y="200">T</text><text class="gnc-t--sm" x="745" y="226">工程工具</text></g>
<path class="gnc-edge gnc-edge--teal" d="M115 173 V140"></path>
<path class="gnc-edge gnc-edge--teal" d="M325 173 V140"></path>
<path class="gnc-edge gnc-edge--teal" d="M535 173 V140"></path>
<path class="gnc-edge gnc-edge--teal" d="M745 173 V140"></path>
<path class="gnc-edge gnc-edge--teal" d="M115 140 H745"></path>
<path class="gnc-edge gnc-edge--teal" d="M430 140 V82" marker-end="url(#g5-arrow)"></path>
<g class="gnc-node" style="animation-delay:.5s"><rect class="gnc-card gnc-card--amber" x="25" y="288" width="810" height="40" rx="8"></rect><text class="gnc-t--sm" x="430" y="309">验证基准与版本管理　V</text></g>
<path class="gnc-edge gnc-edge--amber gnc-edge--hair" d="M115 286 V252" marker-end="url(#g5-arrow-amber)"></path>
<path class="gnc-edge gnc-edge--amber gnc-edge--hair" d="M325 286 V252" marker-end="url(#g5-arrow-amber)"></path>
<path class="gnc-edge gnc-edge--amber gnc-edge--hair" d="M535 286 V252" marker-end="url(#g5-arrow-amber)"></path>
<path class="gnc-edge gnc-edge--amber gnc-edge--hair" d="M745 286 V252" marker-end="url(#g5-arrow-amber)"></path>
</svg>
</div>
<figcaption>图 5　需要沉淀的四类工程资产，以及支撑它们的验证基准与版本管理。资产不是并列的文件夹，而是要能被同一套接口取用、被同一套基准校验。</figcaption>
</figure>

### 3. 近期目标：GNC 软硬件联合设计智能体

结合目前已经完成的单机配置智能体，以及 MATLAB Agent 论文所展示的工程模型自动构建能力，我认为近期最合适的拓展方向是 GNC 软硬件联合设计。

现有系统已经具备从任务需求到硬件配置、再到姿态动力学仿真验证的能力。下一步可以在此基础上增加软件模型自动构建环节。

具体而言，可以形成以下流程：

首先，用户输入航天器任务需求和总体性能指标，智能体将其转化为结构化需求和工程约束。

其次，硬件配置智能体根据任务要求，调用单机数据库和工程知识库，完成敏感器、执行机构等设备选型，并形成硬件配置方案。

然后，软件设计智能体根据硬件配置和控制任务要求，生成控制系统的软件架构、接口关系和控制逻辑模型，并调用 MATLAB/Simulink 等工程工具创建和配置模型。

接下来，将硬件参数、航天器动力学模型和控制软件模型进行关联，构建统一的仿真环境，完成软硬件协同仿真。

最后，根据仿真结果检查任务指标、接口一致性、控制性能和资源约束。如果存在问题，智能体能够定位相关设计环节，提出修改建议，并重新执行验证。

这样，最终输出的不再只是一份单机配置清单，而是一套相对完整的工程设计结果，包括硬件配置、软件模型、仿真结果、指标评价和验证记录。

### 4. 具体需要优先建设什么

要实现上述目标，我认为当前不应该首先追求更复杂的 Agent 框架，而应该优先建设专业数据和工具底座。

在数据方面，需要逐步规范院所已有的型号数据、历史设计资料和工程知识，建立统一的数据结构、知识分类体系和版本管理机制。

在模型方面，需要整理已有的动力学模型、单机模型和控制系统模型，形成可复用的参数化模型库，并明确每个模型的适用范围和验证条件。

在工具方面，需要对 MATLAB/Simulink 等专业软件进行接口封装，建立统一的输入输出规范、仿真执行接口和结果解析工具。对于复杂任务，还需要实现多个软件之间的数据传递和联合调用。

在智能体方面，可以在现有 Planner、Executor、Critic 等协同设计架构的基础上，逐步增加工程模型构建、自动检查和仿真修复能力。对于成熟度较高、操作规则明确的环节，采用固定 Workflow 保证稳定性；对于需要动态分析和任务规划的环节，再逐步增加 Agent 自主决策能力。

最终通过历史型号复现、标准测试任务、专家评审和仿真验证，持续评价智能体输出的工程正确性。

## 四、具体技术实现：从 Agent 框架到 Skills 驱动的工程智能体

### 1. 技术选型与 Agent 开发范式

在具体技术实现方面，我认为可以优先采用 Python。Python 在人工智能应用、科学计算和工程仿真领域拥有成熟的生态，大量基础功能可以直接复用，不需要从零开发。

以目前的 GNC 单机配置智能体为例，项目主要基于 **PocketFlow** 框架实现。PocketFlow 与 LangGraph 等框架的思路类似，都是通过节点、状态和执行关系组织智能体工作流。我们将需求解析、知识检索、型号筛选、配置决策、动力学仿真和反馈评价划分为不同节点，从而保证执行过程相对可控。

不过，随着大模型推理、编程和工具调用能力的提升，Agent 的开发范式也在发生变化。

早期通常需要使用 LangChain、LangGraph、PocketFlow 等框架，显式规定任务节点和执行顺序。近年来，Codex、Claude Code、Pi 等 Agent Harness 的发展，则提供了另一种思路：依靠模型自身的规划和工具调用能力，让 Agent 根据任务目标动态决定如何执行，而不必由开发者预先定义所有步骤。

两种范式并不是简单的替代关系。**Agent Harness 更适合快速探索开放式任务，显式 Workflow 更适合流程稳定、约束严格、需要可追溯性的工程任务。**

### 2. 专业工具复用与 AI 辅助开发

我认为，航天和制造业领域智能体的核心并不是让大模型完成所有计算，而是充分利用已有的专业知识、成熟软件和工程模型。

例如，在 GNC 项目中，我们直接使用了香港大学开源的 LightRAG 框架，不需要重新开发完整的知识提取、图谱构建和语义检索系统，而是在其基础上接入航天专业资料。

对于工程计算也是类似的思路。MATLAB/Simulink 已经具备成熟的控制系统建模与仿真能力，STK 已经具备轨道传播、星座覆盖和任务分析能力。与其让大模型重新编写这些复杂的计算程序，不如通过 Python API、SDK 或 MCP 等接口，让智能体直接调用成熟工具。

同时，AI 编程工具已经能够辅助完成大量常规开发工作，包括数据库接口、工具封装、前端页面、数据处理和基础测试。对于科研原型和内部 Demo，可以大幅降低软件开发成本；实际工程交付仍然需要严格测试。

因此，研发重点不应过度集中在开发语言、基础框架或重复的软件实现上，而应该放在**专业任务理解、工程算法、设计约束、模型可信度和验证方法**上。

例如，开发星座设计智能体，真正重要的是理解轨道构型、覆盖率、重访时间和优化目标之间的关系；开发 GNC 软硬件设计智能体，核心则是理解硬件选型、控制算法、动力学模型和性能指标之间的耦合关系。

这些专业知识和工程经验才是决定智能体能力上限的重要因素。

### 3. 建议实施路线：Skills 优先，按需引入 Workflow

如果下一步希望搭建 GNC 软硬件联合设计或星座设计智能体，我倾向于先采用轻量级方案：**直接基于 Codex、Claude Code 等现有 Agent Harness，结合专业 Skills 和工程工具，构建一个最小可运行 Demo。**

Skills 可以理解为一组可复用的专业任务说明、设计规则和工具使用方法，通常由提示词、参考文档、脚本和模板组成。

例如，可以为 MATLAB 编写姿态控制建模 Skill，规定如何创建动力学模型、配置控制器、设置仿真参数并提取性能指标；也可以为 STK 编写星座设计 Skill，规定如何建立轨道场景、配置卫星参数、开展覆盖分析并输出计算结果。

只要 Agent 能够按照这些 Skills 正确调用 MATLAB 或 STK，并根据返回结果调整设计方案，就已经初步实现了专业设计任务的自动化闭环。

当然，Skills 本质上还是对大模型的操作指导，并不能保证复杂工程任务的执行稳定性。

当任务涉及多个专业软件、严格的数据依赖、复杂状态管理或反复仿真时，仅靠模型自主规划可能会出现漏步骤、参数不一致、工具调用失败等问题。

这时可以进一步引入 PocketFlow、LangGraph 等框架，将关键执行顺序、状态管理、异常重试和工程验证环节固定下来，同时保留大模型在方案生成和异常处理中的自主性。

因此，我建议采用以下渐进式路线：

> 专业任务定义 → Skills 编写 → 工具接入 → Demo 验证 → 必要时引入 Workflow → 工程化完善。

这种方式能够避免一开始就投入大量精力开发复杂的多 Agent 系统，而是先验证现有大模型与专业工具能否完成目标任务，再根据实际问题逐步增强系统架构。

从技术传承的角度看，Skills 还具有另一个价值：可以将领域专家使用 MATLAB、STK 等工程软件的操作方法、设计规范和经验沉淀为可复用的能力模块。

**最终希望积累的不只是某一个 Agent 程序，而是一套可以持续复用、组合和扩展的航天专业 Skills、工程模型与工具体系，为后续特定功能航天器设计智能体提供技术基础。**

## 五、外部校验：这一路线是否已被别人走通

在给出总结之前，还有一个更基础的问题值得回答：把大模型用于航天任务，目前已经有人走到了哪一步？

为此我检索了这一方向近年公开的代表性工作，包括期刊综述、arXiv 预印本和机构技术报告，合计三十余篇，按「自动化了工程链路上的哪一环」切成六个领域，并单独梳理了评测基准的现状。

完整梳理见另篇：[《大模型在航天任务中的已有工作：一份文献版图》](../llm-aerospace-survey/)。

那篇综述对本文的意义只有一条：**六个领域自发收敛到了同一种技术范式**——语言模型负责语义翻译与任务编排，确定性求解器或规划器负责计算，权威分层负责安全判定。本文采用的路线不是孤立选择；而尚未被覆盖的软硬件联合设计、单机级选型与型号工程验证证据链，恰好是下一阶段真正需要补上的缺口。

## 六、总结

通过 GNC 单机配置智能体的实践，我们已经初步验证了大模型能够参与航天器专业设备选型、系统配置和工程仿真。MATLAB Agent 论文进一步展示了大模型通过专业工具接口自动创建、修改和验证工程模型的可能性，为从配置决策走向工程模型自动构建提供了参考。

而结合航天技术传承的需求，我认为真正值得长期积累的并不是某一个大模型或某一套 Agent 框架，而是航天领域的专业知识、历史设计数据、工程模型、仿真工具和经过验证的设计方法。因此，近期可以从 GNC 软硬件联合设计入手，将已有单机配置能力与工程模型自动构建能力结合起来，逐步打通需求、知识、数据、模型、工具和验证环节。

从这个意义上说，后续工作的重点不是继续扩大智能体的自主范围，而是把已经被分别验证过的能力接到一条尚未接通的工程链条上，并用可核查的验证证据证明这条链条是可靠的。

最终希望形成的，是能够继承和复用航天领域专业技术经验，面向特定任务和功能自主开展设计、建模与验证的航天器设计智能体。
