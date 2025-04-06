import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Product } from "@/utils/db.ts";
import { productToCardData } from "@/utils/mappers.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { timeAgo } from "@/utils/display.ts";
import Card from "@/components/Card.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

interface SingleProductProps {
    product: Product;
    isSignedIn: boolean;
}

export default function SingleProduct(props: SingleProductProps) {
    const scoreSig = useSignal(props.product.score);
    const isVotedSig = useSignal(false);
    const cardData = productToCardData(props.product);

    return (
        <section class="px-6 py-12 max-w-3xl mx-auto">
            <Card data={cardData}>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <GitHubAvatarImg
                            login={props.product.userLogin}
                            size={24}
                            class="inline-block rounded-full"
                        />
                        <a
                            class="hover:underline"
                            href={`/users/${props.product.userLogin}`}
                        >
                            {props.product.userLogin}
                        </a>
                        • {timeAgo(new Date(decodeTime(props.product.id)))}
                    </div>

                    <div class="flex items-center space-x-2 text-sm text-primary">
                        {props.isSignedIn && !isVotedSig.value && (
                            <button
                                class="hover:text-primary"
                                type="button"
                                onClick={async () => {
                                    const res = await fetch(
                                        `/api/vote?item_id=${props.product.id}`,
                                        { method: "POST" },
                                    );
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
