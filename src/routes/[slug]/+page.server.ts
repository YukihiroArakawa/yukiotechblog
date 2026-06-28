import { error } from '@sveltejs/kit';
import { listPosts, readPost } from '$lib/server/posts';

export async function entries() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function load({ params }) {
  try {
    return {
      post: await readPost(params.slug)
    };
  } catch {
    error(404, 'Post not found');
  }
}
