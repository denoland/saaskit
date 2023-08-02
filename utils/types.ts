// import { Item } from "./db.ts";
import { TableDefinition } from "pentagon/src/types.ts";
import { z } from "z";

export interface Item {
  userId: string;
  title: string;
  url: string;
  // The below properties can be automatically generated upon item creation
  id: string;
  createdAt: Date;
  score: number;
}

const item = z.object({
  id: z.string().uuid().describe("primary"),
  createdAt: z.coerce.date(),
  score: z.coerce.number(),
  url: z.string(),
  title: z.string(),
  userId: z.string().uuid(),
});

export const schema: Record<string, TableDefinition> = {
  items: {
    schema: item,
  },
};
