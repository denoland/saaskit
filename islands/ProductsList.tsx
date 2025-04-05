// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import {Signal, useComputed, useSignal} from "@preact/signals";
import {useEffect, useRef} from "preact/hooks";
import {type Product} from "@/utils/db.ts";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import {fetchValues} from "@/utils/http.ts";
import {decodeTime} from "$std/ulid/mod.ts";
import {timeAgo} from "@/utils/display.ts";
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
    <div class="flex flex-col border rounded-2xl p-6 shadow-lg bg-white dark:bg-zinc-900 space-y-6 h-full ">
      <img
        src={props.product.image}
        alt={props.product.title}
        class="w-full h-[400px] object-cover rounded-lg"
      />

      <div className="flex justify-between items-start">
        <div
          className={`flex flex-col items-center gap-1 ${
            isVotedSig.value ? "text-primary" : "hover:text-primary"
          }`}
        >
          {!props.isSignedIn && <a title="Sign in to vote" href="/signin">▲</a>}
          {props.isSignedIn && !isVotedSig.value && (
            <VoteButton
              product={props.product}
              scoreSig={scoreSig}
              isVotedSig={isVotedSig}
            />
          )}
          <p>{scoreSig}</p>
        </div>

        <div className="flex-1 space-y-1">
          <p>
            <a
              className="visited:text-[purple] visited:dark:text-[lightpink] hover:underline mr-4"
              href={props.product.url}
            >
              {props.product.title}
            </a>
            <a
              className="hover:underline text-gray-500 after:content-['_↗']"
              href={props.product.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {new URL(props.product.url).host}
            </a>
          </p>
          <p className="text-gray-500 text-sm">
            <GitHubAvatarImg
              login={props.product.userLogin}
              size={24}
              class="inline-block mr-2"
            />
            <a
              className="hover:underline"
              href={`/users/${props.product.userLogin}`}
            >
              {props.product.userLogin}
            </a>{" "}
            {timeAgo(new Date(decodeTime(props.product.id)))}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface ProductsListProps {
  /** Endpoint URL of the REST API to make the fetch request to */
  endpoint: string;
  /** Whether the user is signed-in */
  isSignedIn: boolean;
  layout: "carousel" | "grid";
}

export default function ProductsList(props: ProductsListProps) {
  const productsSig = useSignal<Product[]>([]);
  const votedProductsIdsSig = useSignal<string[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal<boolean | undefined>(undefined);
  const productsAreVotedSig = useComputed(() =>
    productsSig.value.map((product) =>
      votedProductsIdsSig.value.includes(product.id)
    )
  );

  const carouselRef = useRef<HTMLDivElement>(null);

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

  function scrollCarousel(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.9; // scroll by 90% of container width
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <>
      {productsSig.value.length > 0
        ? (
          props.layout === "carousel"
            ? (
              <div class="relative">
                {/* Buttons */}
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  class="absolute top-1/2 left-4 -translate-y-1/2 z-50
         w-12 h-12 flex items-center justify-center
         text-3xl text-black dark:text-white
         bg-transparent hover:bg-black/10 dark:hover:bg-white/10
         transition"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  class="absolute top-1/2 right-4 -translate-y-1/2 z-50
         w-12 h-12 flex items-center justify-center
         text-3xl text-black dark:text-white
         bg-transparent hover:bg-black/10 dark:hover:bg-white/10
         transition"
                >
                  →
                </button>

                {/* Carousel container */}
                <div
                  ref={carouselRef}
                  class="overflow-x-auto snap-x snap-mandatory flex gap-8 px-8 pb-8 scroll-smooth"
                >
                  {productsSig.value.map((product, id) => (
                    <div
                      key={product.id}
                      class="min-w-[90vw] sm:min-w-[700px] snap-center"
                    >
                      <ProductSummary
                        product={product}
                        isVoted={productsAreVotedSig.value[id]}
                        isSignedIn={props.isSignedIn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-8">
                {productsSig.value.map((product, id) => (
                  <div
                    key={product.id}
                    className="h-full max-h-[400px] min-h-[300px] flex flex-col"
                  >
                    <div className="flex-1 flex flex-col overflow-hidden rounded-xl border shadow bg-white dark:bg-zinc-900">
                      <ProductSummary
                        product={product}
                        isVoted={productsAreVotedSig.value[id]}
                        isSignedIn={props.isSignedIn}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
        )
        : <EmptyProductsList />}
    </>
  );
}
