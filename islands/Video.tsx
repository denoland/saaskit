export default function Video(
  props: {
    src: string;
    title: string;
    width: number;
    height: number;
    hideCaption?: boolean;
  },
) {
  // if (!props.hideCaption) {
  //   return props.hideCaption = false;
  // }
  return (
    <figure>
      <iframe
        class="video"
        width={props.width}
        height={props.height}
        loading="lazy"
        src={props.src}
        title={props.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media;
            gyroscope; picture-in-picture"
        allowFullScreen
      />
      {props.hideCaption ? "" : (
        <figcaption>
          {props.title}
        </figcaption>
      )}
    </figure>
  );
}

Video.defaultProps = {
  src:
    "https://customer-wnmai76q1buwrew0.cloudflarestream.com/fab0351436b393bc2c8c8e24c831440e/iframe?poster=https%3A%2F%2Fcustomer-wnmai76q1buwrew0.cloudflarestream.com%2Ffab0351436b393bc2c8c8e24c831440e%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600",
  // ?betaCodecSuggestion=av1
  // "https://www.youtube-nocookie.com/embed/1La4QzGeaaQ",
  title: "Peru 8K HDR 60FPS (FUHD)",
  width: 1280,
  height: 720,
};
