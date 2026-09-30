import config, { instrumentValidator } from "../config";
import { clone } from "../utils";
import * as z from "zod";

export type Headphones = z.infer<typeof headphonesValidator>;
export const headphonesValidator = z.array(instrumentValidator);

export type Mute = z.infer<typeof muteValidator>;
export const muteValidator = z.record(instrumentValidator, z.boolean().optional());

export type Whistle = z.infer<typeof whistleValidator>; // 1: Whistle on one, 2: whistle on all beats
export const whistleValidator = z.union([z.literal(false), z.literal(1), z.literal(2)]);

// Lu à la demande (pas au chargement du module) : `config` peut ne pas encore être initialisé à cause des imports circulaires.
const getDefaultVolumes = () => config.volumePresets[Object.keys(config.volumePresets)[0]].volumes;

export type Volumes = z.infer<typeof volumesValidator>;
// Chaque instrument a une valeur par défaut : des réglages enregistrés avant l'ajout d'un instrument (ex. timbal)
// n'ont pas sa clé, et sans défaut la validation échouait et tout l'état Composer était abandonné au chargement.
export const volumesValidator = z.object(Object.fromEntries(
	instrumentValidator.options.map((instr) => [instr, z.number().default(() => getDefaultVolumes()[instr])])
) as Record<typeof instrumentValidator.options[number], z.ZodDefault<z.ZodNumber>>);

export type PlaybackSettings = z.infer<typeof playbackSettingsValidator>;
export const playbackSettingsValidator = z.object({
	speed: z.number().default(config.defaultSpeed),
	headphones: headphonesValidator.default(() => []),
	mute: muteValidator.default(() => ({})),
	volume: z.number().default(1),
	volumes: volumesValidator.default(() => clone(getDefaultVolumes())),
	loop: z.boolean().default(false),
	length: z.number().optional(), // Cut off after a certain amount of beats
	whistle: whistleValidator.default(false)
}).default(() => ({}));

type PlaybackSettingsOptional = z.input<typeof playbackSettingsValidator>;

export function normalizePlaybackSettings(data?: PlaybackSettingsOptional): PlaybackSettings {
	return playbackSettingsValidator.parse(data);
}

export function updatePlaybackSettings(playbackSettings: PlaybackSettings, update: PlaybackSettingsOptional): void {
	Object.assign(playbackSettings, update);
}