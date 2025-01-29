import { AppProps } from 'next/app'
import { OverlayProvider } from '@components/contexts/overlayProvider'
import { ThemeProvider } from '@components/contexts/themeProvider'
import { processEnv } from '@lib/processEnv'

import '@styles/screen.css'
import '@styles/screen-fixings.css'
import '@styles/dark-mode.css'
import '@styles/prism.css'
import '@styles/toc.css'
import {GoogleAnalytics} from "@next/third-parties/google";
import {useEffect} from "react";

function App({ Component, pageProps }: AppProps) {

  useEffect(()=> {
    const raw = JSON.stringify({
      "page": window.location.pathname,
    });

    const requestOptions = {
      method: 'POST',
      body: raw,
    };

    fetch("https://meyer-laurent-analytics.laurent-2b0.workers.dev/", requestOptions)
  }, [])



  return (
    <ThemeProvider {...processEnv.darkMode} >
      <OverlayProvider >
        <GoogleAnalytics gaId="G-NC259RX0QQ"  />
        <Component {...pageProps} />
      </OverlayProvider>
    </ThemeProvider>
  )
}

export default App
