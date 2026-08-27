<script setup lang="ts">
	import { BeatboxReference, stopAllPlayers } from "../../services/player";
	import { getPatternFromState } from "../../state/state";
	import defaultTunes from "../../defaultTunes";
	import { patternEquals } from "../../state/pattern";
	import PatternPlayer from "./pattern-player.vue";
	import ShareDialog from "../compose/share-dialog.vue";
	import { computed, ref, watch } from "vue";
	import { injectStateRequired } from "../../services/state";
	import { useModal } from "./../utils/modal";
	import { getLocalizedDisplayName, useI18n } from "../../services/i18n";

	const state = injectStateRequired();

	const props = withDefaults(defineProps<{
		tuneName: string;
		patternName: string;
		readonly?: boolean;
		playerRef?: BeatboxReference;
	}>(), {
		readonly: false
	});

	const emit = defineEmits<{
		hidden: [];
	}>();

	const i18n = useI18n();

	const modalRef = ref<HTMLElement>();
	const modalActions = useModal(modalRef, {
		onHide: () => {
			stopAllPlayers();
		},
		onHidden: () => {
			emit("hidden");
		}
	});

	// Peut devenir undefined si le pattern disparaît du state pendant que la modale reste ouverte
	// (ex. rechargement d'un state plus ancien depuis un autre onglet) — fermer la modale plutôt que
	// de laisser le contenu planter sur un pattern inexistant.
	const pattern = computed(() => getPatternFromState(state.value, props.tuneName, props.patternName));

	watch(pattern, (p) => {
		if (!p)
			modalActions.hide();
	});

	const originalPattern = computed(() => defaultTunes.getPattern(props.tuneName, props.patternName));

	const title = computed(() => {
		const tune = state.value.tunes[props.tuneName];
		const patternDisplayName = tune?.patterns[props.patternName]?.displayName;
		return `${getLocalizedDisplayName(tune?.displayName || props.tuneName)} – ${getLocalizedDisplayName(patternDisplayName || props.patternName)}`;
	});

	const hasChanged = computed(() => !!pattern.value && (!originalPattern.value || !patternEquals(originalPattern.value, pattern.value)));

	const showShareDialog = ref(false);

	const share = () => {
		showShareDialog.value = true;
	};
</script>

<template>
	<Teleport to="body">
		<div class="modal fade bb-pattern-editor-dialog" tabindex="-1" aria-hidden="true" ref="modalRef">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{title}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="i18n.t('general.dialog-close')"></button>
					</div>
					<div class="modal-body" v-if="pattern">
						<PatternPlayer :tuneName="tuneName" :patternName="patternName" :readonly="readonly" :player="playerRef">
							<button type="button" class="btn btn-info" v-if="hasChanged" @click="share()"><fa icon="share"/>{{" "}}{{i18n.t("pattern-player-dialog.share")}}</button>
						</PatternPlayer>
						<ShareDialog v-if="showShareDialog" @hidden="showShareDialog = false" :link-pattern="[tuneName, patternName]" />
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.bb-pattern-editor-dialog {
		display: flex !important;
		justify-content: center;
		align-items: center;

		.modal-dialog {
			margin: 30px;
			width: auto;
			max-width: calc(100% - 60px);
			display: inline-block;
		}
	}
</style>