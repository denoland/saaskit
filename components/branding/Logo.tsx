// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * Logo - Official Logo Component
 * From BRANDING#2.html and BRANDING.json
 */

import { SITE_NAME } from "@/utils/constants.ts";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: "w-8 h-8", text: "text-base" },
  md: { icon: "w-12 h-12", text: "text-xl" },
  lg: { icon: "w-16 h-16", text: "text-2xl" },
};

export function Logo(
  { size = "md", href = "/", showText = true, className = "" }: LogoProps,
) {
  const sizeClasses = sizes[size];

  return (
    <a href={href} class={`flex items-center gap-3 group ${className}`}>
      <div
        class={`${sizeClasses.icon} rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-fast`}
      >
        <span class="font-heading font-black text-base">TR</span>
      </div>
      {showText && (
        <span
          class={`font-heading font-black ${sizeClasses.text} gradient-text lowercase tracking-wide`}
        >
          {SITE_NAME}
        </span>
      )}
    </a>
  );
}
