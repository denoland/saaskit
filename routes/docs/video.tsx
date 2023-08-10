import VideoGrid from "@/components/VideoGrid.tsx";
import Video from "../../islands/Video.tsx";

export default function VideoPage() {
  return (
    <main>
      <div class="relative px-4 sm:px-6 lg:px-8">
        <div class="text-lg font-bold max-w-prose mx-auto">
          <span class="block text-lg font-bold text-center text-rose-600 font-semibold">
          </span>
          <h1>
            <span class="mt-2 block text-3xl text-center leading-8 font-bold tracking-tight text-gray-900 dark:text-white dark:text-white dark:text-white dark:text-white sm:text-4xl sm:tracking-tight">
              Video
            </span>
          </h1>
        </div>

        <div class="mt-6 prose prose-rose prose-lg text-gray-500 mx-auto">
          <p>This is the video page.</p>
        </div>

        {/* <div class="bg-slate-50	h-96"> */}
        <div class="h-96">
          {/* 384 px */}
          <Video />
        </div>
      </div>

      <div class="grid grid-cols-5 gap-2">
        {/* <SideBar /> */}
        <div id="sidebar" class="col-span-1 bg-yt-nav h-screen m-8"></div>
        <VideoGrid />
      </div>
    </main>
    // <main class="prose">
    //   <h1>Video</h1>
    //   <p>This is the video page.</p>
    //   <Video />
    // </main>
  );
}
