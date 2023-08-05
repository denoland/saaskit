// Copyright 2023 the Deno authors. All rights reserved. MIT license.

type Props = {
  previousPage?: number;
  nextPage?: number;
  timeSelectorLink: string;
};

function Previous({ previousPage, timeSelectorLink }: Props) {
  return (
    <a
      href={"?" + timeSelectorLink + "page=" + previousPage}
      class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-500 hover:(text-black dark:text-white)"
    >
      <span class="sr-only">Previous</span>
      <svg
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clip-rule="evenodd"
        />
      </svg>
    </a>
  );
}

function Next({ nextPage, timeSelectorLink }: Props) {
  return (
    <a
      href={"?" + timeSelectorLink + "page=" + nextPage}
      class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-500 hover:(text-black dark:text-white)"
    >
      <span class="sr-only">Next</span>
      <svg
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clip-rule="evenodd"
        />
      </svg>
    </a>
  );
}

function paginationRange(currentPage: number, lastPage: number) {
  if (lastPage <= 7) {
    return [...Array(lastPage).keys()].map((v) => v + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, null, lastPage];
  }
  if (currentPage >= (lastPage - 3)) {
    return [
      1,
      null,
      lastPage - 4,
      lastPage - 3,
      lastPage - 2,
      lastPage - 1,
      lastPage,
    ];
  }
  return [
    1,
    null,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    null,
    lastPage,
  ];
}

export default function PageSelector(
  props: { currentPage: number; lastPage: number; timeSelector?: string },
) {
  const baseLinkStyle = "relative inline-flex items-center px-4 py-2 text-sm";
  const selectedLinkStyle = " font-semibold dark:text-white";
  const unselectedLinkStyle =
    " text-gray-500 transition duration-300 hover:(text-black dark:text-white)";
  const nextPage = props.currentPage === props.lastPage
    ? props.currentPage
    : props.currentPage + 1;
  const previousPage = props.currentPage === 1
    ? props.currentPage
    : props.currentPage - 1;
  // to persist the time-ago selector
  const timeSelectorLink = props.timeSelector === undefined
    ? ""
    : ("time-ago=" + props.timeSelector + "&");
  const paginationRage = paginationRange(props.currentPage, props.lastPage);

  return (
    <div class="flex justify-center py-4 mx-auto">
      <nav
        class="isolate inline-flex -space-x-px"
        aria-label="Pagination"
      >
        <Previous
          previousPage={previousPage}
          timeSelectorLink={timeSelectorLink}
        />
        {paginationRage.map((page) => (
          page !== null
            ? (
              <a
                href={"?" + timeSelectorLink + "page=" + page}
                class={baseLinkStyle + (page === props.currentPage
                  ? selectedLinkStyle
                  : unselectedLinkStyle)}
              >
                {page}
              </a>
            )
            : (
              <span class="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 focus:outline-offset-0">
                ...
              </span>
            )
        ))}
        <Next
          nextPage={nextPage}
          timeSelectorLink={timeSelectorLink}
        />
      </nav>
    </div>
  );
}
