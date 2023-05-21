// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { batchify, createItem } from "@/utils/db.ts";

// Reference: https://github.com/HackerNews/API
const API_BASE_URL = `https://hacker-news.firebaseio.com/v0`

interface Story {
    id: number;
    score: number;
    time: number;
    by: string;
    title: string;
    url: string;
}

// Fetch the top 500 HN stories to seed the db
const fetchTopStoryIds = async () => {
    const resp = await fetch(`${API_BASE_URL}/topstories.json`);
    if (!resp.ok) {
        console.error(`Failed to fetchTopStoryIds - status: ${resp.status}`)
        return
    }
    return await resp.json();
}

const fetchStory = async (id: number | string) => {
    const resp = await fetch(`${API_BASE_URL}/item/${id}.json`);
    if (!resp.ok) {
        console.error(`Failed to fetchStory (${id}) - status: ${resp.status}`)
        return
    }
    return await resp.json();
}

const fetchTopStories = async (limit = 10) => {
    const ids = await fetchTopStoryIds();
    if (!(ids && ids.length)) {
        console.error(`No ids to fetch!`)
        return
    }
    const filtered: [number] = ids.slice(0, limit);
    const stories: Story[] = [];
    for (const batch of batchify(filtered)) {
        stories.push(...(await Promise.all(batch.map(id => fetchStory(id))))
            .filter(v => Boolean(v)) as Story[])
    }
    return stories
}

const seedSubmissions = async (stories: Story[]) => {
    const items = stories.map(({ by: userId, title, url }) => {
        return { userId, title, url }
    })
    for (const batch of batchify(items)) {
        await Promise.all(batch.map(item => createItem(item)))
    }
}

async function main(limit = 10) {
    const start = performance.now();
    const stories = await fetchTopStories(limit);
    console.log(`Fetching ${limit} stories took ${Math.floor(performance.now() - start)} ms`);
    if (!(stories && stories.length)) {
        console.error(`No stories to seed!`)
        return
    }
    const seedStart = performance.now();
    await seedSubmissions(stories);
    console.log(`Submitting ${stories.length} stories took ${Math.floor(performance.now() - seedStart)} ms`);
}

if (import.meta.main) {
    await main(50);
}
