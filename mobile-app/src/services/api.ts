const BASE_URL = 'https://jsonplaceholder.typicode.com';

export type Post = {
  id: number;
  title: string;
  body: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getPosts(limit = 3): Promise<Post[]> {
  return request<Post[]>(`/posts?_limit=${limit}`);
}