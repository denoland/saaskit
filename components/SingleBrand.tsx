import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Brand, Product } from "@/utils/db.ts";
import { brandToCardData, productToCardData } from "@/utils/mappers.ts";
import { decodeTime } from "$std/ulid/mod.ts";
import { timeAgo } from "@/utils/display.ts";
import Card from "@/components/Card.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

interface SingleBrandProps {
    brand: Brand;
    isSignedIn: boolean;
}

export default function SingleBrand(props: SingleBrandProps) {
    const scoreSig = useSignal(props.brand.score);
    const isVotedSig = useSignal(false);
    const cardData = brandToCardData(props.brand);

    const productsSig = useSignal<Product[]>([]);

    useEffect(() => {
        fetch(`/api/brands/${props.brand.id}/products`)
            .then((res) => res.json())
            .then((data: Product[]) => {
                productsSig.value = data;
            });
    }, [props.brand.id]);

    return (
        <main class="px-6 py-12 max-w-7xl mx-auto space-y-12">
            {/* Brand Card */}
            <Card data={cardData}>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <GitHubAvatarImg
                            login={props.brand.userLogin}
                            size={24}
                            class="inline-block rounded-full"
                        />
                        <a
                            class="hover:underline"
                            href={`/users/${props.brand.userLogin}`}
                        >
                            {props.brand.userLogin}
                        </a>
                        • {timeAgo(new Date(decodeTime(props.brand.id)))}
                    </div>

                    <div class="flex items-center space-x-2 text-sm text-primary">
                        {props.isSignedIn && !isVotedSig.value && (
                            <button
                                class="hover:text-primary"
                                type="button"
                                onClick={async () => {
                                    const res = await fetch(
                                        `/api/vote?item_id=${props.brand.id}`,
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

            {/* Products grid */}
            <section>
                <h2 class="text-xl font-semibold mb-4">Produtos da marca</h2>
                {productsSig.value.length === 0
                    ? <p class="text-gray-500">Nenhum produto cadastrado ainda.</p>
                    : (
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productsSig.value.map((product) => {
                                const productCard = productToCardData(product);
                                return (
                                    <div
                                        key={product.id}
                                        class="h-full max-h-[400px] min-h-[300px] flex flex-col"
                                    >
                                        <Card data={productCard} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </section>
        </main>
    );
}
