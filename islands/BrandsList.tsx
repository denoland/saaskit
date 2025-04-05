// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { Signal, useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { type Brand } from "@/utils/db.ts";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import { fetchValues } from "@/utils/http.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { timeAgo } from "@/utils/display.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

async function fetchVotedBrands() {
    const url = "/api/me/votes";
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
    return await resp.json() as Brand[];
}

function EmptyBrandsList() {
    return (
        <div class="flex flex-col justify-center items-center gap-2 pt-16">
            <IconInfo class="size-10 text-gray-400 dark:text-gray-600" />
            <p>No brands found</p>
            <a href="/submit" class="text-primary hover:underline">
                Submit your project &#8250;
            </a>
        </div>
    );
}

interface VoteButtonProps {
    brand: Brand;
    scoreSig: Signal<number>;
    isVotedSig: Signal<boolean>;
}

function VoteButton(props: VoteButtonProps) {
    async function onClick(event: MouseEvent) {
        if (event.detail !== 1) return;
        const resp = await fetch(`/api/vote?item_id=${props.brand.id}`, {
            method: "POST",
        });
        if (!resp.ok) throw new Error(await resp.text());
        props.scoreSig.value++;
        props.isVotedSig.value = true;
    }

    return (
        <button onClick={onClick} class="hover:text-primary" type="button">
            ▲
        </button>
    );
}

interface BrandSummaryProps {
    brand: Brand;
    /** Whether the brand has been voted-for by the signed-in user */
    isVoted: boolean;
    /** Whether the user is signed-in */
    isSignedIn: boolean;
}

function BrandSummary(props: BrandSummaryProps) {
    const scoreSig = useSignal(props.brand.score);
    const isVotedSig = useSignal(props.isVoted);

    return (
        <div class="py-2 flex gap-4">
            <div
                class={`pr-2 text-center flex flex-col justify-center ${
                    isVotedSig.value ? "text-primary" : "hover:text-primary"
                }`}
            >
                {!props.isSignedIn && (
                    <a
                        title="Sign in to vote"
                        href="/signin"
                    >
                        ▲
                    </a>
                )}
                {props.isSignedIn && !isVotedSig.value && (
                    <VoteButton
                        brand={props.brand}
                        scoreSig={scoreSig}
                        isVotedSig={isVotedSig}
                    />
                )}
                <p>{scoreSig}</p>
            </div>
            <div class="space-y-1">
                <p>
                    <a
                        class="visited:text-[purple] visited:dark:text-[lightpink] hover:underline mr-4"
                        href={props.brand.url}
                    >
                        {props.brand.title}
                    </a>
                    <a
                        class="hover:underline text-gray-500 after:content-['_↗']"
                        href={props.brand.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {new URL(props.brand.url).host}
                    </a>
                </p>
                <p class="text-gray-500">
                    <GitHubAvatarImg
                        login={props.brand.userLogin}
                        size={24}
                        class="mr-2"
                    />
                    <a class="hover:underline" href={`/users/${props.brand.userLogin}`}>
                        {props.brand.userLogin}
                    </a>{" "}
                    {timeAgo(new Date(decodeTime(props.brand.id)))}
                </p>
            </div>
        </div>
    );
}

export interface BrandsListProps {
    /** Endpoint URL of the REST API to make the fetch request to */
    endpoint: string;
    /** Whether the user is signed-in */
    isSignedIn: boolean;
}

export default function BrandsList(props: BrandsListProps) {
    const brandsSig = useSignal<Brand[]>([]);
    const votedBrandsIdsSig = useSignal<string[]>([]);
    const cursorSig = useSignal("");
    const isLoadingSig = useSignal<boolean | undefined>(undefined);
    const brandsAreVotedSig = useComputed(() =>
        brandsSig.value.map((brand) => votedBrandsIdsSig.value.includes(brand.id))
    );

    async function loadMoreBrands() {
        if (isLoadingSig.value) return;
        isLoadingSig.value = true;
        try {
            const { values, cursor } = await fetchValues<Brand>(
                props.endpoint,
                cursorSig.value,
            );
            brandsSig.value = [...brandsSig.value, ...values];
            cursorSig.value = cursor;
        } catch (error) {
            console.error((error as Error).message);
        } finally {
            isLoadingSig.value = false;
        }
    }

    useEffect(() => {
        if (!props.isSignedIn) {
            loadMoreBrands();
            return;
        }

        fetchVotedBrands()
            .then((votedBrands) =>
                votedBrandsIdsSig.value = votedBrands.map(({ id }) => id)
            )
            .finally(() => loadMoreBrands());
    }, []);

    if (isLoadingSig.value === undefined) {
        return <p class="link-styles">Loading...</p>;
    }

    return (
        <div>
            {brandsSig.value.length
                ? brandsSig.value.map((brand, id) => {
                    return (
                        <BrandSummary
                            key={brand.id}
                            brand={brand}
                            isVoted={brandsAreVotedSig.value[id]}
                            isSignedIn={props.isSignedIn}
                        />
                    );
                })
                : <EmptyBrandsList />}
            {cursorSig.value !== "" && (
                <button onClick={loadMoreBrands} class="link-styles" type="button">
                    {isLoadingSig.value ? "Loading..." : "Load more"}
                </button>
            )}
        </div>
    );
}
