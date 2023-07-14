export function cx(...classNames: unknown[]): string {
  const finalClassNames: string[] = [];
  classNames.forEach((name) => {
    if (typeof name === "string" && name !== "") {
      finalClassNames.push(name);
    }
    if (typeof name === "object" && name !== null) {
      if (Array.isArray(name)) {
        finalClassNames.push(cx(...name));
      } else {
        Object.entries(name).forEach(([key, value]) => {
          if (typeof key === "string" && value) {
            finalClassNames.push(key);
          }
        });
      }
    }
  });
  return finalClassNames.join(" ");
}
