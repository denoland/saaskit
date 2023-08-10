import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { frontMatter } from "@/utils/markdown.ts";
import * as gfm from "$gfm";
import DocumentationTitle from "@/components/DocumentationTitle.tsx";
import DocumentationHeader from "@/components/DocumentationHeader.tsx";
import DocumenationSidebar from "@/components/DocumentationSidebar.tsx";
import { DocumentationToc } from "@/components/DocumentationToc.tsx";

import { SLUGS, TABLE_OF_CONTENTS, TableOfContentsEntry } from "@/data/docs.ts";
import { getGitEditUrl, getGitIdeUrl } from "@/utils/get-git-edit-url.ts";
import { EditPage } from "@/components/EditPage.tsx";
import { generateImageSrcSet, resizeImage } from "@/utils/image.ts";
import SearchDialog from "@/islands/SearchDialog.tsx";

import * as mod from "https://deno.land/std@0.198.0/fmt/printf.ts";

interface Data {
  page: Page;
  searchQuery: string;
}

interface Page extends TableOfContentsEntry {
  markdown: string;
  data: Record<string, unknown>;
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const slug = ctx.params.slug;
    if (slug === "") {
      return new Response("", {
        status: 307,
        headers: { location: "/docs/introduction" },
      });
    }
    if (slug === "concepts/architecture") {
      return new Response("", {
        status: 307,
        headers: { location: "/docs/concepts/architecture" },
      });
    }

    const entry = TABLE_OF_CONTENTS[slug];
    if (!entry) {
      return ctx.renderNotFound();
    }
    const url = new URL(`../../data/${entry.file}`, import.meta.url);
    const fileContent = await Deno.readTextFile(url);
    const { body, attrs } = frontMatter<Record<string, unknown>>(fileContent);
    const page = { ...entry, markdown: body, data: attrs ?? {} };

    const searchQuery = new URL(_req.url).searchParams.get("search") ?? "";

    const resp = ctx.render({ page, searchQuery });

    return resp;
  },
};

export default function DocsPage(props: PageProps<Data>) {
  let description;

  const filePath = `data/${props.data.page.file}`;
  const editUrl = getGitEditUrl(filePath);
  const editIdeUrl = getGitIdeUrl(filePath);

  if (props.data.page.data.description) {
    description = String(props.data.page.data.description);
  }

  return (
    <>
      <Head>
        <title>
          {props.data.page?.title ?? "Not Found"} | FashionUnited docs
        </title>
        <link rel="stylesheet" href={`/gfm.css`} />
        {description && <meta name="description" content={description} />}
      </Head>
      <div class="ltr">
        <DocumentationHeader title="Documentation" active="/docs" />
        <div class="mx-auto flex max-w-[90rem] min-h-screen">
          <div class="motion-reduce:transition-none [transition:background-color_1.5s_ease] bg-transparent">
          </div>
          <Main
            path={props.url.pathname}
            page={props.data.page}
          />
          {editUrl && (
            <DocumentationToc editUrl={editUrl} editIdeUrl={editIdeUrl} />
          )}
        </div>
        <div>
          {editUrl && <EditPage editUrl={editUrl} editIdeUrl={editIdeUrl} />}
        </div>
      </div>
    </>
  );
}

function Main(props: { path: string; page: Page }) {
  return (
    // <div class="flex-1">
    <div>
      <MobileSidebar path={props.path} />
      {
        /* <div class="mx-auto max-w-screen-lg px-4 flex gap-6">
      */
      }
      <div class="mx-auto flex max-w-[90rem]">
        <DesktopSidebar path={props.path} />
        <Content page={props.page} />
      </div>
    </div>
  );
}

function MobileSidebar(props: { path: string }) {
  return (
    <>
      <input
        type="checkbox"
        class="hidden toggle"
        id="docs_sidebar"
        autocomplete="off"
      >
      </input>
      <div class="fixed inset-0 flex z-40 hidden toggled">
        <label
          class="absolute inset-0 bg-gray-600 opacity-75"
          for="docs_sidebar"
        />
        <div class="relative flex-1 flex flex-col w-[16rem] h-full bg-white border(r-2 gray-100)">
          <div class="p-4 border(b-2 gray-100) bg-indigo-300">
            <DocumentationTitle title="Company docs" />
          </div>
          <nav class="pt-2 pb-16 px-4 overflow-x-auto">
            <DocumenationSidebar path={props.path} />
          </nav>
        </div>
      </div>
    </>
  );
}

function DesktopSidebar(props: { path: string }) {
  return (
    <aside class="docs-sidebar-container flex flex-col md:top-16 md:shrink-0 motion-reduce:transform-none transform-gpu transition-all ease-in-out print:hidden md:w-64 md:sticky md:self-start max-md:[transform:translate3d(0,-100%,0)]">
      <DocumenationSidebar path={props.path} />
    </aside>
  );
}

function Content(props: { page: Page }) {
  return (
    <article class="w-full break-words docs-content flex min-h-[calc(100vh-var(--docs-navbar-height))] min-w-0 justify-center pb-8 pr-[calc(env(safe-area-inset-right)-1.5rem)]">
      <main class="w-full min-w-0 max-w-6xl px-6 pt-4 md:px-12">
        {
          /* <div class="p-4 mx-auto max-w-screen-md font-mono">
          <SearchDialog />
        </div> */
        }
        <h1 class="text(4xl black) tracking-tight font-extrabold mt-4 dark:text-white">
          {props.page.title}
        </h1>
        <div
          class="mt-6 markdown-body prose dark:bg-dark dark:text-gray-50"
          dangerouslySetInnerHTML={{
            __html: gfm.render(props.page.markdown, {
              allowedTags: ["progressive-img"],
              allowedAttributes: {
                "progressive-img": [
                  "placeholder",
                  "src",
                  "srcset",
                  "sizes",
                  "alt",
                  "load-strategy",
                  "placeholder-load-strategy",
                  "placeholder-fetch-priority",
                  "final-fetchpriority",
                  "intersection-margin",
                  "placeholder-intersection-margin",
                ],
              },
              imageTag: (src, alt, title) => {
                const imageUrls = generateImageSrcSet(src, [
                  { width: 320 },
                  { width: 599 },
                  { width: 728 },
                  { width: 984 },
                  { width: 1198 },
                  { width: 1456 },
                  { width: 1968 },
                  { width: 2480 },
                  { width: 2992 },
                ]);

                return (`<progressive-img
              placeholder="${
                  resizeImage(src, {
                    width: 42,
                    quality: 10,
                  })
                }"
              src="${imageUrls[8]}"
              alt="${alt ?? ""}" 
              title="${title ?? ""}" 
              sizes="(min-width: 1536px) 1496px, (min-width: 1280px) 1240px, (min-width: 1024px) 984px, (min-width: 768px) 728px, (min-width: 640px) 600px, calc(100vw - 2.5rem"
              srcSet="
                ${imageUrls[0]} 320w, 
                ${imageUrls[1]} 599w, 
                ${imageUrls[2]} 728w, 
                ${imageUrls[3]} 984w, 
                ${imageUrls[4]} 1198w, 
                ${imageUrls[5]} 1456w, 
                ${imageUrls[6]} 1968w, 
                ${imageUrls[7]} 2480w, 
                ${imageUrls[8]} 2992w"
            />`);
              },
            }),
          }}
        />
        <ForwardBackButtons slug={props.page.slug} />
      </main>
    </article>
  );
}

const button = "p-2 bg-gray-100 w-full border(1 gray-200) grid";

function ForwardBackButtons(props: { slug: string }) {
  const currentIndex = SLUGS.findIndex((slug) => slug === props.slug);
  const previousSlug = SLUGS[currentIndex - 1];
  const nextSlug = SLUGS[currentIndex + 1];
  const previous = TABLE_OF_CONTENTS[previousSlug];
  const next = TABLE_OF_CONTENTS[nextSlug];

  const upper = "text(sm gray-600)";
  const category = "font-normal";
  const lower = "text-gray-900 dark:text-white font-medium";

  return (
    <div class="mt-8 flex flex(col md:row) gap-4">
      {previous && (
        <a href={previous.href} class={`${button} text-left`}>
          <span class={upper}>{"←"} Previous</span>
          <span class={lower}>
            <span class={category}>
              {previous.category
                ? `${TABLE_OF_CONTENTS[previous.category].title}: `
                : ""}
            </span>
            {previous.title}
          </span>
        </a>
      )}
      {next && (
        <a href={next.href} class={`${button} text-right`}>
          <span class={upper}>Next {"→"}</span>
          <span class={lower}>
            <span class={category}>
              {next.category
                ? `${TABLE_OF_CONTENTS[next.category].title}: `
                : ""}
            </span>
            {next.title}
          </span>
        </a>
      )}
    </div>
  );
}
