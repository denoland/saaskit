// import { useConfig } from "../contexts";
// import gitUrlParse from "git-url-parse";

import { site } from "../data/site.ts";

export const getGitEditUrl = (filePath?: string): string => {
  //   const config = useConfig();
  //   const repo = gitUrlParse(config.docsRepositoryBase || "");
  const repo = {
    href: site.docsRepositoryBase,
  };

  if (!repo) throw new Error("Invalid `docsRepositoryBase` URL!");

  return `${repo.href}/-/tree/main/${filePath}`;
};

export const getGitIdeUrl = (filePath?: string): string => {
  const repo = {
    href: site.docsRepositoryIde,
  };

  if (!repo) throw new Error("Invalid `docsRepositoryIde` URL!");

  return `${repo.href}/${filePath}`;
};
