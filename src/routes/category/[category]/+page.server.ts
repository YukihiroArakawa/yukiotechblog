import { error } from '@sveltejs/kit';
import { listCategories, listPostsByCategory } from '$lib/server/posts';

export async function entries() {
  const categories = await listCategories();

  return categories.map((category) => ({
    category: category.slug
  }));
}

export async function load({ params }) {
  const categories = await listCategories();
  const category = categories.find((item) => item.slug === params.category);

  if (!category) {
    error(404, 'Category not found');
  }

  return {
    category,
    posts: await listPostsByCategory(params.category)
  };
}
