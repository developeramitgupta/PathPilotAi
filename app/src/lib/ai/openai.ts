import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

let openAIClient: OpenAI | undefined;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  openAIClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // Guidance always has a deterministic fallback, so do not make a person
    // wait through provider retries when the AI service is unavailable.
    timeout: 12_000,
    maxRetries: 0,
  });
  return openAIClient;
}

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateStructured<T>({
  schema,
  schemaName,
  system,
  user,
  model = process.env.AI_MODEL_STRONG ?? "gpt-5.6-terra",
}: {
  schema: z.ZodType<T>;
  schemaName: string;
  system: string;
  user: string;
  model?: string;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }

  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: { format: zodTextFormat(schema, schemaName) },
  });

  if (!response.output_parsed) {
    throw new Error(`The ${schemaName} agent returned no structured output.`);
  }

  return response.output_parsed;
}
