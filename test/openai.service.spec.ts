import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Message } from 'discord.js';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources';
import { RootConfig } from '../src/config/config';
import { OpenaiService } from '../src/openai/openai.service';

type CompletionClient = {
  chat: {
    completions: {
      create: (request: ChatCompletionCreateParamsNonStreaming) => Promise<{
        choices: Array<{ message: { content: string | null } }>;
      }>;
    };
  };
};

function message(content = 'How was my race?') {
  return {
    content,
    author: {
      id: 'discord-42',
      username: 'TestDriver',
      toString: () => 'TestDriver',
    },
  } as unknown as Message;
}

describe('OpenaiService', () => {
  let requests: ChatCompletionCreateParamsNonStreaming[];
  let responseContent: string | null;
  let completionError: Error | undefined;
  let service: OpenaiService;

  beforeEach(() => {
    requests = [];
    responseContent = 'Generated response';
    completionError = undefined;
    service = new OpenaiService({ openai: { apiKey: 'test-api-key' } } as RootConfig);
    const client: CompletionClient = {
      chat: {
        completions: {
          create: async (request) => {
            requests.push(request);
            if (completionError) {
              throw completionError;
            }
            return { choices: [{ message: { content: responseContent } }] };
          },
        },
      },
    };
    (service as unknown as { openAiService: CompletionClient }).openAiService = client;
  });

  describe('initialPrompt', () => {
    it('is chainable and prepends accumulated messages to future requests', async () => {
      const firstBatch: ChatCompletionMessageParam[] = [
        { role: 'system', content: 'Use championship context.' },
        { role: 'assistant', content: 'Context loaded.' },
      ];
      const secondBatch: ChatCompletionMessageParam[] = [{ role: 'user', content: 'Focus on the final lap.' }];

      assert.strictEqual(service.initialPrompt(...firstBatch), service);
      assert.strictEqual(service.initialPrompt(...secondBatch), service);
      await service.insult('Judge this lap', message());

      assert.deepEqual(requests[0].messages.slice(0, 3), [...firstBatch, ...secondBatch]);
    });
  });

  describe('insult', () => {
    it('requests a GPT-4o response with the prompt and author context', async () => {
      const result = await service.insult('Judge this lap', message());

      assert.equal(result, 'Generated response');
      assert.equal(requests[0].model, 'gpt-4o');
      assert.equal(requests[0].messages.at(-1)?.role, 'user');
      assert.equal(requests[0].messages.at(-1)?.content, 'Judge this lap');
      const systemMessage = requests[0].messages.find(({ role }) => role === 'system');
      assert.match(String(systemMessage?.content), /Their discord id is <@TestDriver>/);
    });

    it('propagates completion failures', async () => {
      completionError = new Error('OpenAI unavailable');
      await assert.rejects(service.insult('Judge this lap', message()), /OpenAI unavailable/);
    });
  });

  describe('reply', () => {
    it('requests a stored GPT-4o response with the Discord message and author identifiers', async () => {
      const result = await service.reply(message('Hello bot'));

      assert.equal(result, 'Generated response');
      assert.equal(requests[0].model, 'gpt-4o');
      assert.equal(requests[0].store, true);
      assert.deepEqual(requests[0].messages.at(-1), { role: 'user', content: 'Hello bot' });
      const developerMessage = requests[0].messages.find(({ role }) => role === 'developer');
      assert.match(String(developerMessage?.content), /<@discord-42>/);
      assert.match(String(developerMessage?.content), /<@TestDriver>/);
    });

    it('returns null when the completion has no content', async () => {
      responseContent = null;
      assert.equal(await service.reply(message()), null);
    });

    it('propagates completion failures', async () => {
      completionError = new Error('OpenAI unavailable');
      await assert.rejects(service.reply(message()), /OpenAI unavailable/);
    });
  });
});
