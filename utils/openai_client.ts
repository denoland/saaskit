// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * OpenAI Client for Music API
 * Provides access to GPT models for music analysis, recommendations, and generation
 */

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_BASE_URL = "https://api.openai.com/v1";

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIClient {
  private apiKey: string;
  private model: string;
  private embeddingModel: string;

  constructor(
    model = "gpt-4",
    embeddingModel = "text-embedding-ada-002",
  ) {
    this.apiKey = OPENAI_API_KEY;
    this.model = model;
    this.embeddingModel = embeddingModel;

    // Note: OpenAI is not available in free deployment
  }

  async chat(messages: OpenAIMessage[], options: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}): Promise<OpenAIResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    return await response.json();
  }

  async createEmbeddings(texts: string[]): Promise<EmbeddingResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    const response = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    return await response.json();
  }

  async generateMusicDescription(track: {
    title: string;
    artist: string;
    genre?: string;
  }): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content:
          "You are a music expert. Provide detailed, engaging descriptions of songs based on their title, artist, and genre.",
      },
      {
        role: "user",
        content: `Describe the song "${track.title}" by ${track.artist}${
          track.genre ? ` in the ${track.genre} genre` : ""
        }. Include musical elements, mood, and why it might appeal to listeners.`,
      },
    ];

    const response = await this.chat(messages, { max_tokens: 300 });
    return response.choices[0]?.message?.content || "Description not available";
  }

  async generatePlaylistRecommendations(
    seedTracks: string[],
    count = 5,
  ): Promise<string[]> {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content:
          "You are a music recommendation expert. Suggest songs that would fit well in a playlist based on seed tracks.",
      },
      {
        role: "user",
        content: `Based on these tracks: ${
          seedTracks.join(", ")
        }, suggest ${count} additional songs that would complement this playlist. Return only the song titles and artists, one per line.`,
      },
    ];

    const response = await this.chat(messages, { max_tokens: 200 });
    const content = response.choices[0]?.message?.content || "";
    return content.split("\n").filter((line) => line.trim()).slice(0, count);
  }

  async analyzeMusicTrends(data: string): Promise<string> {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content:
          "You are a music industry analyst. Analyze music data and identify trends, patterns, and insights.",
      },
      {
        role: "user",
        content: `Analyze this music data and identify key trends: ${data}`,
      },
    ];

    const response = await this.chat(messages, { max_tokens: 500 });
    return response.choices[0]?.message?.content || "Analysis not available";
  }
}

// Export singleton instance
export const openaiClient = new OpenAIClient();
