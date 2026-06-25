<script lang="ts">
  let { data } = $props();
  let post = $derived(data.post);
</script>

<svelte:head>
  <title>{post.title} | yukiotechblog</title>
</svelte:head>

<article class="article">
  <header>
    <a class="back-link" href="/blog">Articles</a>
    <time datetime={post.date}>{post.date}</time>
    <h1>{post.title}</h1>
    {#if post.categories.length}
      <div class="tags" aria-label="Categories">
        {#each post.categories as category}
          <span>{category}</span>
        {/each}
      </div>
    {/if}
  </header>

  <div class="prose">
    {@html post.html}
  </div>
</article>
