<script lang="ts">
	export default {};
</script>

<script lang="ts" setup>
	import { computed } from "vue";
	import { getHomeHtml } from "../../services/i18n";

	const homeHtml = computed(() => getHomeHtml());
</script>

<template>
	<div class="bb-home">
		<div v-html="homeHtml"></div>
	</div>
</template>

<style lang="scss">
	.bb-home {
		padding: 1em;
		overflow-y: auto;
	}
</style>
