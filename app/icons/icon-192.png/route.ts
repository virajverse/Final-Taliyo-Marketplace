import React from 'react'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const size = 192
  const node = React.createElement(
    'div',
    {
      style: {
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0b0d',
      } as React.CSSProperties,
    },
    React.createElement(
      'svg',
      { width: size * 0.7, height: size * 0.7, viewBox: '0 0 100 100', xmlns: 'http://www.w3.org/2000/svg' },
      // Top arms of the T
      React.createElement('path', { d: 'M15 20 H85 L75 28 H25 Z', fill: '#6D5BD0' }),
      // Vertical stem of the T
      React.createElement('path', { d: 'M46 30 V90 L55 82 V30 Z', fill: '#6D5BD0' }),
    )
  )
  return new ImageResponse(node as any, { width: size, height: size })
}
