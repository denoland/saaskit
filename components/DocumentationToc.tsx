import Container from "./Container.tsx";

type Props = {
  preview?: boolean;
  editUrl?: string;
  editIdeUrl?: string;
};

export const DocumentationToc = ({ preview, editUrl, editIdeUrl }: Props) => {
  if (!editUrl) {
    return null;
  }

  return (
    <nav
      class="toc order-last hidden w-64 shrink-0 xl:block px-4"
      aria-label="table of contents"
    >
      <div class="scrollbar sticky top-16 overflow-y-auto pr-4 pt-6 text-sm [hyphens:auto] max-h-[calc(100vh-var(--navbar-height)-env(safe-area-inset-bottom))] mr-4">
        {/* ltr:-mr-4 rtl:-ml-4 */}
        {
          /* <p class="mb-4 font-semibold tracking-tight">On This Page</p>
        <ul>
          <li class="my-2 scroll-my-6 scroll-py-6">
            <a
              href="#quick-start"
              class="font-semibold inline-block text-indigo-600 subpixel-antialiased contrast-more:!text-indigo-600 contrast-more:text-gray-900 contrast-more:underline contrast-more:dark:text-gray-50"
            >
              Quick Start
            </a>
          </li>
        </ul> */
        }
        <div class="mt-8 border-t bg-transparent pt-8 shadow-[0_-12px_16px_white] dark:shadow-[0_-12px_16px_#111] sticky bottom-0 flex flex-col items-start gap-2 pb-8 dark:border-neutral-800 contrast-more:border-t contrast-more:border-neutral-400 contrast-more:shadow-none contrast-more:dark:border-neutral-400">
          <a
            href="https://github.com/fuww/developer.fashionunited.com/issues/new/choose"
            target="_blank"
            rel="noreferrer"
            class="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 contrast-more:text-gray-800 contrast-more:dark:text-gray-50"
          >
            Question? Give us feedback →<span class="sr-only">
              (opens in a new tab)
            </span>
          </a>
          <a
            href="mailto:info@fashionunited.com"
            rel="noreferrer"
            class="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 contrast-more:text-gray-800 contrast-more:dark:text-gray-50"
          >
            Or send an email →<span class="sr-only">
              (opens in a new tab)
            </span>
          </a>
          <a
            class="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 contrast-more:text-gray-800 contrast-more:dark:text-gray-50"
            href={editIdeUrl}
          >
            Edit this page on GitHub →
          </a>
        </div>
      </div>
    </nav>
    //   <Container>
    //     <div class="py-2 text-center text-sm">
    //       <p class="mb-4 font-semibold tracking-tight">On This Page</p>

    //       <p>
    //         View{" "}
    //         <a
    //           href={editUrl}
    //           class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
    //         >
    //           page source
    //         </a>{" "}
    //         - Edit in{" "}
    //         <a
    //           href={editIdeUrl}
    //           class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
    //         >
    //           Web IDE
    //         </a>
    //       </p>
    //     </div>
    //   </Container>
    // </div>
  );
};
