import { Handlers, PageProps } from "$fresh/server.ts";
// import { State } from "@/utils/state.ts";
import Container from "@/components/Container.tsx";
import Hero from "@/components/Hero.tsx";
import Showcase from "@/components/Showcase.tsx";

import { Handlers } from "$fresh/server.ts";
import { getAllItems, type Item, type Items } from "@/utils/db.ts";
import type { State } from "../_middleware.ts";

interface Data {
  projects: Items[];
}

interface ShowcasePageData extends State {
  itemsUsers: User[];
  items: Item[];
  lastPage: number;
  areVoted: boolean[];
}

export const handler: Handlers<ShowcasePageData, State> = {
  async GET(_req, ctx) {
    const items = await getAllItems;

    return ctx.render({ ...ctx.state, items });
  },
};

export default function ShowcasePage() {
  return (
    <>
      <main>
        <Container>
          <Hero />
          <Showcase />
        </Container>
      </main>
    </>
  );
}
