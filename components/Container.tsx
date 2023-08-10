import { ComponentChildren } from "preact";

interface Properties {
  children: ComponentChildren;
}

const Container = (properties: Properties) => {
  const { children } = properties;

  return <div class="container mx-auto px-5">{children}</div>;
};

export default Container;
