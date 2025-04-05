// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { Signal, useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { type Product } from "@/utils/db.ts";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import { fetchValues } from "@/utils/http.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { timeAgo } from "@/utils/display.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

async function fetchVotedProducts() {
  const url = "/api/me/votes";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as Product[];
}

function EmptyProductsList() {
  return (
    <div class="flex flex-col justify-center items-center gap-2 pt-16">
      <IconInfo class="size-10 text-gray-400 dark:text-gray-600" />
      <p>No products found</p>
      <a href="/submit" class="text-primary hover:underline">
        Submit your project &#8250;
      </a>
    </div>
  );
}

interface VoteButtonProps {
  product: Product;
  scoreSig: Signal<number>;
  isVotedSig: Signal<boolean>;
}

function VoteButton(props: VoteButtonProps) {
  async function onClick(event: MouseEvent) {
    if (event.detail !== 1) return;
    const resp = await fetch(`/api/vote?item_id=${props.product.id}`, {
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

interface ProductSummaryProps {
  product: Product;
  /** Whether the product has been voted-for by the signed-in user */
  isVoted: boolean;
  /** Whether the user is signed-in */
  isSignedIn: boolean;
}

function ProductSummary(props: ProductSummaryProps) {
  const scoreSig = useSignal(props.product.score);
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
            product={props.product}
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
            href={props.product.url}
          >
            {props.product.title}
          </a>
          <a
            class="hover:underline text-gray-500 after:content-['_↗']"
            href={props.product.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {new URL(props.product.url).host}
          </a>
        </p>
        <p class="text-gray-500">
          <GitHubAvatarImg
            login={props.product.userLogin}
            size={24}
            class="mr-2"
          />
          <a class="hover:underline" href={`/users/${props.product.userLogin}`}>
            {props.product.userLogin}
          </a>{" "}
          {timeAgo(new Date(decodeTime(props.product.id)))}
        </p>
      </div>
    </div>
  );
}

export interface ProductsListProps {
  /** Endpoint URL of the REST API to make the fetch request to */
  endpoint: string;
  /** Whether the user is signed-in */
  isSignedIn: boolean;
}

export default function ProductsList(props: ProductsListProps) {
  const productsSig = useSignal<Product[]>([]);
  const votedProductsIdsSig = useSignal<string[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal<boolean | undefined>(undefined);
  const productsAreVotedSig = useComputed(() =>
      productsSig.value.map((product) => votedProductsIdsSig.value.includes(product.id))
  );

  async function loadMoreProducts() {
    if (isLoadingSig.value) return;
    isLoadingSig.value = true;
    try {
      const { values, cursor } = await fetchValues<Product>(
        props.endpoint,
        cursorSig.value,
      );
      productsSig.value = [...productsSig.value, ...values];
      cursorSig.value = cursor;
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      isLoadingSig.value = false;
    }
  }

  useEffect(() => {
    if (!props.isSignedIn) {
      loadMoreProducts();
      return;
    }

    fetchVotedProducts()
      .then((votedProducts) =>
        votedProductsIdsSig.value = votedProducts.map(({ id }) => id)
      )
      .finally(() => loadMoreProducts());
  }, []);

  if (isLoadingSig.value === undefined) {
    return <p class="link-styles">Loading...</p>;
  }

  return (
    <div>
      {productsSig.value.length
        ? productsSig.value.map((product, id) => {
          return (
            <ProductSummary
              key={product.id}
              product={product}
              isVoted={productsAreVotedSig.value[id]}
              isSignedIn={props.isSignedIn}
            />
          );
        })
        : <EmptyProductsList />}
      {cursorSig.value !== "" && (
        <button onClick={loadMoreProducts} class="link-styles" type="button">
          {isLoadingSig.value ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
