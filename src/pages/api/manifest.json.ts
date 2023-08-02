import { NextResponse } from 'next/server'

import { documentTitle } from '../../utils/constants'

export const runtime = 'edge'

export default function handler() {
  return NextResponse.json({
    name: documentTitle,
    short_name: documentTitle,
    icons: [
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/android-chrome-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    background_color: '#FFFFFF',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
  })
}
