// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  safelist: [
    "gap-x-8",
    "hover:dark:text-white",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#be185d",
        secondary: "#4338ca",
      },
    },
  },
  plugins: [],
} satisfies Config;
