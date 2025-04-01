// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { getPost, getPosts } from "./posts.ts";

import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert/equals";

Deno.test("[blog] getPost()", async () => {
  const post = await getPost("first-post");
  assert(post);
  assertEquals(post.publishedAt, new Date("2022-11-04T15:00:00.000Z"));
  assertEquals(post.summary, "This is an excerpt of my first blog post.");
  assertEquals(post.title, "This is my first blog post!");
  assertEquals(await getPost("third-post"), null);
});

Deno.test("[blog] getPosts()", async () => {
  const posts = await getPosts();
  assert(posts);
  assertEquals(posts.length, 2);
});
