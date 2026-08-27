<script setup lang="ts">
	import { computed, watch } from "vue";
	import { highlightedBreaks, getHighlightedBreakKey } from "../../highlightedBreaks";
	import { injectStateRequired } from "../../services/state";
	import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import vTooltip from "../utils/tooltip";
	import { download, ExportType } from "../utils/export";
	import { BeatboxReference, getPlayerById } from "../../services/player";
	import { getBreakDescriptionHtml, getHighlightedBreaksIntroHtml, getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const props = defineProps<{
		/** Clé (voir getHighlightedBreakKey) du break à afficher. Si absente ou invalide (break
		 * renommé/supprimé depuis), le premier de la liste est choisi et reflété ici via l'event. */
		selectedKey?: string;
	}>();

	const emit = defineEmits<{
		"update:selectedKey": [key: string | undefined];
	}>();

	const state = injectStateRequired();
	const i18n = useI18n();

	function openLinksInNewTab(html: string): string {
		const el = document.createElement("div");
		el.innerHTML = html;
		for (const link of el.querySelectorAll("a")) {
			link.setAttribute("target", "_blank");
		}
		return el.innerHTML;
	}

	const introHtml = computed(() => {
		const html = getHighlightedBreaksIntroHtml();
		return html ? openLinksInNewTab(html) : null;
	});

	const items = computed(() => highlightedBreaks.map((entry) => {
		const tune = state.value.tunes[entry.tuneName];
		const pattern = tune.patterns[entry.patternName];
		return {
			...entry,
			key: getHighlightedBreakKey(entry),
			displayName: entry.name || `${getLocalizedDisplayName(tune.displayName || entry.tuneName)} (${getLocalizedDisplayName(pattern.displayName || entry.patternName)})`,
			descriptionHtml: entry.descriptionFilename ? openLinksInNewTab(getBreakDescriptionHtml(entry.descriptionFilename)) : null
		};
	}));

	const selectedItem = computed(() => items.value.find((item) => item.key === props.selectedKey) || items.value[0]);

	// Rien ou une clé invalide sélectionnée : retomber sur le premier break plutôt qu'une page vide,
	// et refléter ce choix par défaut dans l'URL (via le v-model du parent) pour qu'elle reste correcte.
	watch(() => selectedItem.value?.key, (key) => {
		if (key && key !== props.selectedKey) {
			emit("update:selectedKey", key);
		}
	}, { immediate: true });

	const handleDownload = (tuneName: string, patternName: string, playerRef: BeatboxReference) => {
		void download({
			type: ExportType.MP3,
			player: getPlayerById(playerRef.id),
			filename: `${tuneName} - ${patternName}`
		});
	};
</script>

<template>
	<div class="bb-tune-info bb-highlighted-breaks-info">
		<h1>{{i18n.t("highlighted-breaks.title")}}</h1>

		<div v-if="introHtml" v-html="introHtml"></div>

		<template v-if="selectedItem">
			<h2>{{selectedItem.displayName}}</h2>
			<div v-if="selectedItem.descriptionHtml" v-html="selectedItem.descriptionHtml"></div>
			<PatternPlaceholder
				:tune-name="selectedItem.tuneName"
				:pattern-name="selectedItem.patternName"
				:readonly="true"
				v-slot="{ getPlayer }"
			>
				<PatternPlaceholderItem><a href="javascript:" v-tooltip="i18n.t('tune-info.download-mp3')" @click="handleDownload(selectedItem.tuneName, selectedItem.patternName, getPlayer())" draggable="false"><fa icon="download"/></a></PatternPlaceholderItem>
			</PatternPlaceholder>
		</template>
	</div>
</template>

<style lang="scss">
	.bb-highlighted-breaks-info {
		h2 {
			margin-top: 1.5em;
		}
	}
</style>
