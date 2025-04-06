import { Signal, useComputed, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";
import { fetchValues } from "@/utils/http.ts";
import Card from "@/components/Card.tsx";
import { brandToCardData } from "@/utils/mappers.ts";
import type { Brand } from "@/utils/db.ts";

// Just a small empty state placeholder:
function EmptyBrandsList() {
    return (
        <div class="flex flex-col justify-center items-center gap-2 pt-16">
            <IconInfo class="size-10 text-gray-400 dark:text-gray-600" />
            <p>No brands found</p>
            <a href="/submit-brand" class="text-primary hover:underline">
                Add your brand &#8250;
            </a>
        </div>
    );
}

export interface BrandLayoutProps {
    endpoint: string;
    layout: "carousel" | "grid";
}

export default function BrandLayout(props: BrandLayoutProps) {
    const brandsSig = useSignal<Brand[]>([]);
    const cursorSig = useSignal("");
    const isLoadingSig = useSignal<boolean | undefined>(undefined);

    const carouselRef = useRef<HTMLDivElement>(null);

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
        loadMoreBrands();
    }, []);

    if (isLoadingSig.value === undefined) {
        return <p class="link-styles">Loading...</p>;
    }

    if (brandsSig.value.length === 0) {
        return <EmptyBrandsList />;
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

    // RENDER
    return props.layout === "carousel"
        ? (
            <div class="relative">
                {/* Left/Right scroll buttons */}
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

                {/* The carousel container */}
                <div
                    ref={carouselRef}
                    class="overflow-x-auto snap-x snap-mandatory flex gap-8 px-8 pb-8 scroll-smooth"
                >
                    {brandsSig.value.map((brand) => {
                        const cardData = brandToCardData(brand);
                        return (
                            <div
                                key={brand.id}
                                class="min-w-[90vw] sm:min-w-[700px] snap-center"
                            >
                                <Card data={cardData} />
                            </div>
                        );
                    })}
                </div>
            </div>
        )
        : (
            /* GRID MODE */
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-8">
                {brandsSig.value.map((brand) => {
                    const cardData = brandToCardData(brand);

                    return (
                        <div key={brand.id} class="h-full max-h-[400px] min-h-[300px] flex flex-col">
                            <Card data={cardData} />
                        </div>
                    );
                })}
            </div>
        );
}
