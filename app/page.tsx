import VideoFeed from '@/components/feed/video-feed'
import { getVideoFeed } from '@/lib/api'

export default async function Home() {
  const videos = await getVideoFeed()

  return (
    <div className="h-screen bg-black max-w-md mx-auto relative shadow-2xl">
      <VideoFeed initialVideos={videos} />
    </div>
  )
}
