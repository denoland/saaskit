import { JSX } from "preact";

import { IS_BROWSER } from "$fresh/runtime.ts";

const Button = (properties: JSX.HTMLAttributes<HTMLButtonElement>) => {
  const { disabled } = properties;

  return (
    <button
      type="button"
      {...properties}
      disabled={!IS_BROWSER || disabled}
      class="px-2 py-1 border(gray-100 2) hover:bg-gray-200"
    />
  );
};
export default Button;
