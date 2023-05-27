import {Item} from "./db.ts";

export default function compareScore(a: Item, b: Item) {
    const x = Number(a.score);
    const y = Number(b.score);
    if (x > y) {
        return -1;
    }
    if (x < y) {
        return 1;
    }
    return 0;
}