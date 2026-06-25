import { listRepresentativePosts } from '$lib/server/posts';

export async function load() {
  return {
    posts: await listRepresentativePosts()
  };
}
