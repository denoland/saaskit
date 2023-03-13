import type { Handlers, PageProps } from "$fresh/server.ts";
import { getTodos, type Todo } from "@/utils/todos.ts";
import { stripe } from "@/utils/stripe.ts";
import Head from "@/components/Head.tsx";
import TodoList from "@/islands/TodoList.tsx";
import Notice from "@/components/Notice.tsx";
import { DashboardState } from "./_middleware.ts";
import Dashboard from "@/components/Dashboard.tsx";
import { createSupabaseClient } from "../../utils/supabase.ts";
import type { User } from "@supabase/supabase-js";

interface Data {
  isPaid: boolean;
  todos: Todo[];
  user: User;
}

export const handler: Handlers<Data, DashboardState> = {
  async GET(request, ctx) {
    const { user } = ctx.state.session;
    const { data: [subscription] } = await stripe.subscriptions.list({
      customer: user.user_metadata.stripe_customer_id,
    });

    return await ctx.render({
      isPaid: subscription?.plan?.amount > 0,
      todos: await getTodos(createSupabaseClient(request.headers)),
      user,
    });
  },
};

export default function TodosPage(props: PageProps<Data>) {
  return (
    <>
      <Head title="Todos" />
      <Dashboard active="/dashboard/todos">
        <div class="mb-4">
          <h1 class="font-bold text-3xl">Welcome back</h1>
          <p class="text-lg">Your email is {props.data.user.email}</p>
        </div>
        {!props.data.isPaid && (
          <Notice
            color="yellow"
            message={
              <span>
                You are on a free subscription. Please{" "}
                <a href="/dashboard/manage-subscription" class="underline">
                  upgrade
                </a>{" "}
                to enable unlimited todos
              </span>
            }
          />
        )}
        <TodoList
          hasPaidPlan={props.data.isPaid}
          todos={props.data.todos}
        />
      </Dashboard>
    </>
  );
}
