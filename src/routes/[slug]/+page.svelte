<script lang="ts">
  import ArticlePage from '$lib/components/ArticlePage.svelte';

  let { data } = $props();
  let post = $derived(data.post);
</script>

<ArticlePage {post} />
