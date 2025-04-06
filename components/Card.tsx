import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";

export interface CardData {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    linkLabel?: string;
    metaInfo?: string;
}

interface CardProps {
    data: CardData;
    children?: ComponentChildren;
}



export default function Card(props: CardProps) {
    const { title, imageUrl, subtitle, linkUrl, linkLabel } = props.data;

    return (
        <div class="border rounded-2xl p-6 shadow-lg bg-white dark:bg-zinc-900 space-y-6 h-full">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={title}
                    class="w-full h-[400px] object-cover rounded-lg"
                />
            )}
            <h2 class="text-xl font-bold">{title}</h2>
            {subtitle && <p class="text-gray-500">{subtitle}</p>}

            {linkUrl && (
                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary hover:underline"
                >
                    {linkLabel ?? "View"}
                </a>
            )}

            {/* If you have voting or something else, you can add it here or pass it as children */}
            {props.children}
        </div>
    );
}
