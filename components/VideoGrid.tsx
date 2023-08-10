const ContentArea = () => {
  return (
    <main class="col-span-4 block">
      <div class="grid grid-cols-4 gap-4 m-4">
        {[1, 2, 3, 4].map((item) => {
          return (
            <div key={item}>
              <VideoTile />
            </div>
          );
        })}
      </div>
      <div class="grid grid-cols-4 gap-4 m-4">
        {[1, 2, 3, 4].map((item) => {
          return (
            <div key={item}>
              <VideoTile />
            </div>
          );
        })}
      </div>
      <div class="grid grid-cols-4 gap-4 m-4">
        {[1, 2, 3, 4].map((item) => {
          return (
            <div key={item}>
              <VideoTile />
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default ContentArea;

const VideoTile = () => {
  return (
    <div class="flex flex-col">
      <img
        class="w-full object-cover h-40"
        src="https://source.unsplash.com/user/supergios"
        alt="unsplash_random"
      />
      <div class="flex flex-row mt-2">
        <img
          src="https://media.fashionunited.com/media/favicon/dark/apple-touch-icon-60x60.png"
          alt="FashionUnited"
          class="rounded-full h-10 w-10"
        />
        <div class="flex flex-col">
          <span class="text-white font-medium px-2">
            Title of the video
          </span>
          <span class="text-gray-500 font-base text-xs px-2">FashionUnited</span>
          <span class="text-gray-500 font-base text-xs px-2">
            {Math.floor(Math.random() * 10000)} views •{" "}
            {Math.floor(Math.random() * 10)} months ago
          </span>
        </div>
      </div>
    </div>
  );
};