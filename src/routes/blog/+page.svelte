<script lang="ts">
  import { resolve } from '$app/paths';

  let { data } = $props();
</script>

<svelte:head>
  <title>Articles | yukiotechblog</title>
</svelte:head>

<main>
  <section class="page-heading">
    <p class="eyebrow">All posts</p>
    <h1>Articles</h1>
  </section>

  <section class="post-list" aria-label="All articles">
    {#each data.posts as post (post.slug)}
      <article class="post-row">
        <a href={resolve(`/blog/${post.slug}`)}>
          <time datetime={post.date}>{post.date}</time>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </a>
      </article>
    {/each}
  </section>
</main>
