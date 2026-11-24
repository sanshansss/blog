import type { CollectionEntry } from 'astro:content'
import { OGImageRoute } from 'astro-og-canvas'
import { getCollection } from 'astro:content'
import { getPostDescription } from '@/utils/description'

// eslint-disable-next-line antfu/no-top-level-await
const posts = await getCollection('posts')

// Create slug-to-metadata lookup object for blog posts
const pages = Object.fromEntries(
  posts.map((post: CollectionEntry<'posts'>) => [
    post.id,
    {
      title: post.data.title,
      description: getPostDescription(post, 'og'),
    },
  ]),
)

// Configure Open Graph image generation route
// eslint-disable-next-line antfu/no-top-level-await
export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'image',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: './public/icons/og-logo.png', // Required local path and PNG format
      size: [250],
    },
    border: {
      color: [250, 249, 245],
      width: 20,
    },
    font: {
      title: {
        families: ['Noto Sans SC'],
        weight: 'Bold',
        color: [20, 20, 19],
        lineHeight: 1.5,
      },
      description: {
        families: ['Noto Sans SC'],
        color: [76, 75, 69],
        lineHeight: 1.5,
      },
    },
    fonts: [
      './assets/fonts/NotoSansSC-Bold.otf',
      './assets/fonts/NotoSansSC-Regular.otf',
    ],
    bgGradient: [[250, 249, 245]],
  }),
})
