const DocumentationTitle = (props: { title: string }) => {
  return (
    <>
      <a
        href="/"
        class="text(2xl gray-900) tracking-tight font-extrabold flex items-center gap-1"
      >
        <span class="font-light block pb-[1px]">{props.title}</span>
      </a>
      <p class="text(sm gray-700)">How we work at FashionUnited</p>
    </>
  );
};

export default DocumentationTitle;
