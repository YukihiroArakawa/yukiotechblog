<script lang="ts">
  let { data } = $props();
</script>

<main class="home">
  <section class="intro">
    <p class="eyebrow">Migration preview</p>
    <h1>WordPress posts in a minimal SvelteKit site.</h1>
    <p>
      代表記事を使って、長文、コードブロック、短文、長い日本語タイトルの表示を確認します。
    </p>
  </section>

  <section class="post-list" aria-label="Representative articles">
    {#each data.posts as post}
      <article class="post-row">
        <a href={`/blog/${post.slug}`}>
          <time datetime={post.date}>{post.date}</time>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </a>
      </article>
    {/each}
  </section>
</main>
