import DocumentationTitle from "./DocumentationTitle.tsx";
import DocumentationNavigationBar from "./DocumentationNavigationBar.tsx";
import Logo from "./Logo.tsx";
import {
  GrGithub,
} from "https://deno.land/x/react_icons_gr@1.0.9/ico/GrGithub.ts";

const DocumentationHeader = (props: { title: string; active: string }) => {
  return (
    <div class="docs-nav-container sticky top-0 z-20 w-full bg-transparent print:hidden dark:bg-dark">
      <div class="docs-nav-container-blur pointer-events-none absolute z-[-1] h-full w-full bg-white dark:bg-dark shadow-[0_2px_4px_rgba(0,0,0,.02),0_1px_0_rgba(0,0,0,.06)] dark:shadow-[0_-1px_0_rgba(255,255,255,.1)_inset] contrast-more:shadow-[0_0_0_1px_#000] contrast-more:dark:shadow-[0_0_0_1px_#fff]">
      </div>
      <nav class="mx-auto flex h-[var(--docs-navbar-height)] max-w-[90rem] items-center justify-end gap-2 pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]">
        <a href="/" class="p-4 flex items-center hover:opacity-75 mr-auto">
          <span class="sr-only">FashionUnited</span>
          <span class="pt-2 pr-2 pb-2">
            <Logo />
          </span>
        </a>

        <label
          for="docs_sidebar"
          class="px-4 py-4 md:hidden border(l-2 indigo-200) flex items-center hover:bg-indigo-100"
        >
          <svg
            class="h-6 w-6"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            >
            </path>
          </svg>
        </label>
        <DocumentationNavigationBar active={props.active} />
        <div class="docs-search relative md:w-64 hidden md:inline-block mx-min-w-[200px]">
          <div class="relative flex items-center text-gray-900 contrast-more:text-gray-800 dark:text-gray-300 contrast-more:dark:text-gray-300">
          </div>
        </div>
        <a
          href="https://github.com/fuww/developer.fashionunited.com"
          target="_blank"
          rel="noreferrer"
          class="p-2 text-current"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="3 3 18 18">
            <title>GitHub</title>
            <path d="M12 3C7.0275 3 3 7.12937 3 12.2276C3 16.3109 5.57625 19.7597 9.15374 20.9824C9.60374 21.0631 9.77249 20.7863 9.77249 20.5441C9.77249 20.3249 9.76125 19.5982 9.76125 18.8254C7.5 19.2522 6.915 18.2602 6.735 17.7412C6.63375 17.4759 6.19499 16.6569 5.8125 16.4378C5.4975 16.2647 5.0475 15.838 5.80124 15.8264C6.51 15.8149 7.01625 16.4954 7.18499 16.7723C7.99499 18.1679 9.28875 17.7758 9.80625 17.5335C9.885 16.9337 10.1212 16.53 10.38 16.2993C8.3775 16.0687 6.285 15.2728 6.285 11.7432C6.285 10.7397 6.63375 9.9092 7.20749 9.26326C7.1175 9.03257 6.8025 8.08674 7.2975 6.81794C7.2975 6.81794 8.05125 6.57571 9.77249 7.76377C10.4925 7.55615 11.2575 7.45234 12.0225 7.45234C12.7875 7.45234 13.5525 7.55615 14.2725 7.76377C15.9937 6.56418 16.7475 6.81794 16.7475 6.81794C17.2424 8.08674 16.9275 9.03257 16.8375 9.26326C17.4113 9.9092 17.76 10.7281 17.76 11.7432C17.76 15.2843 15.6563 16.0687 13.6537 16.2993C13.98 16.5877 14.2613 17.1414 14.2613 18.0065C14.2613 19.2407 14.25 20.2326 14.25 20.5441C14.25 20.7863 14.4188 21.0746 14.8688 20.9824C16.6554 20.364 18.2079 19.1866 19.3078 17.6162C20.4077 16.0457 20.9995 14.1611 21 12.2276C21 7.12937 16.9725 3 12 3Z">
            </path>
          </svg>
          <GrGithub />
          <span class="sr-only">GitHub</span>
          <span class="sr-only select-none">(opens in a new tab)</span>
        </a>
      </nav>
    </div>
  );
};

export default DocumentationHeader;
