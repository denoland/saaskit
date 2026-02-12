// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * BrandSlogan - Slogan/tagline component
 * From BRANDING.json
 */

import { ComponentChildren } from "preact";

export interface SloganProps {
  variant?: "primary" | "technical" | "product" | "visionary" | "community";
  className?: string;
}

export function BrandSlogan({
  variant = "primary",
  className = "",
}: SloganProps) {
  const slogans = {
    primary: {
      text: "Detecting pulse of music trends",
      style: "border-l-4 border-primary pl-5 text-primary-300",
    },
    technical: {
      text: "Real-time music trend intelligence",
      style: "text-secondary",
    },
    product: {
      text: "Data-driven music discovery",
      style: "text-accent",
    },
    visionary: {
      text: "The future of music analytics",
      style: "text-primary-300",
    },
    community: {
      text: "By developers, for developers",
      style: "text-success",
    },
  };

  const { text, style } = slogans[variant];

  return (
    <p class={`font-heading text-h5 ${style} ${className}`}>
      "{text}"
    </p>
  );
}
