// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { extract } from "std/front_matter/yaml.ts";
import { join } from "std/path/mod.ts";

export interface Post {
  slug: string;
  title: string;
  publishedAt: Date;
  content: string;
  summary: string;
}

/**
 * Asynchronously retrieves a list of posts from the "./data/posts" directory and sorts them by published date.
 *
 * @returns {Promise<Post[]>} - A promise that resolves to an array of Post objects sorted by published date.
 *
 * @example
 * // Retrieve and display a list of posts
 * try {
 *   const posts = await getPosts();
 *   console.log("List of Posts:");
 *   for (const post of posts) {
 *     console.log(`Title: ${post.title}`);
 *     console.log(`Published At: ${post.publishedAt}`);
 *     console.log(`Content: ${post.content}`);
 *     console.log("------");
 *   }
 * } catch (error) {
 *   console.error("Error fetching posts:", error);
 * }
 */
export async function getPosts(): Promise<Post[]> {
  const files = Deno.readDir("./data/posts");
  const promises = [];
  for await (const file of files) {
    const slug = file.name.replace(".md", "");
    promises.push(getPost(slug));
  }
  const posts = await Promise.all(promises) as Post[];
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return posts;
}

/**
 * Asynchronously retrieves a post by its slug from the "./data/posts" directory and returns it as a Post object.
 * If no post with the given slug is found, it returns null.
 *
 * @param {string} slug - The slug of the post to retrieve.
 * @returns {Promise<Post | null>} - A promise that resolves to the retrieved Post object or null if not found.
 *
 * @example
 * // Retrieve a post by its slug
 * const postSlug = "example-post";
 *
 * try {
 *   const post = await getPost(postSlug);
 *   if (post) {
 *     console.log("Post Title:", post.title);
 *     console.log("Published At:", post.publishedAt);
 *     console.log("Content:", post.content);
 *   } else {
 *     console.log("Post not found.");
 *   }
 * } catch (error) {
 *   console.error("Error fetching post:", error);
 * }
 */
export async function getPost(slug: string): Promise<Post | null> {
  try {
    const text = await Deno.readTextFile(
      join("./data/posts", `${slug}.md`),
    );
    const { attrs, body } = extract(text);
    return {
      slug,
      title: attrs.title as string,
      publishedAt: new Date(attrs.published_at as Date),
      content: body,
      summary: attrs.summary as string || "",
    };
  } catch {
    return null;
  }
}
