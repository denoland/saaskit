import { createDefine } from "fresh";
import type { State } from "@/middlewares/session.ts";

export const define = createDefine<State>();
