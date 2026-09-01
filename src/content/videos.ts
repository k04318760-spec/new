import type { Video } from './types'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE MEMORY ARCHIVE — all 11 clips, already compressed.            ║
 * ║                                                                      ║
 * ║  The labels below describe what is visibly happening in each clip.   ║
 * ║  Rewrite them: you know what was actually going on and the labels    ║
 * ║  are half the joke.                                                  ║
 * ║                                                                      ║
 * ║  Nothing downloads until he taps a specific memory, so a long list   ║
 * ║  costs him nothing.                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
export const videos: Video[] = [
  {
    id: 'v1',
    code: 'MEMORY_01',
    label: 'asleep at his desk',
    src: '/videos/memory-01.mp4',
    poster: '/videos/memory-01.jpg',
    duration: '0:04',
  },
  {
    id: 'v2',
    code: 'MEMORY_02',
    label: 'tongue out, in public',
    src: '/videos/memory-02.mp4',
    poster: '/videos/memory-02.jpg',
    duration: '0:09',
  },
  {
    id: 'v3',
    code: 'MEMORY_03',
    label: 'upside down, no explanation',
    src: '/videos/memory-03.mp4',
    poster: '/videos/memory-03.jpg',
    duration: '0:07',
  },
  {
    id: 'v4',
    code: 'MEMORY_04',
    label: 'too close to the camera',
    src: '/videos/memory-04.mp4',
    poster: '/videos/memory-04.jpg',
    duration: '0:06',
  },
  {
    id: 'v5',
    code: 'MEMORY_05',
    label: 'sunglasses. indoors.',
    src: '/videos/memory-05.mp4',
    poster: '/videos/memory-05.jpg',
    duration: '0:05',
  },
  {
    id: 'v6',
    code: 'MEMORY_06',
    label: 'mid-sentence',
    src: '/videos/memory-06.mp4',
    poster: '/videos/memory-06.jpg',
    duration: '0:01',
  },
  {
    id: 'v7',
    code: 'MEMORY_07',
    label: 'the office',
    src: '/videos/memory-07.mp4',
    poster: '/videos/memory-07.jpg',
    duration: '0:05',
  },
  {
    id: 'v8',
    code: 'MEMORY_08',
    label: 'actually working',
    src: '/videos/memory-08.mp4',
    poster: '/videos/memory-08.jpg',
    duration: '0:01',
  },
  {
    id: 'v9',
    code: 'MEMORY_09',
    label: 'looking up at nothing',
    src: '/videos/memory-09.mp4',
    poster: '/videos/memory-09.jpg',
    duration: '0:02',
  },
  {
    id: 'v10',
    code: 'MEMORY_10',
    label: 'the photo strip',
    src: '/videos/memory-10.mp4',
    poster: '/videos/memory-10.jpg',
    duration: '0:10',
    afterQuote: 'Photos captured a second.',
  },
  {
    id: 'v11',
    code: 'MEMORY_11',
    label: 'the long one',
    src: '/videos/memory-11.mp4',
    poster: '/videos/memory-11.jpg',
    duration: '0:41',
    afterQuote: 'Videos captured everything around it.',
  },
]

export const videoById = (id: string) => videos.find((v) => v.id === id)
