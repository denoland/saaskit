// components/SingleProduct.tsx
import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Product } from "@/utils/db.ts";
import { productToCardData } from "@/utils/mappers.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { timeAgo } from "@/utils/display.ts";
import Card from "@/components/Card.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

interface SingleProductProps {
    productId: string;
    isSignedIn: boolean;
}

export default function SingleProduct(props: SingleProductProps) {
    const productSig = useSignal<Product | null>(null);
    const scoreSig = useSignal(0);
    const isVotedSig = useSignal(false);

    useEffect(() => {
        async function loadProduct() {
            const res = await fetch(`/api/products/${props.productId}`);
            if (!res.ok) {
                console.error("Failed to load product");
                return;
            }
            const data = await res.json();
            productSig.value = data;
            scoreSig.value = data.score ?? 0;

            // optionally: check if it's voted
            const voted = await fetch("/api/me/votes").then((r) => r.json());
            isVotedSig.value = voted.some((p: Product) => p.id === props.productId);
        }

        loadProduct();
    }, [props.productId]);

    if (!productSig.value) {
        return <p class="text-center p-8">Loading product...</p>;
    }

    const cardData = productToCardData(productSig.value);

    return (
        <section class="px-6 py-12 max-w-3xl mx-auto">
            <Card data={cardData}>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <GitHubAvatarImg
                            login={productSig.value.userLogin}
                            size={24}
                            class="inline-block rounded-full"
                        />
                        <a
                            class="hover:underline"
                            href={`/users/${productSig.value.userLogin}`}
                        >
                            {productSig.value.userLogin}
                        </a>
                        • {timeAgo(new Date(decodeTime(productSig.value.id)))}
                    </div>

                    <div class="flex items-center space-x-2 text-sm text-primary">
                        {props.isSignedIn && !isVotedSig.value && (
                            <button
                                class="hover:text-primary"
                                type="button"
                                onClick={async () => {
                                    const res = await fetch(`/api/vote?item_id=${productSig.value?.id}`, { method: "POST" });
                                    if (res.ok) {
                                        scoreSig.value++;
                                        isVotedSig.value = true;
                                    }
                                }}
                            >
                                ▲
                            </button>
                        )}
                        <p>{scoreSig}</p>
                    </div>
                </div>
            </Card>
        </section>
    );
}
