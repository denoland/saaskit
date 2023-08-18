import { useState } from "preact/hooks";

import Button from "@/components/Button.tsx";

export default function Video(props: { src: string; title: string }) {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <figure class="video-container">
      {!showVideo
        ? (
          <Button
            class="items-center hidden px-4 py-2 space-x-3 text-gray-600 transition-colors duration-300 transform border rounded-lg lg:flex dark:text-gray-200 dark:border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            onClick={() => {
              setShowVideo(true);
            }}
          >
            📼 Click to enable YouTube video playback
          </Button>
        )
        : (
          <iframe
            class="video"
            width="768"
            height="432"
            loading="lazy"
            src={props.src}
            title={props.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media;
            gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      <figcaption>
        {props.title}
      </figcaption>
    </figure>
  );
}

Video.defaultProps = {
  src: "https://www.youtube-nocookie.com/embed/1La4QzGeaaQ",
  title: "Peru 8K HDR 60FPS (FUHD)",
};
