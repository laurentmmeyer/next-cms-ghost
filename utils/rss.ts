import cheerio from 'cheerio'
import RSS from 'rss'

import { GhostPostOrPage, GhostPostsOrPages, GhostSettings } from "@lib/ghost"
import { siteTitleMeta, siteDescriptionMeta, siteIcon } from '@meta/siteDefaults'
import { resolve } from 'url'
import { Tag } from '@tryghost/content-api'

interface FeedProps {
  settings: GhostSettings
  posts: GhostPostsOrPages
}

export const generateRSSFeed = ({ posts, settings }: FeedProps) => {
  const { siteUrl } = settings.processEnv
  const feedOptions = {
    title: siteTitleMeta,
    description: siteDescriptionMeta,
    generator: `Jamify Blog Starter 2.0`,
    feed_url: resolve(siteUrl, 'rss.xml'),
    site_url: resolve(siteUrl, ''),
    image_url: resolve(siteUrl, siteIcon),
    ttl: 60,
    custom_namespaces: {
      content: `http://purl.org/rss/1.0/modules/content/`,
      media: `http://search.yahoo.com/mrss/`,
    },
  }
  const feed = new RSS(feedOptions)

  const feedItems = posts.map(post => generateItem({ post, settings }))

  feedItems.forEach(item => feed.item(item))

  return feed.xml({ indent: false })
}

interface ItemProps {
  settings: GhostSettings
  post: GhostPostOrPage
}

const generateItem = ({ post, settings }: ItemProps) => {
  const { siteUrl } = settings.processEnv
  const {
    url = '',
    canonical_url,
    title = '',
    excerpt: description = '',
    id: guid,
    published_at: date,
    tags,
    primary_author: author

  } = post
  const cmsUrl = settings.url || ''
  const postUrl = canonical_url || url
  const itemUrl = (postUrl?.replace(cmsUrl, siteUrl) || '').replace(/\/$/, '');

  // ToDo:
  // const transformedHtml = post.htmlAst
  let html = post.html;
  html = html?.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  const htmlContent = cheerio.load(html || '', { decodeEntities: false, xmlMode: true })
  const imageUrl = post.feature_image

  // Process <img> tags inside the HTML
  htmlContent('img').each((_, img) => {
    const imgElement = htmlContent(img);
    const originalSrc = imgElement.attr('src');

    if (originalSrc) {
      const parsedImageUrl = new URL(originalSrc);
      const imageName = parsedImageUrl.pathname.split('/').pop(); // Extract only the filename
      const newSrc = `${siteUrl}/images/${imageName}`; // Prepend siteUrl to the filename

      // Update the src attribute
      imgElement.attr('src', newSrc);
      imgElement.removeAttr('srcset'); // Remove srcset attribute if present
      imgElement.removeAttr('class'); // Remove srcset attribute if present
      imgElement.removeAttr('loading'); // Remove srcset attribute if present
      imgElement.removeAttr('width'); // Remove srcset attribute if present
      imgElement.removeAttr('sizes'); // Remove srcset attribute if present
      imgElement.removeAttr('alt'); // Remove srcset attribute if present
      imgElement.removeAttr('height'); // Remove srcset attribute if present
    }
  });

  const tagsFilter = (tags: Tag[]) => tags
    .filter(({ name }) => !!name && name.substr(0, 5) !== 'hash-')
    .map(({ name }) => name || '')

  const item = {
    title,
    description,
    guid,
    url: itemUrl,
    date: !!date && date || '',
    categories: tags && tagsFilter(tags) || [],
    author: author && author.name || '',
    custom_elements: [{}],
  }

  if (imageUrl) {
    // Add a media content tag
    item.custom_elements.push({
      'media:content': {
        _attr: {
          url: imageUrl,
          medium: `image`,
        },
      },
    })
    // Also add the image to the content, because not all readers support media:content
    htmlContent(`p`).first().before(`<img src="` + imageUrl + `" />`)
    htmlContent(`img`).attr(`alt`, title || '')
  }

  item.custom_elements.push({
    'content:encoded': {
      _cdata: htmlContent.html(),
    },
  })
  return item
}
