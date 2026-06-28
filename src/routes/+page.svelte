<script lang="ts">
  import { resolve } from '$app/paths';

  let { data } = $props();
</script>

<main class="home">
  <section class="intro">
    <p class="eyebrow">Engineering notes</p>
    <h1>yukiotechblog</h1>
    <p>Notes on databases, distributed systems, developer tooling, and engineering experiments.</p>
  </section>

  <section class="category-links" aria-label="Categories">
    {#each data.categories as category (category.slug)}
      <a href={resolve(`/category/${category.slug}`)}>{category.name}</a>
    {/each}
  </section>

  <section class="post-list" aria-label="All articles">
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
