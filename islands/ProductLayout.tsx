// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import {Signal, useComputed, useSignal} from "@preact/signals";
import {useEffect, useRef} from "preact/hooks";
import {type Product} from "@/utils/db.ts";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import {fetchValues} from "@/utils/http.ts";
import {decodeTime} from "$std/ulid/mod.ts";
import {timeAgo} from "@/utils/display.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import {productToCardData} from "@/utils/mappers.ts";
import Card from "../components/Card.tsx";

async function fetchVotedProducts() {
  const url = "/api/me/votes";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as Product[];
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

export interface ProductsLayoutProps {
  brandId?: string;
  endpoint: string;
  /** Whether the user is signed-in */
  type: "carousel" | "grid";
}

export default function ProductLayout(props: ProductsLayoutProps) {
  const productsSig = useSignal<Product[]>([]);
  const votedProductsIdsSig = useSignal<string[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal<boolean | undefined>(undefined);

  const productsAreVotedSig = useComputed(() =>
    productsSig.value.map((p) => votedProductsIdsSig.value.includes(p.id))
  );

  const carouselRef = useRef<HTMLDivElement>(null);

  const endpoint = props.brandId
      ? `/api/brands/${props.brandId}/products`
      : (props.endpoint ?? "/api/products");

  async function loadMoreProducts() {
    if (isLoadingSig.value) return;
    isLoadingSig.value = true;
    try {
      const { values, cursor } = await fetchValues<Product>(
          endpoint,
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
    // load user votes
    fetchVotedProducts()
      .then((voted) => {
        votedProductsIdsSig.value = voted.map((v) => v.id);
      })
      .finally(() => loadMoreProducts());
  }, []);

  if (isLoadingSig.value === undefined) {
    return <p class="link-styles">Loading...</p>;
  }

  function scrollCarousel(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.9;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  if (productsSig.value.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 pt-16">
        <IconInfo class="size-10 text-gray-400 dark:text-gray-600" />
        <p>No products found</p>
        <a href="/submit" className="text-primary hover:underline">
          Submit your project &#8250;
        </a>
      </div>
    );
  }

  // RENDER
  return props.type === "carousel"
    ? (
      <div class="relative">
        <button
          type="button"
          onClick={() => scrollCarousel("left")}
          className="absolute top-1/2 left-4 -translate-y-1/2 z-50
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
          className="absolute top-1/2 right-4 -translate-y-1/2 z-50
         w-12 h-12 flex items-center justify-center
         text-3xl text-black dark:text-white
         bg-transparent hover:bg-black/10 dark:hover:bg-white/10
         transition"
        >
          →
        </button>
        <div
          ref={carouselRef}
          class="overflow-x-auto snap-x snap-mandatory flex gap-8 px-8 pb-8 scroll-smooth"
        >
          {productsSig.value.map((product, idx) => {
            const scoreSig = useSignal(product.score);
            const isVotedSig = useSignal(productsAreVotedSig.value[idx]);

            const cardData = productToCardData(product);

            return (
              <div
                key={product.id}
                class="min-w-[90vw] sm:min-w-[700px] snap-center"
              >
                <Card data={cardData}>
                  {/* Insert your upvote UI or custom logic as children */}
                  <div class="flex items-center space-x-2 text-sm">
                    <p>{scoreSig}</p>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    )
    : (
      /* GRID MODE */
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-8">
        {productsSig.value.map((product, idx) => {
          const scoreSig = useSignal(product.score);
          const isVotedSig = useSignal(productsAreVotedSig.value[idx]);

          const cardData = productToCardData(product);

          return (
            <div
              key={product.id}
              class="h-full max-h-[400px] min-h-[300px] flex flex-col"
            >
              <Card data={cardData}>
                <div class="flex items-center space-x-2 text-sm">
                  <p>{scoreSig}</p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    );
}
