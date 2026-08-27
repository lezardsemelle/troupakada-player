<script setup lang="ts">
	import { computed, ref } from "vue";
	import { highlightedBreaks } from "../../highlightedBreaks";
	import { injectStateRequired } from "../../services/state";
	import { clone } from "../../utils";
	import PlaybackSettingsPicker from "../playback-settings/playback-settings-picker.vue";
	import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder.vue";
	import vTooltip from "../utils/tooltip";
	import { download, ExportType } from "../utils/export";
	import { BeatboxReference, getPlayerById } from "../../services/player";
	import { getBreakDescriptionHtml, getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const state = injectStateRequired();
	const i18n = useI18n();

	const playbackSettings = ref(clone(state.value.playbackSettings));

	function openLinksInNewTab(html: string): string {
		const el = document.createElement("div");
		el.innerHTML = html;
		for (const link of el.querySelectorAll("a")) {
			link.setAttribute("target", "_blank");
		}
		return el.innerHTML;
	}

	const items = computed(() => highlightedBreaks.map((entry) => {
		const tune = state.value.tunes[entry.tuneName];
		const pattern = tune.patterns[entry.patternName];
		return {
			...entry,
			tuneDisplayName: getLocalizedDisplayName(tune.displayName || entry.tuneName),
			patternDisplayName: getLocalizedDisplayName(pattern.displayName || entry.patternName),
			descriptionHtml: entry.descriptionFilename ? openLinksInNewTab(getBreakDescriptionHtml(entry.descriptionFilename)) : null
		};
	}));

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
		<h1 class="d-flex align-items-center">
			<span class="flex-grow-1">{{i18n.t("highlighted-breaks.title")}}</span>
			<PlaybackSettingsPicker v-model="playbackSettings" />
		</h1>

		<template v-for="item in items" :key="`${item.tuneName}//${item.patternName}`">
			<h2>{{item.tuneDisplayName}} <small class="text-muted">({{item.patternDisplayName}})</small></h2>
			<div v-if="item.descriptionHtml" v-html="item.descriptionHtml"></div>
			<PatternPlaceholder
				:tune-name="item.tuneName"
				:pattern-name="item.patternName"
				:readonly="true"
				:settings="playbackSettings"
				v-slot="{ getPlayer }"
			>
				<PatternPlaceholderItem><a href="javascript:" v-tooltip="i18n.t('tune-info.download-mp3')" @click="handleDownload(item.tuneName, item.patternName, getPlayer())" draggable="false"><fa icon="download"/></a></PatternPlaceholderItem>
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
