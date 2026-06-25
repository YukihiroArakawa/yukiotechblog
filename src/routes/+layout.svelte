<script lang="ts">
  import { resolve } from '$app/paths';
  import '../styles.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>yukiotechblog</title>
  <meta
    name="description"
    content="WordPressから移行中の技術ブログのローカルサンプルサイト"
  />
</svelte:head>

<div class="shell">
  <header class="site-header">
    <a class="brand" href={resolve('/')}>yukiotechblog</a>
    <nav aria-label="Primary navigation">
      <a href={resolve('/blog')}>Articles</a>
      <a href="https://yukiotechblog.com/">Current site</a>
    </nav>
  </header>

  {@render children()}
</div>
