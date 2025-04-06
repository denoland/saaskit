import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import {type Brand} from "@/utils/db.ts";

export function BrandHeader(props: { brandId: string }) {
    const brandSig = useSignal<Brand | null>(null);

    useEffect(() => {
        fetch(`/api/brands/${props.brandId}`)
            .then(r => r.json())
            .then(data => brandSig.value = data);
    }, []);

    if (!brandSig.value) return <p>Loading brand...</p>;

    const brand = brandSig.value;
    return (
        <div class="flex gap-4 items-center">
            <img
                src={brand.logoUrl}
                alt={brand.title}
                class="w-16 h-16 object-cover rounded-full"
            />
            <div>
                <h1 class="text-2xl font-bold">{brand.title}</h1>
                <p class="text-gray-600">{brand.bio}</p>
            </div>
        </div>
    );
}