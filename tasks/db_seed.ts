import {createProduct, createUser, createBrand, randomBrand, randomUser, randomProduct} from "@/utils/db.ts";
import { ulid } from "$std/ulid/mod.ts";

// Reference: https://github.com/HackerNews/API
const API_BASE_URL = `https://hacker-news.firebaseio.com/v0`;
const API_ITEM_URL = `${API_BASE_URL}/item`;
const API_TOP_STORIES_URL = `${API_BASE_URL}/topstories.json`;
const TOP_STORIES_COUNT = 10;

interface Story {
  id: number;
  score: number;
  time: number; // Unix seconds
  by: string;
  title: string;
  url: string;
}

// STEP 1 — Fetch HN stories
const resp = await fetch(API_TOP_STORIES_URL);
const allTopStories = await resp.json() as number[];
const topStories = allTopStories.slice(0, TOP_STORIES_COUNT);

const storyData = await Promise.all(
    topStories.map((id) =>
        fetch(`${API_ITEM_URL}/${id}.json`).then((r) => r.json())
    ),
);

// STEP 2 — Map stories into produtos
const products = storyData
    .filter(({ url }) => url)
    .map(({ by: userLogin, title, url, score, time }) => {
        const base = randomProduct();
        return {
            ...base,
            id: ulid(),
            userLogin,
            title,
            url,
            score,
            createdAt: new Date(time * 1000).getTime(),
        };
    });

// STEP 3 — Derive marcas using randomBrand() + override userLogin
const uniqueLogins = new Set(products.map((p) => p.userLogin));
const brands = [...uniqueLogins].map((login) => {
    const brand = randomBrand();
    return {
        ...brand,
        userLogin: login,
    };
});

// STEP 4 — Map userLogin → brandId
const brandIdMap = new Map(brands.map((b) => [b.userLogin, b.id]));

// STEP 5 — Attach brandId to produtos
const productsWithBrand = products.map((p) => ({
    ...p,
    brandId: brandIdMap.get(p.userLogin),
}));
// STEP 6 — Seed marcas
await Promise.all(brands.map(createBrand));

// STEP 7 — Seed produtos
await Promise.all(productsWithBrand.map(createProduct));

// STEP 8 — Seed usuarios with randomUser()
await Promise.all(
    [...uniqueLogins].map((login) => {
        const user = randomUser();
        return createUser({ ...user, login }); // override login to match
    })
);

console.log("🌱 Seed complete — produtos, marcas, and usuarios are in KV");