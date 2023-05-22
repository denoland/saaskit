// Copyright 2023 the Deno authors. All rights reserved. MIT license.
export function pluralize(unit: number, label: string) {
  return unit === 1 ? `${unit} ${label}` : `${unit} ${label}s`;
}
