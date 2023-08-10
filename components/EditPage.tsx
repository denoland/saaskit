import Container from "./Container.tsx";
// import { getGitEditUrl } from "@/utils/get-git-edit-url.ts";
// import { TableOfContentsEntry } from "../data/docs.ts";

type Props = {
  preview?: boolean;
  editUrl?: string;
  editIdeUrl?: string;
};

export const EditPage = ({ preview, editUrl, editIdeUrl }: Props) => {
  if (!editUrl) {
    return null;
  }

  return (
    <div class="">
      <Container>
        <div class="py-2 text-center text-sm">
          <p>
            View{" "}
            <a
              href={editUrl}
              class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              page source
            </a>{" "}
            - Edit in{" "}
            <a
              href={editIdeUrl}
              class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              Web IDE
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
};
