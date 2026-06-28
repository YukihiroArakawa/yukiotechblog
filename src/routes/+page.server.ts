import { listCategories, listPosts } from '$lib/server/posts';

export async function load() {
  return {
    categories: await listCategories(),
    posts: await listPosts()
  };
}
