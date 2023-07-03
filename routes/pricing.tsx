// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import { BUTTON_STYLES } from "@/utils/constants.ts";
import {
  formatAmountForDisplay,
  isProductWithPrice,
  stripe,
  StripProductWithPrice,
} from "@/utils/payments.ts";
import Stripe from "stripe";
import { ComponentChild } from "preact";
import { getUserBySession, type User } from "@/utils/db.ts";

interface PricingPageData extends State {
  products: Stripe.Product[];
  user: User | null;
}

function comparePrices(
  productA: StripProductWithPrice,
  productB: StripProductWithPrice,
) {
  return (productA.default_price.unit_amount || 0) -
    (productB.default_price.unit_amount || 0);
}

export const handler: Handlers<PricingPageData, State> = {
  async GET(_req, ctx) {
    if (stripe === undefined) return ctx.renderNotFound();

    const { data } = await stripe.products.list({
      expand: ["data.default_price"],
      active: true,
    });

    const productsWithPrice = data.filter(isProductWithPrice);

    if (productsWithPrice.length !== data.length) {
      throw new Error(
        "Not all products have a default price. Please run the `deno task init:stripe` as the README instructs.",
      );
    }

    ctx.state.title = "Pricing";

    const products = productsWithPrice.sort(comparePrices);

    const user = ctx.state.sessionId
      ? await getUserBySession(ctx.state.sessionId)
      : null;

    return ctx.render({ ...ctx.state, products, user });
  },
};

interface PricingCardProps {
  name: string;
  description: string;
  pricePerInterval: string;
  children: ComponentChild;
}

function PricingCard(props: PricingCardProps) {
  return (
    <div class="flex-1 space-y-4 p-4 ring-1 ring-gray-300 rounded-xl text-center dark:bg-gray-700">
      <div>
        <h3 class="text-2xl font-bold">
          {props.name}
        </h3>
        <p>{props.description}</p>
      </div>
      <p class="text-xl">
        {props.pricePerInterval}
      </p>
      {props.children}
    </div>
  );
}

function toPricePerInterval(defaultPrice: Stripe.Price) {
  const amount = formatAmountForDisplay(
    defaultPrice?.unit_amount ?? 0,
    defaultPrice?.currency ?? "usd",
  );
  return `${amount} / ${defaultPrice.recurring?.interval}`;
}

export default function PricingPage(props: PageProps<PricingPageData>) {
  /** @todo Maybe just retrieve a single product within the handler. Documentation may have to be adjusted. */
  const [product] = props.data.products;

  return (
    <main
      class={`mx-auto max-w-4xl w-full flex-1 flex flex-col justify-center px-8`}
    >
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold">Pricing</h1>
        <p class="text-lg">Choose the plan that suites you</p>
      </div>
      <div class="flex flex-col md:flex-row gap-4">
        <PricingCard
          name="Free tier"
          description="Share, comment on and vote for your favorite posts"
          pricePerInterval="Free"
        >
          <a
            href="/account/manage"
            class={`${BUTTON_STYLES} w-full rounded-md block`}
          >
            Manage
          </a>
        </PricingCard>
        <PricingCard
          name={product.name}
          description={product.description!}
          pricePerInterval={toPricePerInterval(
            product.default_price as Stripe.Price,
          )}
        >
          {props.data.user?.isSubscribed
            ? (
              <a
                class={`${BUTTON_STYLES} w-full rounded-md block`}
                href="/account/manage"
              >
                Manage
              </a>
            )
            : (
              <a
                class={`${BUTTON_STYLES} w-full rounded-md block`}
                href="/account/upgrade"
              >
                Upgrade
              </a>
            )}
        </PricingCard>
      </div>
    </main>
  );
}
