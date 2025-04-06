// mappers.ts

import {type Brand } from "@/utils/db.ts";
import {type Product} from "@/utils/db.ts";
import type { CardData } from "@/components/Card.tsx";

export function brandToCardData(brand: Brand): CardData {
    return {
        title: brand.title,
        subtitle: brand.bio,
        imageUrl: brand.logoUrl,
        linkUrl: `/marcas/${brand.id}`, // internal route to single product
        linkLabel: "Ver Marca",
        metaInfo: `Brand ID: ${brand.id}`,
    };
}

export function productToCardData(product: Product): CardData {
    return {
        title: product.title,
        imageUrl: product.image,
        subtitle: `Score: ${product.score}`,
        linkUrl: `/produtos/${product.id}`, // internal route to single product
        linkLabel: "Ver Produto",
    };
}
