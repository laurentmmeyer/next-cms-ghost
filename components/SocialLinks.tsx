import { TwitterIcon } from '@icons/TwitterIcon'
import { FacebookIcon } from '@icons/FacebookIcon'

import { SocialRss } from '@components/SocialRss'
import { GhostSettings } from '@lib/ghost'

interface SocialLinkProps {
  siteUrl: string
  site: GhostSettings
}

export const SocialLinks = ({ siteUrl, site }: SocialLinkProps) => {
  const twitterUrl = site.twitter && `https://twitter.com/Laurent_m_Meyer`

  return (
    <>
        <a href={twitterUrl} className="social-link social-link-tw" target="_blank" rel="noopener noreferrer" title="Twitter">
          <TwitterIcon />
        </a>
    </>
  )
}
