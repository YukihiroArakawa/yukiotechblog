<script lang="ts">
  import { resolve } from '$app/paths';
  import '../styles.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>yukiotechblog</title>
  <meta
    name="description"
    content="Notes on databases, distributed systems, developer tooling, and engineering experiments."
  />
</svelte:head>

<div class="shell">
  <header class="site-header">
    <a class="brand" href={resolve('/')}>yukiotechblog</a>
    <nav aria-label="Primary navigation">
      <a href={resolve('/blog')}>Articles</a>
    </nav>
  </header>

  {@render children()}
</div>
