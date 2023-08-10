import { Handlers, PageProps } from "$fresh/server.ts";
// import { State } from "@/utils/state.ts";
import Container from "@/components/Container.tsx";
import DocumentationHeader from "@/components/DocumentationHeader.tsx";
import Showcase from "@/components/Showcase.tsx";



import { Handlers } from "$fresh/server.ts";
import {
  type Item,
  type Items,
getAllItems
} from "@/utils/db.ts";
import type { State } from "./_middleware.ts";


interface Data {
  projects: Items[];
}


interface ShowcasePageData extends State {
  itemsUsers: User[];
  items: Item[];
  lastPage: number;
  areVoted: boolean[];
}


export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const items = await getAllItems;   

  return ctx.render({ items });

  },
};

export default function ShowcasePage() {
  return (
    <>
      <DocumentationHeader title="Showcase" active="/showcase" />   
      <main>
        <Container>
        <Showcase />
        </Container>
      </main>
    </>
  );
};

