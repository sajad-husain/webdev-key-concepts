import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { getPosts } from '@/services/api';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

describe('api client', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches and parses posts on a 200 response', async () => {
    const posts = [
      { id: 1, title: 'first', body: 'hello' },
      { id: 2, title: 'second', body: 'world' },
    ];
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => posts,
    })) as unknown as typeof fetch;

    await expect(getPosts(2)).resolves.toEqual(posts);
    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/posts?_limit=2`, undefined);
  });

  it('throws when the response is not ok', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    await expect(getPosts()).rejects.toThrow('status 500');
  });
});