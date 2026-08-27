<script lang="ts" setup>
	import { computed, nextTick, ref, watch } from "vue";
	import { injectStateRequired } from "../../services/state";
	import PatternListFilter, { Filter, filterPatternList } from "../pattern-list-filter.vue";
	import Collapse from "../utils/collapse.vue";
	import { getLocalizedDisplayName, useI18n } from "../../services/i18n";
	import { isFavorite, toggleFavorite } from "../../services/favorites";
	import { highlightedBreaks, getHighlightedBreakKey, HIGHLIGHTED_BREAKS_TUNE_NAME } from "../../highlightedBreaks";

	const props = defineProps<{
		tuneName: string | null | undefined;
		editPattern?: string;
	}>();

	const emit = defineEmits<{
		"update:tuneName": [tuneName: string | null | undefined];
		"update:editPattern": [patternName: string | undefined];
	}>();

	const tuneName = computed({
		get: () => props.tuneName,
		set: (tuneName) => {
			emit("update:tuneName", tuneName);
		}
	});

	const editPattern = computed({
		get: () => props.editPattern,
		set: (patternName) => {
			emit("update:editPattern", patternName);
		}
	});

	const state = injectStateRequired();

	const filter = ref<Filter | undefined>(undefined);

	const tuneList = computed(() => filterPatternList(state.value, filter.value));

	const tuneListRef = ref<HTMLElement | null>(null);

	const highlightedBreaksItems = computed(() => highlightedBreaks.map((entry) => {
		const tune = state.value.tunes[entry.tuneName];
		const pattern = tune.patterns[entry.patternName];
		return {
			key: getHighlightedBreakKey(entry),
			displayName: entry.name || `${getLocalizedDisplayName(tune.displayName || entry.tuneName)} (${getLocalizedDisplayName(pattern.displayName || entry.patternName)})`
		};
	}));

	const highlightedBreaksOpen = ref(false);

	const toggleHighlightedBreaksGroup = () => {
		highlightedBreaksOpen.value = !highlightedBreaksOpen.value;
		if (highlightedBreaksOpen.value) {
			tuneName.value = HIGHLIGHTED_BREAKS_TUNE_NAME;
		}
	};

	const selectHighlightedBreak = (key: string) => {
		highlightedBreaksOpen.value = true;
		tuneName.value = HIGHLIGHTED_BREAKS_TUNE_NAME;
		editPattern.value = key;
	};

	watch(tuneName, () => {
		if (tuneName.value) {
			// "Breaks à la une" n'est pas un vrai morceau : il ne peut jamais apparaître dans la
			// liste filtrée, donc ne pas changer le filtre en place quand on y navigue (sinon le
			// filtre "Troup'akada" ou autre se réinitialiserait sur "Tous" à chaque clic dessus).
			if(tuneName.value !== HIGHLIGHTED_BREAKS_TUNE_NAME && !filterPatternList(state.value, filter.value).includes(tuneName.value))
				filter.value = { text: "", cat: "all" };

			if (tuneName.value === HIGHLIGHTED_BREAKS_TUNE_NAME)
				highlightedBreaksOpen.value = true;

			void nextTick(() => {
				scrollToTune();
			});
		}
	}, { immediate: true });

	const scrollToTune = () => {
		tuneListRef.value?.querySelector('.nav-link.active')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	};

	const i18n = useI18n();
</script>

<template>
	<div class="bb-tune-list">
		<PatternListFilter v-model="filter" :show-custom="false" />

		<hr />

		<ul class="nav nav-pills flex-column flex-nowrap" ref="tuneListRef">
			<li v-if="highlightedBreaks.length > 0" class="nav-item bb-highlighted-breaks-group">
				<a class="nav-link d-flex align-items-center" :class="{ active: tuneName === HIGHLIGHTED_BREAKS_TUNE_NAME && !editPattern }" href="javascript:" @click="toggleHighlightedBreaksGroup()" draggable="false">
					<fa icon="star" />
					<span class="flex-grow-1">{{i18n.t("highlighted-breaks.title")}}</span>
					<fa icon="caret-down" />
				</a>
				<Collapse :show="highlightedBreaksOpen" :height="highlightedBreaksItems.length * 40">
					<ul class="nav flex-column bb-highlighted-breaks-submenu">
						<li v-for="item in highlightedBreaksItems" :key="item.key" class="nav-item">
							<a class="nav-link" :class="{ active: tuneName === HIGHLIGHTED_BREAKS_TUNE_NAME && editPattern === item.key }" href="javascript:" @click="selectHighlightedBreak(item.key)" draggable="false">
								{{item.displayName}}
							</a>
						</li>
					</ul>
				</Collapse>
			</li>
			<li v-for="thisTuneName in tuneList" :key="thisTuneName" class="nav-item">
				<a class="nav-link" :class="{ active: thisTuneName == tuneName }" href="javascript:" @click="tuneName = thisTuneName" draggable="false">
					<span
						class="bb-favorite-toggle"
						:class="{ active: isFavorite(thisTuneName) }"
						role="button"
						tabindex="0"
						:title="isFavorite(thisTuneName) ? i18n.t('tune-list.remove-favorite') : i18n.t('tune-list.add-favorite')"
						@click.stop="toggleFavorite(thisTuneName)"
						@keydown.enter.stop.prevent="toggleFavorite(thisTuneName)"
						@keydown.space.stop.prevent="toggleFavorite(thisTuneName)"
					><fa icon="star" /></span>
					{{getLocalizedDisplayName(state.tunes[thisTuneName].displayName || thisTuneName)}}
				</a>
			</li>
		</ul>
	</div>
</template>

<style lang="scss">
	.bb-tune-list {
		display: flex;
		flex-direction: column;

		hr {
			/* https://stackoverflow.com/a/34372979/242365 */
			margin-left: 0;
			margin-right: 0;
		}

		> .nav {
			flex-basis: 0;
			flex-grow: 1;
			min-height: 0;
			overflow-y: auto;
			position: relative;
			padding: 0 1.2em 1.2em 1.2em;
			margin: 0 -1.2em -1.2em -1.2em;
		}
	}

	.bb-highlighted-breaks-submenu {
		.nav-link {
			padding-left: 2em;
			font-size: 0.9em;
		}
	}

	.bb-favorite-toggle {
		display: inline-block;
		margin-right: 0.4em;
		opacity: 0.35;
		cursor: pointer;

		&:hover, &:focus-visible {
			opacity: 0.7;
		}

		&.active {
			color: #f5c518;
			opacity: 1;
		}
	}
</style>