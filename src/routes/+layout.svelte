<script lang="ts">
  import { resolve } from '$app/paths';
  import '../header-social.css';
  import '../syntax-highlight.css';
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
    <nav class="social-links" aria-label="Social links">
      <a
        href="https://github.com/YukihiroArakawa"
        rel="noreferrer"
        target="_blank"
        aria-label="GitHub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.52v-1.83c-2.95.64-3.57-1.25-3.57-1.25-.48-1.2-1.16-1.52-1.16-1.52-.95-.65.07-.64.07-.64 1.05.08 1.6 1.07 1.6 1.07.94 1.59 2.46 1.13 3.06.86.1-.67.37-1.13.67-1.39-2.36-.26-4.84-1.17-4.84-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.36.1-2.83 0 0 .89-.28 2.91 1.08a10.2 10.2 0 0 1 5.3 0c2.02-1.36 2.9-1.08 2.9-1.08.58 1.47.22 2.56.11 2.83.68.74 1.08 1.68 1.08 2.83 0 4.04-2.48 4.93-4.85 5.19.38.32.72.95.72 1.92v2.85c0 .29.19.63.73.52A10.5 10.5 0 0 0 12 1.5Z"
          />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/in/yukihiro-arakawa-b99269207/"
        rel="noreferrer"
        target="_blank"
        aria-label="LinkedIn"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5.25 3a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5ZM3.38 8.62h3.75V21H3.38V8.62Zm5.99 0h3.59v1.69H13c.5-.95 1.73-1.94 3.56-1.94 3.8 0 4.5 2.5 4.5 5.74V21H17.3v-5.94c0-1.42-.03-3.24-1.97-3.24-1.98 0-2.28 1.54-2.28 3.14V21H9.37V8.62Z"
          />
        </svg>
      </a>
    </nav>
  </header>

  {@render children()}
</div>
