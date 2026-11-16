---
title: 用一个快捷键，把显示器转成竖屏来远程写代码
published: 2026-11-16
description: 手机上远程看电脑写代码，横屏塞进去字小到看不清。写了个 37KB 的托盘程序，一键把显示器转 90 度并降分辨率。
tags:
  - 工具实践
  - Windows
  - CSharp
  - 远程开发
lang: zh
abbrlink: phone-coding-mode
toc: true
---

用电脑写代码、手机上看——这事本身没毛病，问题出在屏幕比例上。

电脑是 16:9 横的，手机是 9:19.5 竖的。远程软件把横屏画面塞进竖屏，上下两条大黑边，剩下的宽度只显示得下原来的一半，字小到要把手机举到眼前。

我一开始的想法很土：调系统缩放。试了一下就放弃了——缩放不重新登录不完全生效，而且它会**把所有程序的窗口一起放大**，改完还得改回来。

后来想到：既然手机是竖的，那让电脑也竖着不就行了。显示器转 90 度，分辨率降到 720×1280，画面宽度从 1920 变成 720，等于放大 1.5 倍。

就这样做了个工具。

## 效果

| 用之前 | 用之后 |
|:---:|:---:|
| <img src="https://raw.githubusercontent.com/sanshansss/phone-coding-mode/main/docs/app-before.png" width="320"> | <img src="https://raw.githubusercontent.com/sanshansss/phone-coding-mode/main/docs/app-after.png" width="320"> |
| 横屏塞进手机，上下黑边，字小到看不清 | 竖屏填满，放大 1.5 倍，看得清 |

按 `Ctrl + Alt + P` 切换，也可以双击托盘图标。再按一次精确还原。

## 关键不在转屏，在「转回原样」

调 `ChangeDisplaySettings` 转 90 度是几行的事，但真正麻烦的是还原。

系统里没有「恢复上一个显示配置」的接口。一旦转过去，程序崩了、断电了、用户忘了切换过——下次开机就是一个竖着的桌面，鼠标方向都是歪的，得靠控制面板慢慢找回来。

所以这个工具做的第一件事是**先快照**：进竖屏之前，把当前所有显示器的适配器、目标 ID、旋转角度、宽高、位置全部记下来，写进 `%APPDATA%\PhoneCoding\snapshot.ini`。退出时按这份记录还原，而不是「转回 0 度」这种想当然的写法——多屏场景下后者必然错位。

底层没走 `ChangeDisplaySettingsEx`，用的是 `SetDisplayConfig`：

```
SDL_APPLY | SDC_USE_SUPPLIED_DISPLAY_CONFIG | SDC_ALLOW_CHANGES
```

它能一次提交整组显示路径，比逐个屏改稳妥。

## 分辨率不是随便填的

最开始的版本直接写 `720×1280`，结果在我的一块屏上直接黑屏——因为显示器根本不支持那个模式。

改成**枚举真实支持的档位**：用 `EnumDisplaySettingsW` 把所有模式拉出来，筛出宽小于高的那些，按视觉放大倍数排序。1.5 倍只是「我想要 720 宽」，实际用哪个档位由屏幕自己说了算。

```
竖屏宽度 = 源高度(sh)
放大倍数 = 原生竖屏宽度 / 当前竖屏宽度
```

所以菜单里列出来的每个档位，都是这块屏**确实支持**的。换屏幕会自动重排。

## 为什么是 C# 单文件

这类小工具最大的摩擦不是写代码，是**让朋友也能用上**。

如果要做成 .NET 项目，对方得装 SDK；要打包成安装包，得配 Inno Setup。所以直接用了 Win10/11 自带的 `csc.exe`——系统自带编译器的意思是：下载 zip、双击 `install.bat`、完事。不需要编译环境，不需要管理员权限。

代码拆成 5 个文件、一共约 1500 行：

- `Core.cs` — 配置读写、日志
- `Display.cs` — P/Invoke 封装，枚举模式、提交配置、任务栏
- `PhoneMode.cs` — 核心逻辑，与 UI 无关
- `UI.cs` — 托盘菜单、全局热键、提示
- `Program.cs` — 入口和组装

把显示逻辑和 UI 彻底分开，是为了能单独跑 `PhoneCoding.exe on / off / status` ——改完配置不用点鼠标验证，命令行就能确认状态。

产物 37 KB，无任何依赖。

## 两个我自己踩过的坑

**先切竖屏，再连远程。** 反过来的话，远程软件还缓存着旧的宽高比，看到的是被拉伸的画面。

**改分辨率不等于改缩放。** 系统缩放要重新登录，而且影响所有程序；改分辨率是即时的，串流出去的画面宽度真的只有 720，手机上就是实实在在的大字。

## 拿

[GitHub 仓库](https://github.com/sanshansss/phone-coding-mode) · [最新 Release](https://github.com/sanshansss/phone-coding-mode/releases/latest)

首次运行 Windows 会弹 SmartScreen 警告——exe 没有代码签名，个人项目买证书太贵。点「更多信息 → 仍要运行」。

用了两天，现在写代码是横屏，改完一行按 `Ctrl+Alt+P`，手机上就能看清整段逻辑。这个流程顺了以后，反而不太愿意回工位坐着了。
