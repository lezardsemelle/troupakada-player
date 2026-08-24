<script lang="ts" setup>
	import { getSignImageUrl, standardSigns } from "../../maestrationSigns";
	import { useI18n } from "../../services/i18n";

	const i18n = useI18n();
</script>

<template>
	<div class="bb-gestes-glossary">
		<h2>{{i18n.t("gestes-glossary.title")}}</h2>
		<p class="text-body-secondary">{{i18n.t("gestes-glossary.description")}}</p>

		<div class="bb-gestes-glossary-grid">
			<div class="bb-gestes-glossary-item" v-for="sign in standardSigns" :key="sign.id">
				<img :src="getSignImageUrl(sign.id)" :alt="sign.label" />
				<div class="bb-gestes-glossary-label">{{sign.label}}</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-gestes-glossary {
		padding: 1em;
		overflow-y: auto;

		.bb-gestes-glossary-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
			gap: 1em;
			margin-top: 1em;
		}

		.bb-gestes-glossary-item {
			text-align: center;

			img {
				width: 100%;
				aspect-ratio: 1;
				object-fit: cover;
				border-radius: 0.375rem;
			}
		}

		.bb-gestes-glossary-label {
			margin-top: 0.4em;
			font-weight: 500;
		}
	}
</style>
