// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
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
