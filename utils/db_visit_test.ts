// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { getVisitsPerDay, incrementVisitsPerDay, kv } from "./db.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("[db] visit", async () => {
  const date = new Date("2023-01-01");
  const visitsKey = [
    "visits",
    `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
  ];
  await incrementVisitsPerDay(date);
  assertEquals((await getVisitsPerDay(date))!.valueOf(), 1n);
  await kv.delete(visitsKey);
  assertEquals(await getVisitsPerDay(date), null);
});
