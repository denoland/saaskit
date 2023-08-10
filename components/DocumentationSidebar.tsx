import {
  categories,
  TableOfContentsCategory,
  TableOfContentsCategoryEntry,
} from "../data/docs.ts";

const classes = {
  link: "flex rounded px-2 py-1.5 text-sm transition-colors break-words" + " " +
    "cursor-pointer [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] contrast-more:border",
  inactive:
    "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800" +
    " " +
    "dark:text-neutral-500 dark:hover:bg-indigo-100/5 dark:hover:text-gray-50" +
    " " +
    "contrast-more:text-gray-900 contrast-more:dark:text-gray-50" + " " +
    "contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50",
  active: "bg-indigo-50 font-bold text-indigo-500 dark:bg-indigo-500/10" + " " +
    "dark:bg-primary-400/10 dark:text-primary-600" + " " +
    "contrast-more:border-indigo-500 contrast-more:dark:border-indigo-500",
  list: "flex flex-col gap-1",
  border: "relative before::absolute before:inset-y-1.5" + " " +
    'before::w-px before::bg-gray-200 before::content-[""] ' + " " +
    "dark::before::bg-neutral-800" +
    " " +
    "pl-3 :before::left-0",
  // ltr::pl-3 ltr::before::left-0 rtl:pr-3 rtl::before::right-0
};

export default function DocsSidebar(props: { path: string }) {
  return (
    <div class="overflow-y-auto overflow-x-hidden p-4 grow md:h-[calc(100vh-var(--navbar-height)-var(--menu-height))] scrollbar">
      <div class="transform-gpu overflow-hidden transition-all ease-in-out motion-reduce:transition-none">
        <div class="transition-opacity duration-500 ease-in-out motion-reduce:transition-none opacity-100">
          <ol
            class={`${classes.list} ${classes.border} ml-3`}
            // ltr:ml-3 rtl:mr-3
          >
            {categories.map((category) => (
              <SidebarCategory path={props.path} category={category} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function SidebarCategory(props: {
  path: string;
  category: TableOfContentsCategory;
}) {
  const { title, href, entries } = props.category;

  const outerLink = `${
    href == props.path ? classes.active : classes.inactive
  } ${classes.link}`;

  return (
    <li class={`${classes.list}`}>
      <a
        href={href}
        class={`${outerLink} flex gap-2 before::opacity-25 before::content-["#"]`}
      >
        {title}
      </a>
      {entries.length > 0 && (
        <ul
          class={`${classes.list} ${classes.border} ml-3`}
          // ltr:ml-3 rtl:mr-3
        >
          {entries.map((entry) => (
            <SidebarEntry path={props.path} entry={entry} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SidebarEntry(props: {
  path: string;
  entry: TableOfContentsCategoryEntry;
}) {
  const { title, href } = props.entry;

  const innerLink = `${
    href == props.path ? classes.active : classes.inactive
  } ${classes.link} pl-4`;

  return (
    <li
      class={`${classes.list}`}
    >
      <a href={href} class={`${innerLink}`}>{title}</a>
    </li>
  );
}
