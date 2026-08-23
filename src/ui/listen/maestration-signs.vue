<script lang="ts" setup>
	import { computed } from "vue";
	import { getMaestrationForTune, getSignImageUrl } from "../../maestrationSigns";
	import { useI18n } from "../../services/i18n";

	const props = defineProps<{
		tuneName: string;
	}>();

	const i18n = useI18n();

	const signs = computed(() => getMaestrationForTune(props.tuneName));
</script>

<template>
	<div v-if="signs && signs.length > 0" class="bb-maestration-signs">
		<h2>{{i18n.t("maestration-signs.title")}}</h2>
		<div class="accordion">
			<div class="accordion-item" v-for="sign in signs" :key="sign.id">
				<h3 class="accordion-header">
					<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#bb-maestration-${tuneName}-${sign.id}`">
						{{sign.label}}
					</button>
				</h3>
				<div :id="`bb-maestration-${tuneName}-${sign.id}`" class="accordion-collapse collapse">
					<div class="accordion-body">
						<img v-if="getSignImageUrl(sign.id)" :src="getSignImageUrl(sign.id)" :alt="sign.label" />
						<div v-else class="bb-maestration-svg" v-html="sign.svgFallback"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.bb-maestration-signs {
		.bb-maestration-svg svg {
			width: 60px;
			height: 60px;
			color: var(--bs-body-color);
		}

		img {
			max-width: 100%;
			max-height: 200px;
		}
	}
</style>
