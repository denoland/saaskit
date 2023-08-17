import { OpenAI } from "https://deno.land/x/openai/mod.ts";
import GPT3Tokenizer from "https://esm.sh/gpt3-tokenizer@1.1.5";
import { codeBlock, oneLine } from "https://esm.sh/common-tags@1.8.2";
import { CreateCompletionRequest } from "https://esm.sh/openai@3.1.0";
import { ApplicationError, UserError } from "../../errors.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import "https://deno.land/std@0.192.0/dotenv/load.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const DB_DATABASE = Deno.env.get('DB_DATABASE')!;
const DB_HOSTNAME = Deno.env.get('DB_HOSTNAME')!;
const DB_PASSWORD = Deno.env.get('DB_PASSWORD')!;
const DB_PORT = Deno.env.get('DB_PORT')!;
const DB_USER = Deno.env.get('DB_USER')!;

const pool = new Pool({
  database: DB_DATABASE,
  hostname: DB_HOSTNAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  user: DB_USER,
}, 3);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export async function handler(req: Request): Promise<Response> {
  try {
    const connection = await pool.connect();

    try {
      if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
      }

      const query = new URL(req.url).searchParams.get("query");

      if (!query) {
        throw new UserError("Missing query in request data");
      }

      if (!OPENAI_API_KEY) {
        throw new UserError("Missing environment variable OPENAI_API_KEY");
      }

      const sanitizedQuery = query.trim();

      const openAI = new OpenAI(OPENAI_API_KEY);

      const embeddingResponse = await openAI.createEmbeddings({
        model: "text-embedding-ada-002",
        input: sanitizedQuery.replaceAll("\n", " "),
      });

      const [{ embedding }] = embeddingResponse.data;
      const matchThreshold = 0.78;
      const matchCount = 10;
      const minContentLength = 50;

      const pageSections = await connection.queryArray(`
        SELECT * FROM match_page_sections($1::numeric[]::vector(1536), $2, $3, $4)
      `, [embedding, matchThreshold, matchCount, minContentLength]);

      const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
      let tokenCount = 0;
      let contextText = "";

      for (let i = 0; i < pageSections.rows.length; i++) {
        const pageSection = pageSections.rows[i];
        const content = pageSection[1];

        if (typeof content === "string") {
          const encoded = tokenizer.encode(content);
          tokenCount += encoded.text.length;

          if (tokenCount >= 1500) {
            break;
          }

          contextText += `${content.trim()}\n---\n`;
        }
      }

      const prompt = codeBlock`
        ${oneLine`
          You are a very enthusiastic FashionUnited representative who loves
          to help people! Given the following sections from the FashionUnited
          documentation, answer the question using only that information,
          outputted in markdown format. If you are unsure and the answer
          is not explicitly written in the documentation, say
          "Sorry, I don't know how to help with that."
        `}

        Context sections:
        ${contextText}

        Question: """
        ${sanitizedQuery}
        """

        Answer as plain text (including related code snippets if available):
      `;

      const completionOptions: CreateCompletionRequest = {
        model: "text-davinci-003",
        prompt,
        max_tokens: 512,
        temperature: 0,
        stream: true,
      };

      const response = await fetch("https://api.openai.com/v1/completions", {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(completionOptions),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error("Failed to generate completion", error);
      }

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
        },
      });

    } finally {
      connection.release();
    }
  } catch (err: unknown) {
    if (err instanceof UserError) {
      return Response.json({
        error: err.message,
        data: err.data,
      }, {
        status: 400,
        headers: corsHeaders,
      });
    } else if (err instanceof ApplicationError) {
      console.error(`${err.message}: ${JSON.stringify(err.data)}`);
    } else {
      console.error(err);
    }

    return Response.json({
      error: "There was an error processing your request",
    }, {
      status: 500,
      headers: corsHeaders,
    });
  }
}
