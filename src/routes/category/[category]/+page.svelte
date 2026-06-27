<script lang="ts">
  import { resolve } from '$app/paths';

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.category.name} | yukiotechblog</title>
</svelte:head>

<main>
  <section class="page-heading">
    <p class="eyebrow">Category</p>
    <h1>{data.category.name}</h1>
    <p>{data.category.count} articles</p>
  </section>

  <section class="post-list" aria-label={`${data.category.name} articles`}>
    {#each data.posts as post (post.slug)}
      <article class="post-row">
        <a href={resolve(`/${post.slug}`)}>
          <time datetime={post.date}>{post.date}</time>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </a>
      </article>
    {/each}
  </section>
</main>
