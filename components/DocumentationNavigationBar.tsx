const DocumentationNavigationBar = (props: { active: string }) => {
  const items = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Docs",
      href: "/docs",
    },
    {
      name: "Blog",
      href: "/blog",
    },
    {
      name: "Showcase",
      href: "/showcase",
    },
    {
      name: "Blog",
      href: "/blog",
    },
    {
      name: "fashionunited.info 🡕",
      href: "https://fashionunited.info/about-us",
    },
  ];

  return (
    <span>
      {items.map((item) => (
        <a
          href={item.href}
          class={`text-sm relative -ml-2 hidden whitespace-nowrap p-2 md:inline-block text-gray-600 hover:text-gray-800 ${
            props.active == item.href ? "font-bold text-gray-700" : ""
          }`}
        >
          {item.name}
        </a>
      ))}
    </span>
  );
};

export default DocumentationNavigationBar;
