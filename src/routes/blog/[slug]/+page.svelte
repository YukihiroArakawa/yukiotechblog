<script lang="ts">
  import { resolve } from '$app/paths';

  let { data } = $props();
  let post = $derived(data.post);
</script>

<svelte:head>
  <title>{post.title} | yukiotechblog</title>
</svelte:head>

<article class="article">
  <header>
    <a class="back-link" href={resolve('/blog')}>Articles</a>
    <time datetime={post.date}>{post.date}</time>
    <h1>{post.title}</h1>
    {#if post.categories.length}
      <div class="tags" aria-label="Categories">
        {#each post.categories as category (category)}
          <span>{category}</span>
        {/each}
      </div>
    {/if}
  </header>

  <div class="prose">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered from repository-owned markdown -->
    {@html post.html}
  </div>
</article>
