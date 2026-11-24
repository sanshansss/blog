---
title: 用一个快捷键把显示器转成竖屏：面向手机远程开发的 Windows 小工具
published: 2026-11-16
description: 手机远程查看电脑写代码时，横屏画面缩放后字体过小。记录一个 37 KB 的 Windows 托盘工具，用快捷键将显示器旋转 90° 并切换至低分辨率竖屏，退出时按快照无损还原。
tags:
  - 工具实践
  - Windows
  - CSharp
  - 远程开发
lang: zh
abbrlink: phone-coding-mode
toc: true
---

## 一、问题背景与解决思路

平时偶尔需要在手机上通过远程桌面查看电脑里的代码或终端输出。这种使用方式本身没有太大障碍，真正影响体验的是两端屏幕的比例差异。

桌面显示器通常是 16:9 的横屏，而手机是接近 9:19.5 的竖屏。远程软件把横屏画面直接压缩进竖屏后，上下会留出很大面积的黑边，实际有效画面被挤在中间很窄的一条区域里，代码字体小到很难看清。

最初我尝试过直接调高 Windows 的系统缩放比例，但很快就放弃了。一方面，系统缩放往往需要注销或重启应用才能完全生效；另一方面，它会同时放大所有程序的窗口和布局，切回桌面使用时还要手动恢复，操作成本太高。

后来换了一个更直接的思路：既然手机端是竖屏，不如在远程连接前把电脑显示器临时转成竖屏。将显示器旋转 90°，同时把分辨率降到 720×1280 这样的竖屏档位，逻辑画面宽度从 1920 像素降到 720 像素，在手机上等效于把内容放大约 1.5 倍，而且整个过程即时生效，不需要修改系统缩放。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 310" role="img" aria-label="横屏串流与竖屏旋转降分辨率的显示效果对比">
<defs>
<marker id="pc1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="pc1-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-teal)"></path></marker>
</defs>

<!-- Left: Before -->
<g class="gnc-node" style="animation-delay:.05s">
  <rect class="gnc-card gnc-card--surface" x="75" y="28" width="130" height="234" rx="16"></rect>
  <rect x="85" y="44" width="110" height="202" rx="6" fill="var(--gnc-ink)" fill-opacity="0.12"></rect>
  <rect class="gnc-card gnc-card--coral" x="87" y="114" width="106" height="60" rx="3"></rect>
  <text class="gnc-t--xs gnc-t--coral" x="140" y="138">16:9 横屏</text>
  <text class="gnc-t--xs" x="140" y="155">字体极小</text>
  <text class="gnc-t--xs" x="140" y="80">黑边</text>
  <text class="gnc-t--xs" x="140" y="210">黑边</text>
  <text class="gnc-t--sm gnc-t--strong" x="140" y="284">默认直接远程</text>
</g>

<!-- Arrow 1 -->
<path class="gnc-edge gnc-flow" d="M225 145 H315" marker-end="url(#pc1-arrow)"></path>
<text class="gnc-label gnc-t--xs gnc-t--mono" x="270" y="130">Ctrl+Alt+P</text>

<!-- Middle: Rotating monitor animation -->
<g class="gnc-node" style="animation-delay:.18s">
  <rect class="gnc-card gnc-card--ghost" x="330" y="36" width="230" height="218" rx="10"></rect>
  <g class="gnc-rot90">
    <rect class="gnc-card gnc-card--core" x="373" y="103" width="144" height="84" rx="6"></rect>
    <rect x="381" y="111" width="128" height="68" rx="3" fill="var(--gnc-surface)" fill-opacity="0.16"></rect>
    <text class="gnc-t--on-solid gnc-t--xs gnc-t--strong" x="445" y="139">1920×1080</text>
    <text class="gnc-t--on-solid gnc-t--xs" x="445" y="156">旋转 90° + 降分辨率</text>
  </g>
  <text class="gnc-t--sm gnc-t--strong" x="445" y="284">显示器旋转与切档（循环示意）</text>
</g>

<!-- Arrow 2 -->
<path class="gnc-edge gnc-edge--teal gnc-flow" d="M578 145 H668" marker-end="url(#pc1-arrow-teal)"></path>
<text class="gnc-label gnc-t--xs gnc-t--teal" x="623" y="130">720×1280</text>

<!-- Right: After -->
<g class="gnc-node" style="animation-delay:.3s">
  <rect class="gnc-card gnc-card--surface" x="688" y="28" width="130" height="234" rx="16"></rect>
  <rect class="gnc-card gnc-card--teal" x="698" y="44" width="110" height="202" rx="6"></rect>
  <rect x="708" y="64" width="66" height="8" rx="3" fill="var(--gnc-teal)" fill-opacity="0.5"></rect>
  <rect x="708" y="82" width="88" height="8" rx="3" fill="var(--gnc-teal)" fill-opacity="0.35"></rect>
  <rect x="708" y="100" width="76" height="8" rx="3" fill="var(--gnc-teal)" fill-opacity="0.35"></rect>
  <rect x="708" y="124" width="84" height="8" rx="3" fill="var(--gnc-teal)" fill-opacity="0.5"></rect>
  <rect x="708" y="142" width="62" height="8" rx="3" fill="var(--gnc-teal)" fill-opacity="0.35"></rect>
  <text class="gnc-t--sm gnc-t--teal gnc-t--strong" x="753" y="186">竖屏填满</text>
  <text class="gnc-t--xs" x="753" y="206">画面等效放大 1.5×</text>
  <text class="gnc-t--sm gnc-t--strong" x="753" y="284">开启竖屏模式后</text>
</g>
</svg>
</div>
<figcaption>图 1　手机远程串流的画面比例变化。通过将主机显示器旋转 90° 并下调分辨率，消除上下黑边，使代码区域铺满手机竖屏。</figcaption>
</figure>

下面是在手机上的实际对比效果：

| 切换前 | 切换后 |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/sanshansss/phone-coding-mode/main/docs/app-before.png" width="320"> | <img src="https://raw.githubusercontent.com/sanshansss/phone-coding-mode/main/docs/app-after.png" width="320"> |
| 横屏塞进竖屏，上下黑边，字体偏小 | 竖屏铺满，等效放大约 1.5 倍，代码清晰 |

日常使用时按 `Ctrl + Alt + P` 即可切换，也可以双击系统托盘图标；再触发一次就会恢复原状。

## 二、核心实现：安全快照与分辨率枚举

### 1. 先做配置快照，再执行旋转

在 Windows 下调用显示接口把屏幕转 90° 并不复杂，真正容易出问题的是恢复阶段。

系统本身没有提供「一键回到上一个显示配置」的接口。如果切换到竖屏后遇到程序异常退出、断电，或者隔天忘记切回，下次开机面对的就是一个竖着的桌面，鼠标移动方向也是旋转过的，手动在系统设置里找回原来的多屏排列非常麻烦。

因此，工具在执行任何显示修改之前，会先采集当前所有显示器的适配器信息、目标 ID、旋转角度、宽高和坐标位置，写入 `%APPDATA%\PhoneCoding\snapshot.ini`。退出竖屏模式时，程序严格按照这份快照文件还原，而不是简单地「把旋转角度设回 0°」——在多显示器环境下，只改回 0° 往往会导致副屏位置错乱。

底层提交配置时没有使用 `ChangeDisplaySettingsEx`，而是调用了 `SetDisplayConfig`：

```text
SDC_APPLY | SDC_USE_SUPPLIED_DISPLAY_CONFIG | SDC_ALLOW_CHANGES
```

这个接口支持一次性原子提交整组显示路径，比逐块显示器分别修改更稳妥。

### 2. 枚举显示器真实支持的竖屏档位

第一版实现中我直接硬编码了 `720×1280`，结果在另一台显示器上切换后直接黑屏，原因是那块屏幕的驱动并不支持该分辨率模式。

后面改为动态枚举：通过 `EnumDisplaySettingsW` 拉取当前显示器支持的所有显示模式，筛选出宽度小于高度的竖屏档位，再按等效视觉放大倍数排序。放大倍数的计算方式如下：

```text
竖屏宽度 = 源高度 (sh)
放大倍数 = 原生竖屏宽度 / 当前竖屏宽度
```

这样托盘菜单里列出的每一个档位，都是当前显示器确实支持的模式；换接其他显示器时，可选列表也会随之更新。

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 245" role="img" aria-label="PhoneCoding 切换与快照还原的执行流程">
<defs>
<marker id="pc2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-ink)"></path></marker>
<marker id="pc2-arrow-coral" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--gnc-coral)"></path></marker>
</defs>

<g class="gnc-node" style="animation-delay:.05s"><rect class="gnc-card gnc-seq" x="18" y="42" width="136" height="66" rx="7" style="animation-delay:0s"></rect><text class="gnc-t--strong" x="86" y="68">热键 / 命令行</text><text class="gnc-t--xs gnc-t--mono" x="86" y="88">Ctrl+Alt+P</text></g>
<g class="gnc-node" style="animation-delay:.13s"><rect class="gnc-card gnc-card--amber gnc-seq" x="182" y="42" width="150" height="66" rx="7" style="animation-delay:1.1s"></rect><text class="gnc-t--strong" x="257" y="68">写入状态快照</text><text class="gnc-t--xs gnc-t--mono" x="257" y="88">snapshot.ini</text></g>
<g class="gnc-node" style="animation-delay:.21s"><rect class="gnc-card gnc-seq" x="360" y="42" width="160" height="66" rx="7" style="animation-delay:2.2s"></rect><text class="gnc-t--strong" x="440" y="68">枚举支持档位</text><text class="gnc-t--xs gnc-t--mono" x="440" y="88">EnumDisplaySettingsW</text></g>
<g class="gnc-node" style="animation-delay:.29s"><rect class="gnc-card gnc-card--core gnc-seq" x="548" y="42" width="156" height="66" rx="7" style="animation-delay:3.3s"></rect><text class="gnc-t--on-solid gnc-t--strong" x="626" y="68">原子提交配置</text><text class="gnc-t--on-solid gnc-t--xs gnc-t--mono" x="626" y="88">SetDisplayConfig</text></g>
<g class="gnc-node" style="animation-delay:.37s"><rect class="gnc-card gnc-card--teal gnc-seq" x="732" y="42" width="150" height="66" rx="7" style="animation-delay:4.4s"></rect><text class="gnc-t--strong" x="807" y="68">竖屏远程状态</text><text class="gnc-t--xs" x="807" y="88">720×1280 竖屏</text></g>

<path class="gnc-edge" d="M156 75 H178" marker-end="url(#pc2-arrow)"></path>
<path class="gnc-edge" d="M334 75 H356" marker-end="url(#pc2-arrow)"></path>
<path class="gnc-edge" d="M522 75 H544" marker-end="url(#pc2-arrow)"></path>
<path class="gnc-edge" d="M706 75 H728" marker-end="url(#pc2-arrow)"></path>

<g class="gnc-node" style="animation-delay:.48s"><rect class="gnc-card gnc-card--surface" x="300" y="158" width="300" height="52" rx="8"></rect><text class="gnc-t--strong" x="450" y="178">按快照精确还原多屏拓扑</text><text class="gnc-t--xs" x="450" y="196">再次触发 / 程序异常重启均可从 snapshot.ini 恢复</text></g>

<path class="gnc-edge gnc-edge--coral gnc-flow" d="M807 110 V184 H604" marker-end="url(#pc2-arrow-coral)"></path>
<text class="gnc-label gnc-t--xs gnc-t--coral" x="706" y="172">退出竖屏 / 恢复</text>
<path class="gnc-edge gnc-edge--coral gnc-flow gnc-flow--slow" d="M296 184 H257 V112" marker-end="url(#pc2-arrow-coral)"></path>
<text class="gnc-label gnc-t--xs gnc-t--coral gnc-t--end" x="247" y="152">读取原始配置</text>
</svg>
</div>
<figcaption>图 2　竖屏切换与还原的状态流转。由于快照文件落盘在修改显示配置之前，即便中途发生异常退出，也能依据原始拓扑恢复。</figcaption>
</figure>

## 三、工程结构：使用系统自带 csc.exe 编译

这类个人效率工具在分发时最容易遇到环境门槛。如果做成标准的 .NET 工程，其他人本地需要安装对应版本的 SDK；如果打包成安装程序，又得维护额外的打包脚本。

因此我直接基于 Windows 10/11 系统自带的 `csc.exe` 编译器来构建。使用者下载压缩包后，双击 `install.bat` 即可在本机完成编译，不需要额外安装运行环境，也不需要管理员权限。最终生成的可执行文件只有 37 KB，没有外部依赖。

整个程序拆分为 5 个源文件，合计约 1500 行代码：

- `Core.cs`：配置读写与日志记录；
- `Display.cs`：P/Invoke 封装，负责枚举显示模式、提交显示配置与处理任务栏；
- `PhoneMode.cs`：核心状态切换逻辑，与界面完全解耦；
- `UI.cs`：系统托盘菜单、全局热键注册与气泡提示；
- `Program.cs`：程序入口与命令行参数解析。

把显示控制逻辑和托盘 UI 彻底分开，主要是为了支持命令行调用，例如直接运行 `PhoneCoding.exe on`、`off` 或 `status`。调试配置时不需要反复用鼠标点击菜单，在终端里就能直接验证状态。

## 四、使用中需要注意的两点

第一，建议**先切换竖屏，再发起远程连接**。如果先连上远程桌面再旋转屏幕，部分远程客户端会继续沿用旧的画面宽高比缓存，导致手机端显示被拉伸。

第二，修改物理/逻辑分辨率和调整系统 DPI 缩放是两回事。修改分辨率是即时的，远程软件采集到的画面宽度本身就是 720 像素，传到手机后不需要额外缩放就能看清文字，切回横屏后也不会残留窗口布局错乱的问题。

## 五、获取与使用

源码与预编译版本放在 GitHub：

- [GitHub 仓库](https://github.com/sanshansss/phone-coding-mode)
- [最新 Release](https://github.com/sanshansss/phone-coding-mode/releases/latest)

由于个人项目的可执行文件没有购买代码签名证书，首次运行时 Windows 可能会弹出 SmartScreen 提示，选择「更多信息 → 仍要运行」即可。如果不想直接运行预编译的 exe，也可以下载源码后运行 `install.bat` 在本机用 `csc.exe` 自行编译。
