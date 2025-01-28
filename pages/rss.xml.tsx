import fs from 'fs'
import path from 'path'
import { GetStaticProps } from 'next'

import { getAllPosts, getAllSettings, GhostPostsOrPages } from '@lib/ghost'
import { generateRSSFeed } from '@utils/rss'

/**
 * This page doesn’t actually render anything.
 * We just use `getStaticProps` to run once at build time and
 * generate a static file (public/rss.xml).
 */
export default function RSS() {
  return null
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [settings, posts]: [any, GhostPostsOrPages] = await Promise.all([
      getAllSettings(),
      getAllPosts(),
    ])

    // Generate the RSS feed XML
    const rssData = generateRSSFeed({ posts, settings })

    // Write it to the public folder so it's available as /rss.xml
    fs.writeFileSync(path.join(process.cwd(), 'public', 'rss.xml'), rssData)
  } catch (error) {
    console.error('RSS generation failed:', error)
  }

  // You must return something from getStaticProps
  return {
    props: {},
  }
}
