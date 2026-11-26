import type { Preset } from 'unocss'
import {
  defineConfig,
  presetAttributify,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetTheme from 'unocss-preset-theme'
import { themeConfig } from './src/config.ts'

const { light, dark } = themeConfig.color

// Reading (serif): Newsreader + 思源宋体, headings 600 / body 400
// Newsreader is the closest open-licensed stand-in for Anthropic's Copernicus-style display serif
const serifStack = [
  '"Newsreader Variable"',
  '"Noto Serif SC Variable"',
  '"Songti SC"',
  'STSong',
  'SimSun',
  'ui-serif',
  'Georgia',
  'Cambria',
  '"Times New Roman"',
  'Times',
  'serif',
]

// Interface (sans): Plus Jakarta Sans + HarmonyOS Sans / 思源黑体（系统字体，不下载）
const sansStack = [
  '"Plus Jakarta Sans Variable"',
  '"HarmonyOS Sans SC"',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  '"Noto Sans SC"',
  'ui-sans-serif',
  'system-ui',
  'sans-serif',
]

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTheme({
      theme: {
        dark: {
          colors: {
            ...dark,
            note: 'oklch(70.7% 0.165 254.624 / 0.8)', // blue-400
            tip: 'oklch(76.5% 0.177 163.223 / 0.8)', // emerald-400
            important: 'oklch(71.4% 0.203 305.504 / 0.8)', // purple-400
            warning: 'oklch(82.8% 0.189 84.429 / 0.8)', // amber-400
            caution: 'oklch(70.4% 0.191 22.216 / 0.8)', // red-400
          },
        },
      },
    }) as Preset<object>,
  ],
  theme: {
    colors: {
      ...light,
      note: 'oklch(48.8% 0.243 264.376 / 0.8)', // blue-700
      tip: 'oklch(50.8% 0.118 165.612 / 0.8)', // emerald-700
      important: 'oklch(49.6% 0.265 301.924 / 0.8)', // purple-700
      warning: 'oklch(55.5% 0.163 48.998 / 0.8)', // amber-700
      caution: 'oklch(50.5% 0.213 27.518 / 0.8)', // red-700
    },
    fontFamily: {
      title: serifStack,
      navbar: sansStack,
      time: sansStack,
      sans: sansStack,
      serif: serifStack,
      // 插图（内联 SVG）手写体：Comic Sans 无中文字形，回退到正文同款衬线栈
      figure: [
        '"Comic Sans MS"',
        'Comic Sans',
        '"Chalkboard SE"',
        '"Comic Neue"',
        ...serifStack,
      ],
    },
  },
  rules: [
    ['scrollbar-hidden', {
      'scrollbar-width': 'none',
      '-ms-overflow-style': 'none',
    }],
  ],
  shortcuts: {
    'uno-desktop-column': 'fixed right-[var(--site-column-right,max(5rem,calc(50vw-35rem)))] w-[var(--site-column-width,14rem)]',
    'uno-decorative-line': 'mb-4.5 h-0.25 w-10 bg-secondary/25 lg:(mb-6 w-11)',
    'uno-round-border': 'border border-secondary/5 rounded border-solid',
  },
  variants: [
    (matcher) => {
      if (!matcher.startsWith('cjk:')) {
        return matcher
      }
      return {
        matcher: matcher.slice(4),
        selector: s => `${s}:is(:lang(zh), :lang(ja), :lang(ko))`,
      }
    },
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
