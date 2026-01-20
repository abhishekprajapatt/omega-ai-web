import OpenAI from 'openai';
import Bytez from 'bytez.js';
import Chat from '@/models/Chat';
import connectDB from '@/config/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const MODEL_CONFIG: Record<
  string,
  { baseURL: string; apiKey: string; model: string }
> = {
  deepseek: {
    baseURL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || '',
    apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
    model: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || '',
  },
  openai: {
    baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || '',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || '',
  },
  grok: {
    baseURL: process.env.NEXT_PUBLIC_GROK_BASE_URL || '',
    apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY || '',
    model: process.env.NEXT_PUBLIC_GROK_MODEL || '',
  },
  gemini: {
    baseURL: process.env.NEXT_PUBLIC_GEMINI_BASE_URL || '',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || '',
  },
  claude: {
    baseURL: process.env.NEXT_PUBLIC_CLAUDE_BASE_URL || '',
    apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
    model: process.env.NEXT_PUBLIC_CLAUDE_MODEL || '',
  },
};

const OPENROUTER_CONFIG = {
  baseURL: process.env.OPEN_ROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY || '',
};

const OPENROUTER_MODELS: Record<string, string> = {
  deepseek: 'deepseek/deepseek-chat',
  openai: 'openai/gpt-3.5-turbo',
  grok: 'xai/grok-2',
  gemini: 'google/gemini-2.0-flash',
  claude: 'anthropic/claude-3-haiku',
};

const BYTEZ_CONFIG: Record<string, { apiKey: string; model: string }> = {
  deepseek: {
    apiKey: process.env.NEXT_PUBLIC_BYTEZ_API_KEY || '',
    model: process.env.NEXT_PUBLIC_BYTEZ_DEEPSEEK_MODEL || '',
  },
  openai: {
    apiKey: process.env.NEXT_PUBLIC_BYTEZ_API_KEY || '',
    model: process.env.NEXT_PUBLIC_BYTEZ_OPENAI_MODEL || '',
  },
  grok: {
    apiKey: process.env.NEXT_PUBLIC_BYTEZ_API_KEY || '',
    model: process.env.NEXT_PUBLIC_BYTEZ_GROK_MODEL || '',
  },
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_BYTEZ_API_KEY || '',
    model: process.env.NEXT_PUBLIC_BYTEZ_GEMINI_MODEL || '',
  },
  claude: {
    apiKey: process.env.NEXT_PUBLIC_BYTEZ_API_KEY || '',
    model: process.env.NEXT_PUBLIC_BYTEZ_CLAUDE_MODEL || '',
  },
};

console.log('Available models:', Object.keys(MODEL_CONFIG));

interface ChatRequestBody {
  chatId: string;
  prompt: string;
  images?: string[];
  model?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = getAuth(req);
    const {
      chatId,
      prompt,
      images = [],
      model = 'deepseek',
    }: ChatRequestBody = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const contentMessage =
      images.length > 0
        ? [
            { type: 'text' as const, text: prompt },
            ...images.map((image) => ({
              type: 'image_url' as const,
              image_url: { url: image },
            })),
          ]
        : prompt;

    const modelConfig =
      MODEL_CONFIG[model as keyof typeof MODEL_CONFIG] || MODEL_CONFIG.deepseek;

    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });
    if (!data) {
      return NextResponse.json({
        success: false,
        message: 'Chat not found',
      });
    }

    const userPrompt = {
      role: 'user' as const,
      content:
        images.length > 0
          ? [
              { type: 'text' as const, text: prompt },
              ...images.map((image) => ({
                type: 'image_url' as const,
                image_url: { url: image },
              })),
            ]
          : prompt,
      timestamp: Date.now(),
    };
    data.messages.push(userPrompt);

    let aiMessage: any;

    // Priority 1: Official API keys
    if (modelConfig.apiKey) {
      try {
        console.log(
          `[Priority 1] Using official API: ${model} (${modelConfig.model})`,
        );

        const openai = new OpenAI({
          baseURL: modelConfig.baseURL,
          apiKey: modelConfig.apiKey,
        });

        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: contentMessage }],
          model: modelConfig.model,
          store: true,
        });

        const message = completion.choices[0]?.message;
        if (!message) {
          throw new Error('No response from official API');
        }

        aiMessage = {
          ...message,
          timestamp: Date.now(),
        };

        console.log(`Official API succeeded for ${model}`);
      } catch (officialError: any) {
        console.warn(
          `[Priority 1 Failed] Official API failed for ${model}: ${officialError.message}. Trying OpenRouter...`,
        );

        // Priority 2: OpenRouter (fallback)
        if (OPENROUTER_CONFIG.apiKey) {
          try {
            console.log(`[Priority 2] Using OpenRouter for ${model}`);

            const openrouter = new OpenAI({
              baseURL: OPENROUTER_CONFIG.baseURL,
              apiKey: OPENROUTER_CONFIG.apiKey,
              defaultHeaders: {
                'HTTP-Referer': 'https://omega-ai.vercel.app',
                'X-Title': 'Omega AI',
              },
            });

            const openrouterModel =
              OPENROUTER_MODELS[model] || OPENROUTER_MODELS.deepseek;

            const completion = await openrouter.chat.completions.create({
              messages: [{ role: 'user', content: contentMessage }],
              model: openrouterModel,
            });

            const message = completion.choices[0]?.message;
            if (!message) {
              throw new Error('No response from OpenRouter');
            }

            aiMessage = {
              ...message,
              timestamp: Date.now(),
              isFromOpenRouter: true,
            };

            console.log(`✓ OpenRouter succeeded for ${model}`);
          } catch (openrouterError: any) {
            console.warn(
              `[Priority 2 Failed] OpenRouter failed for ${model}: ${openrouterError.message}. Trying BYTEZ...`,
            );

            // Priority 3: BYTEZ (final fallback)
            try {
              console.log(`[Priority 3] Using BYTEZ for ${model}`);
              const bytezConfig =
                BYTEZ_CONFIG[model as keyof typeof BYTEZ_CONFIG] ||
                BYTEZ_CONFIG.deepseek;
              const sdk = new Bytez(bytezConfig.apiKey);
              const bytezModel = sdk.model(bytezConfig.model);

              const { error, output } = await bytezModel.run(prompt);

              if (error) {
                throw new Error(`Bytez.js error: ${error}`);
              }

              aiMessage = {
                role: 'assistant',
                content: output || 'No response generated',
                timestamp: Date.now(),
                isFromBytez: true,
              };

              console.log(`✓ BYTEZ succeeded for ${model}`);
            } catch (bytezError: any) {
              console.error(
                `[Priority 3 Failed] All APIs failed: ${bytezError.message}`,
              );
              throw new Error(`All APIs failed: ${bytezError.message}`);
            }
          }
        } else {
          // OpenRouter not configured, go directly to BYTEZ
          console.warn(
            `[Priority 2] OpenRouter API key not configured. Using BYTEZ...`,
          );

          try {
            console.log(`[Priority 3] Using BYTEZ for ${model}`);
            const bytezConfig =
              BYTEZ_CONFIG[model as keyof typeof BYTEZ_CONFIG] ||
              BYTEZ_CONFIG.deepseek;
            const sdk = new Bytez(bytezConfig.apiKey);
            const bytezModel = sdk.model(bytezConfig.model);

            const { error, output } = await bytezModel.run(prompt);

            if (error) {
              throw new Error(`Bytez.js error: ${error}`);
            }

            aiMessage = {
              role: 'assistant',
              content: output || 'No response generated',
              timestamp: Date.now(),
              isFromBytez: true,
            };

            console.log(`BYTEZ succeeded for ${model}`);
          } catch (bytezError: any) {
            console.error(
              `[Priority 3 Failed] BYTEZ failed:`,
              bytezError.message,
            );
            throw new Error(
              `Both OpenRouter and BYTEZ failed: ${bytezError.message}`,
            );
          }
        }
      }
    } else {
      // No official API key, try Priority 2: OpenRouter
      if (OPENROUTER_CONFIG.apiKey) {
        try {
          console.log(
            `[Priority 2] No official API key for ${model}. Using OpenRouter...`,
          );

          const openrouter = new OpenAI({
            baseURL: OPENROUTER_CONFIG.baseURL,
            apiKey: OPENROUTER_CONFIG.apiKey,
            defaultHeaders: {
              'HTTP-Referer': 'https://omega-ai.vercel.app',
              'X-Title': 'Omega AI',
            },
          });

          const openrouterModel =
            OPENROUTER_MODELS[model] || OPENROUTER_MODELS.deepseek;

          const completion = await openrouter.chat.completions.create({
            messages: [{ role: 'user', content: contentMessage }],
            model: openrouterModel,
          });

          const message = completion.choices[0]?.message;
          if (!message) {
            throw new Error('No response from OpenRouter');
          }

          aiMessage = {
            ...message,
            timestamp: Date.now(),
            isFromOpenRouter: true,
          };

          console.log(`✓ OpenRouter succeeded for ${model}`);
        } catch (openrouterError: any) {
          console.warn(
            `[Priority 2 Failed] OpenRouter failed for ${model}: ${openrouterError.message}. Trying BYTEZ...`,
          );

          // Priority 3: BYTEZ
          try {
            console.log(`[Priority 3] Using BYTEZ for ${model}`);
            const bytezConfig =
              BYTEZ_CONFIG[model as keyof typeof BYTEZ_CONFIG] ||
              BYTEZ_CONFIG.deepseek;
            const sdk = new Bytez(bytezConfig.apiKey);
            const bytezModel = sdk.model(bytezConfig.model);

            const { error, output } = await bytezModel.run(prompt);

            if (error) {
              throw new Error(`Bytez.js error: ${error}`);
            }

            aiMessage = {
              role: 'assistant',
              content: output || 'No response generated',
              timestamp: Date.now(),
              isFromBytez: true,
            };

            console.log(`✓ BYTEZ succeeded for ${model}`);
          } catch (bytezError: any) {
            console.error(
              `[Priority 3 Failed] All APIs failed: ${bytezError.message}`,
            );
            throw new Error(`All APIs failed: ${bytezError.message}`);
          }
        }
      } else {
        // No OpenRouter key either, use BYTEZ
        console.log(
          `[Priority 3] No official API key or OpenRouter key for ${model}. Using BYTEZ...`,
        );
        try {
          const bytezConfig =
            BYTEZ_CONFIG[model as keyof typeof BYTEZ_CONFIG] ||
            BYTEZ_CONFIG.deepseek;
          const sdk = new Bytez(bytezConfig.apiKey);
          const bytezModel = sdk.model(bytezConfig.model);

          const { error, output } = await bytezModel.run(prompt);

          if (error) {
            throw new Error(`Bytez.js error: ${error}`);
          }

          aiMessage = {
            role: 'assistant',
            content: output || 'No response generated',
            timestamp: Date.now(),
            isFromBytez: true,
          };

          console.log(`✓ BYTEZ succeeded for ${model}`);
        } catch (bytezError: any) {
          console.error(
            `[Priority 3 Failed] BYTEZ failed:`,
            bytezError.message,
          );
          return NextResponse.json({
            success: false,
            error: bytezError.message,
          });
        }
      }
    }

    data.messages.push(aiMessage);
    await data.save();

    return NextResponse.json({ success: true, data: aiMessage });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
