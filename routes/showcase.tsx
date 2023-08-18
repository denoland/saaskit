import { RouteContext } from "$fresh/server.ts";
import Container from "@/components/Container.tsx";
import Showcase from "@/components/Showcase.tsx";
import type { State } from "./_middleware.ts";
import SearchDialog from "@/islands/SearchDialog.tsx";

export default function ShowcasePage(
  _req: Request,
  ctx: RouteContext<undefined, State>,
) {
  return (
    <>
      <main>
        <Container>
          <SearchDialog withPadding />
          <Showcase />
        </Container>
      </main>
    </>
  );
}
