<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Post } from '$lib/server/posts';

  let { post } = $props<{ post: Post }>();
</script>

<svelte:head>
  <title>{post.title} | yukiotechblog</title>
</svelte:head>

<article class="article">
  <header>
    <a class="back-link" href={resolve('/')}>Home</a>
    <time datetime={post.date}>{post.date}</time>
    <h1>{post.title}</h1>
    {#if post.categories.length}
      <div class="tags" aria-label="Categories">
        {#each post.categories as category (category)}
          <a href={resolve(`/category/${encodeURIComponent(category)}`)}>{category}</a>
        {/each}
      </div>
    {/if}
  </header>

  <div class="prose">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered from repository-owned markdown -->
    {@html post.html}
  </div>
</article>
