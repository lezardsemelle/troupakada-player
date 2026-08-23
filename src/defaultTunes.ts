import config, { Instrument } from "./config";
import { clone } from "./utils";
import { AllVolumeHack, normalizePattern, Pattern, compressedPatternValidator } from "./state/pattern";
import { normalizeTune, Tune } from "./state/tune";
import * as z from "zod";
import { PatternReference } from "./state/song";
import { troupakadaTunes } from "./troupakadaTunes";

function stretch(from: number, to: number, pattern: string): string {
	return pattern.split("").concat([ "" ]).join(repeat((to/from)-1, " "));
}

function repeat(n: number, pattern: string): string {
	let ret = "";
	for(let i=0; i<n; i++)
		ret += pattern;
	return ret;
}

function crescendo(length: number, start: number = 0): AllVolumeHack {
	const r: AllVolumeHack = { };
	const a = .05;
	const b = (1-a)/(length-1);
	for(let i=0; i<length; i++)
		r[start+i] = a+b*i;
	return r;
}

function decrescendo(length: number): AllVolumeHack {
	const r: AllVolumeHack = { };
	const b = 0.95/(length-1);
	for(let i=0; i<length; i++)
		r[i] = 1-b*i;
	return r;
}

const sheetUrl = "https://github.com/rhythms-of-resistance/sheetbook/blob/master/generated/single/";

export type RawTune = Partial<Omit<Tune, 'patterns'>> & {
	patterns: Record<string, z.input<typeof compressedPatternValidator>>;
	time?: number;
};

const rawTunes: {[tuneName: string]: RawTune} = {
	'General Breaks': {
		categories: [ "common", "uncommon", "new", "proposed", "custom", "onesurdo", "easy", "medium", "tricky", "western", "cultural-appropriation" ],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			"Karla Break": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
			},
			"8 up": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: crescendo(32)
			},
			"8 down": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: decrescendo(32)
			},
			"Clave": {
				lg: 'X  X  X   X X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Clave 4x": {
				displayName: "Clave 4× soft to loud",
				lg: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
			},
			'Clave Inverted': {
				lg: '  X X   X  X  X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Progressive': {
				lg: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Progressive Inverted': {
				lg: 'XXXXXXXXXXXXXXXXX X X X X X X X X   X   X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Progressive Karla': {
				lg: 'X   X   X   X   X X X X X X X X XXXXXXXXXXXXXXXXX               ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'4 Silence': {
				lg: repeat(16, ' ')
			},
			'8 Silence': {
				lg: repeat(32, ' ')
			},
			'12 Silence': {
				lg: repeat(48, ' ')
			},
			'16 Silence': {
				lg: repeat(64, ' ')
			},
			'Boom Break': {
				lg: 'X               ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Yala Break': {
				lg: 'X X   X X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Whistle in": {
				ot: 'y   y   y   y   '
			}
		}
	},
	'Special Breaks': {
		categories: [ "common", "onesurdo" ],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			"Call Break Oi": {
				displayName: 'Oi Break',
				time: 3,
				lg: 'X  XXXX     ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '         A  '
			},
			"Call Break Ua": {
				displayName: 'Ua Break',
				time: 3,
				lg: 'X  XXXX     ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '         B  '
			},
			'Star Wars': {
				lg: '            X       X           ',
				mg: 'X   X   X       X       X       ',
				hg: '               X       X        '
			},
			'Star Wars Extended': {
				lg: '            X       X                               X           ',
				mg: 'X   X   X       X       X                       X       X       ',
				hg: '               X       X                       X       X        ',
				re: '                                X   X   X                       ',
				ta: '                                            X                   '
			},
			'Star Wars Extended Extended': {
				lg: '            X       X                               X                                                 X     X       X           ',
				mg: 'X   X   X       X       X                       X       X           X  X              X                         X       X       ',
				hg: '               X       X                       X       X                                                       X       X        ',
				re: '                                X   X   X                                                                                       ',
				ca: '@re',
				ta: '                                            X                                                   XXX     X                       ',
				ag: '                                                                a       a   a  aooo     o   o  o                                '
			},
			"Wulf Break": {
				lg: 'X X   XXX X    XX X    XX X     X X   XXX X    XX X X X X       ',
				mg: '@lg',
				hg: '@lg',
				re: '    X       X       X       X       X       X  XX X X X X       ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re',
				ot: '                                                          E D   '
			},
			'Hardcore Break': {
				lg: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') +
					repeat(1, 'X   X   X   X XXX   X   X   X XXX   X   X   X XXX   X   XXXXXXXX') +
					repeat(1, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
				mg: '@lg',
				hg: '@lg',
				re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') +
					repeat(1, 'X   X   X   X XXX   X   X   X XXX   X   X   X XXX   X   XXXXXXXX') +
					repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
				ca: '@re',
				ta: '@re',
				ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') +
					repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
				ch: '@re',
			},
			'Hard Core Break': {
				displayName: "Hardcore Break (original)",
				lg: repeat(2, '              XXX             XXX             XXX       XXXXXXXX') + repeat(2, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
				mg: '@lg',
				hg: '@lg',
				re: repeat(1, '              XXX             XXX             XXX       XXXXXXXX') + repeat(3, 'X X X X X X X XXX X X X X X X XXX X X X X X X XXX X X X XXXXXXXX'),
				ca: '@re',
				ta: '@re',
				ag: repeat(3, 'o o o o o o o ooo o o o o o o ooo o o o o o o ooo o o o oooooooo') + repeat(1, 'a a a a a a a aaa a a a a a a aaa a a a a a a aaa a a a aaaaaaaa'),
				ch: '@re',
				volumeHack: {
					lg: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					mg: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					hg: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					re: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ca: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ta: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 },
					ch: { 66:  .3, 78:  1, 82:  .3, 94:  1, 98:  .3, 110: 1, 114: .3, 120: 1, 130: .6, 142: 1, 146: .6, 158: 1, 162: .6, 174: 1, 178: .6, 184: 1 }
				}
			},
			'Nellie the Elephant Break': {
				lg: '            X X             X X             X X XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ' + repeat(2, '                ') + repeat(3, 'X  X  X         ') + 'X           XXX ',
				mg: '@lg',
				hg: '@lg',
				re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ' + repeat(2, '                ') + repeat(3, '        X  X  X ') + 'X           XXX ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '                                                                                                ' + repeat(2, 'DDDDDDDDDDDDDDDD') + repeat(3, '                ') + '                ',
				volumeHack: Object.assign({ 48: .2, 64: .6, 80: 1, 128: .2, 144: .6, 160: 1 }, crescendo(32, 96))
			},
			'Super Mario Break': {
				lg: '     X          ',
				mg: 'XX X  X         ',
				hg: '        X       ',
				ag: '            o   '
			},
			'Punky Monkey Break': {
				ot: 'DDEEDDEEA A A   '
			}
		}
	},
	"Shouting Breaks": {
		categories: [ "common", "onesurdo" ],
		sheet: sheetUrl + "breaks.pdf",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/37596e72-e93b-44f1-8770-760be8e5ce87",
		patterns: {
			"Democracy Break": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                X X X XX XX X X                 X X X XX XX X X                                                 X  X  X   X X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ot: '                                                * , - ?: ;< = >                 * , - ?: ;< = >                 * , - ?: ;< = > * , - ?: ;< = > * , - ?: ;< = >                 ',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1, 112: .4, 128: .7, 144: 1 }
			},
			'Tout le monde': {
				lg: 'X     X X     X X  XX X X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: 'b     c d     e g  qj k m   n   '
			},
			'Dance Break': {
				time: 2,
				ot: 'TUVWY Z '
			},
			'Wir sind hier': {
				time: 2,
				lg: "     XX      XX              XX ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg",
				ot: "K [\\    K [^    _ ` { | }~ À    "
			},
			'Keep it in the ground': {
				lg: "                          X X   ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg",
				ot: "Á   Â   Ã ÄÅ ÆÇ Á Â Ã ÄÅ        "
			},
			'Keine Profite mit der Miete': {
				time: 4,
				lg: "                X XXX X X X X X ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg",
				ot: "È ÉÊË Ì Í Î Ï Ì                 "
			}
		}
	},
	"Afoxe": {
		displayName: "Afoxé",
		categories: [ "troupakada", "common", "medium", "cultural-appropriation" ],
		sheet: sheetUrl + "afoxe.pdf",
		descriptionFilename: "afoxe",
		patterns: {
			"Tune": {
				loop: true,
				lg: 's   s   s   s   s   s   X   X   ',
				mg: '0     X 0     X 0     X X X X X ',
				hg: '@mg',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				ca: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				ch: '................................'
			},
			"Break 1": {
				lg: 'X       X       X       X XXXXX ',
				mg: '@lg',
				hg: '@lg',
				re: '   XXXX    XXXX    XXXX X XXXXX ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			"Break 2": {
				lg: 's   s   s   s   s   s   X   X   ',
				mg: '      X       X       X   XXXXX ',
				hg: '@mg',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				ca: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				ch: '................................'
			},
			"Break 3": {
				lg: 's   s   s   s   s   s   X   X   ',
				mg: '   XXXX    XXXX    XXXX X XXXXX ',
				hg: '@mg',
				re: 'f  hs r f  hs r f  hs r s r s r ',
				ca: 'X...X..XX..X....X...X..XX..X....',
				ta: 'X X X X XX XX X X X X X XX XX X ',
				ag: 'a a o o aa o oo a a o o aa o oo ',
				ch: '................................'
			},
			"Bra Break": {
				displayName: "Call Break",
				lg: '        XX XX           XX XX           XX XX   X X X X XX XX X ',
				mg: '@lg',
				hg: '@lg',
				re: 'X X X           X X X           X X X           X X X X XX XX X ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Tamborim Stroke": {
				lg: 'X X X X XX XX X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tamborim Stroke"]
	},
	'Angela Davis': {
		categories: [ "common", "medium" ],
		sheet: sheetUrl + "angela-davis.pdf",
		descriptionFilename: "angela-davis",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/3a431ae3-e59b-4d31-b2d6-9abc4db3f242",
		patterns: {
			Tune: {
				loop: true,
				lg: 'r r X  XrXr X   ',
				mg: 'XXXXXXXXX       ',
				hg: '            XXXX',
				re: 'f   f   f  XXX  ',
				ca: '....X.......X...',
				ta: 'X   X  XXX  X   ',
				ag: '  o a   oa  a   ',
				ch: '................'
			},
			'Break 1': {
				upbeat: 1,
				lg: 'XX X X X X X X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 2': {
				lg: 'X             X X             X X              XX X X X X X X X ',
				mg: '@lg',
				hg: '@lg',
				re: '  XXX XX XX X     XXX XX XX X     XXX XX XX X  XX X X X X X X X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 3': {
				lg: 'X     XXXX      X X X  X        X     XXXX        X  X  X      XX X X X X X X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '....X.......X.......X.......X.......X.......X.......X.......X.......X.......X...',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Break 3", "Tune", "Tune", "Tune", "Tune"]
	},
	'Angry Dwarfs': {
		categories: [ "uncommon" ],
		sheet: sheetUrl + "angry-dwarfs.pdf",
		descriptionFilename: "angry-dwarfs",
		patterns: {
			Tune: {
				loop: true,
				lg: 's   X   s   X   ',
				mg: 'X  XX  XX  XX X ',
				hg: '@mg',
				re: '  f  f    f  f  ',
				ca: '..XX..X...XX..X.',
				ta: '  X   X   X X X ',
				ag: 'a  ao  ao a a   ',
				ch: 'X..XX..XX..XX..X'
			},
			'Intro': {
				lg: repeat(4, '                ') + repeat(3, '        XX XX X ') + '    X       X   ',
				mg: repeat(4, '                ') + repeat(3, '        XX XX X ') + 'X       X   X X ',
				hg: repeat(4, '                ') + repeat(3, '        XX XX X ') + '            X X ',
				re: repeat(4, '                ') + repeat(3, 'XX XX X         ') + '  X   X   X X X ',
				ca: repeat(4, '                ') + repeat(3, '        XX XX X ') + '                ',
				ta: repeat(8, '  X   X   X X X '),
				ag: '@ca',
				ch: '@ca'
			},
			'No-Cent-For-Axel-Break': {
				lg: '        XX XX X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '98 76 5         '
			},
			'Tension Break': {
				lg: '    X       X       X   XX XX X ',
				mg: '  X   X   X   X   X   X XX XX X ',
				hg: '                        XX XX X ',
				re: '@hg',
				ta: 'XX XX X         XX XX X XX XX X ',
				ag: '@hg',
				ch: '@hg'
			}
		},
		exampleSong: [ "Intro", "Tune", "Tune", "Tune", "Tune", "No-Cent-For-Axel-Break", "Tune", "Tune", "Tune", "Tune", "Tension Break", "Tune", "Tune", "Tune", "Tune" ]
	},
	'Antitek': {
		categories: ["uncommon", "new", "easy", "onesurdo"],
		sheet: sheetUrl + "antitek.pdf",
		descriptionFilename: "antitek",
		patterns: {
			Tune: {
				loop: true,
				lg: "X   X   X   X   X   X   X   X   ",
				mg: "@lg",
				hg: "@lg",
				re: "r X r X r X r X r X r X r XXr X ",
				ca: "....X.......X.......X.......X...",
				ta: "X  X  X  X        XX            ",
				ag: "o  a  a o  a  a o  a  a o   a   ",
				ch: "................................"
			},
			"Break 1": {
				lg: "X       X  X  X ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Break 2": {
				lg: "XXX XXX XXX XXX ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Call Break": {
				lg: "                X X X X X X XXX X   X   X   X   X           XXX ",
				mg: "@lg",
				hg: "@lg",
				re: "X X X X X X XXX X   X   X   X   X   X   X   X   X           XXX ",
				ca: "                                X X X X X X XXX X           XXX ",
				ta: "                                                X           XXX ",
				ag: "                                                X           XXX ",
				ch: "                                                X           XXX "
			}
		},
		exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Call Break", "Tune", "Tune"]
	},
	'Bella Ciao': {
		categories: ["uncommon", "new", "medium"],
		sheet: sheetUrl + "bella-ciao.pdf",
		descriptionFilename: "bella-ciao",
		patterns: {
			Tune: {
				loop: true,
				lg: repeat(4, "X  XX X X  XX X "),
				mg: repeat(4, "          XXXX  "),
				re: "f X       X X X f X       X X X f   X X f   X X f   f   f X X X ",
				ca: repeat(2, "...X..X....X..X....X..X..X.X..X."),
				ta: repeat(4, "    XXX   X X X "),
				ag: "    o o o           a a a       o       o       a   a   a       ",
				ch: repeat(4, "...X..X....X....")
			},
			"Break 1": {
				lg: "X   X X X   X X X   X   X       ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Break 2": {
				lg: "X X             X X             X X             XXX XXX X X X X ",
				mg: "@lg",
				re: "        XXX XXX         XXX XXX         XXX XXX XXX XXX X X X X "
			},
			"Intro": {
				upbeat: 6,
				lg: "r r r r r       r r r r r       r r r r   r r r   r r r   r   r r r r r r       r r r r r       r r r r   r   r   r   r               ",
				mg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg"
			}
		},
		exampleSong: ["Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune"]
	},
	'Bhangra': {
		categories: [ "common", "onesurdo", "medium" ],
		speed: 120,
		time: 3,
		displayName: "Bhaṅgṛā",
		sheet: sheetUrl + "bhangra.pdf",
		descriptionFilename: "bhangra",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/bb1e9a2e-ce51-435c-818f-d98cf95f9ed0",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X       XX  X       XX  X       XX  X    X   X  ',
				mg: '@lg',
				hg: '@lg',
				re: 'X zX zX zX zX zX zX zX zX zX zX zX zXXXX  XXXX  ',
				ca: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..',
				ta: 'X XX XX XX XX XX XX XX XX XX XX XX XX XX XX XX X',
				ag: 'aaaa  oooo              aaaa  oooo              ',
				ch: 'X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..X..'
			},
			'Break 1': {
				upbeat: 4,
				lg: 'XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X XX X  XX  X       XX  X    X   X              ',
				mg: '@lg',
				hg: '@lg',
				re: '                   X  X                    X  X                    X  X                             ',
				ca: '                   X  X                    X  X                    X  X                 XXXX  XXXX  ',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 2': {
				upbeat: 4,
				lg: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X              ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: 'XX  X XX  X XX  X       XX    X  XX  X  X       XX  X XX  X XX  X       XX    X  XX  X  XXXX  XXXX  ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Break 3": {
				lg: "XXXX  XXXX  ",
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Bra Break": {
				displayName: "Call Break",
				lg: '                                                                        X XX XX XX              ',
				mg: '@lg',
				hg: '@lg',
				re: 'XXXXXXXXXX              XXXXXXXXXX              XXXX        XXXXXXXXXX              XXXXXXX     ',
				ca: '            XXXXXXXXXX              XXXXXXXXXX        XXXX                          XXXXXXX     ',
				ta: '@ca',
				ag: '@ca',
				ch: '@ca',
				ot: '                                                                                             F  '
			},
			"Karla Break (3⁄4)": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX           ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: { 0: .1, 12: .4, 24: .7, 36: 1  }
			},
			"8 up (3⁄4)": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: crescendo(24)
			},
			"8 down (3⁄4)": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: decrescendo(24)
			},
			'Progressive (3⁄4)': {
				lg: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Progressive Inverted (3⁄4)': {
				lg: 'XXXXXXXXXXXXX XX XX XX XX  X  X  X  ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Progressive Karla (3⁄4)': {
				lg: 'X  X  X  X  X XX XX XX XXXXXXXXXXXXXX           ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Bra Break", "Tune" ]
	},
	'Bomba': {
		categories: ["new", "uncommon", "tricky"],
		sheet: sheetUrl + "bomba.pdf",
		descriptionFilename: "bomba",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/3898aU5Yn4dd9a1SyxoJn2",
		patterns: {
			Tune: {
				loop: true,
				lg: "X  X     X X  X X  X     X X  X ",
				mg: "    X       X       X       X   ",
				hg: "      XX     XX       XX     XX ",
				re: "X X  X X   X  X X X  X X        ",
				ca: "..XX..X...XX..X...XX..X...XX..X.",
				ta: "    X    X X        X    f XX XX",
				ag: "o ooao o o oa   o ooao o        ",
				ch: "..XX..XX..XX..XX..XX..XX..XX..XX"
			},
			"Break 1": {
				lg: "X     X                         ",
				mg: "@lg",
				hg: "@lg",
				re: "          XXX X X X   X X   X   ",
				time: 8
			},
			"Break 2": {
				lg: "XX  XX  XX  XX  ",
				mg: "@lg",
				hg: "  XX  XX  XX  XX",
				re: "@hg",
				ca: "..XX..XX..XX..XX",
				ta: "@hg",
				ag: "ooaaooaaooaaooaa"
			},
			"Call Break": {
				lg: "X     X                         X     X                         X     X                         X X     X X     X X     X X    ",
				mg: "@lg",
				hg: "X     X                         X     X                         X     X                             X X     X X     X X     X X",
				re: "          XXX X X X   X X   X             XXX X X X   X X   X             XXX X X X   X X   X       X X     X X     X X     X X",
				ca: "X     X                         X     X                         X     X                         . . X X . . X X . . X X . . X X",
				ta: "@hg",
				ag: "o     o                         o     o                         o     o                         o o a a o o a a o o a a o o a a",
				time: 8
			}
		},
		exampleSong: ["Call Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune"]
	},
	'Chichita': {
		categories: ["uncommon", "new"],
		descriptionFilename: "chichita",
		sheet: sheetUrl + "chichita.pdf",
		patterns: {
			Tune: {
				loop: true,
				lg: repeat(4, "X   X X X   X X "),
				mg: repeat(4, "X XX    X XX    "),
				re: "X         XX XX X         XX XX X         XX XX XXXXX X XXXXX X ",
				ca: repeat(4, "f XXf XXf XXf XX"),
				ag: "  ooa ooa         aao aao         ooa ooa         aao     aao   "
			},
			"Break 1": {
				lg: "X   X   X   X   ",
				mg: "@lg",
				re: "  X   X   X   X ",
				ca: "@re",
				ag: "@re"
			},
			"Break 2": {
				lg: "X   X   X   X   X               X               X               X   X   X   X   ",
				mg: "@lg",
				re: "  X   X   X   X     X XX XX X X     X XX XX X X     X XX XX X X   X   X   X   X ",
				ca: "@re",
				ag: "@re"
			},
			"Double Break 2": {
				lg: "X   X   X   X   X               X               X               X   X   X   X   X               X               X               X   X   X   X   ",
				mg: "@lg",
				re: "  X   X   X   X     X XX XX X X     X XX XX X X     X XX XX X X   X   X   X   X     X XX XX X X     X XX XX X X     X XX XX X X   X   X   X   X ",
				ca: "@re",
				ag: "@re"
			},
			"Intro": {
				lg: repeat(3, "X    XX    XX   "),
				mg: "@lg",
				re: repeat(3, "  XX    XX    X "),
				ca: "@re",
				ag: "@re"
			}
		},
		exampleSong: ["Intro", "Tune", "Break 1", "Tune", "Break 2", "Tune", "Double Break 2", "Tune"]
	},
	'Cochabamba' : {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "cochabamba.pdf",
		descriptionFilename: "cochabamba",
		patterns: {
			Tune: {
				loop: true,
				lg: 'XX  0    XX 0   XX  0    XX 0   ',
				mg: '@lg',
				hg: '    0 XX    0 XX    0 XX    0 XX',
				re: '  XX  X   XX  X   XX  XX  XX  X ',
				ca: '....X.......X.......X.......X...',
				ta: '@re',
				ag: 'aa.oo.aa.oo.a.a.oo.aa.oo.aa.o.o.',
				ch: '................................'
			},
			'Break 1': {
				lg: 'XX XX XX XX X X XX XX XX XX X X XX XX XX XX X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: { 0: .2, 16: .6, 32: 1  }
			},
			'Bra Break (Maestra)': {
				displayName: "Call Break (Maestra)",
				lg: '            X X             X X             X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: 'ww ww ww ww     ww ww ww ww     ww ww ww ww     '
			},
			'Bra Break (Repi)': {
				displayName: "Call Break (Repi)",
				lg: '            X X             X X             X X ',
				mg: '@lg',
				hg: '@lg',
				re: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Bra Break (Snare)': {
				displayName: "Call Break (Snare)",
				lg: '            X X             X X             X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: 'XX XX XX XX     XX XX XX XX     XX XX XX XX     ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Cross Kicks': {
				lg: 'XX  0       0   ',
				hg: '    0       0 XX'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break (Repi)", "Tune", "Tune", "Cross Kicks", "Tune", "Tune" ]
	},
	'Coupe-Decale': {
		displayName: "Coupé-Décalé",
		categories: [ "medium", "uncommon" ],
		sheet: sheetUrl + "coupe-decale.pdf",
		descriptionFilename: "coupe-decale",
		patterns: {
			Tune: {
				loop: true,
				lg: "X       X X     X       X X     X       X X     X       XXXX    ",
				mg: "   X  X     X  X   X  X     X  X   X  X     X  X   X  X     XXXX",
				hg: "@mg",
				re: "X..X..XX..X.X...X..X..XX..X.X...X..X..XX..X.X...X..X..XX..X.X...",
				ca: "@re",
				ta: "X  X      f X   X  X            X  X      f X   X  X    XXXX    ",
				ag: "o  a            o  a  a o o a  ao  a            o  a  a o o a  a",
				ch: "X..X..X...X.X.X.X..X..X.........X..X..X...X.X.X.X..X..X.XXXXXXXX"
			},
			"Break 1": {
				lg: "X   X   X   X   X   X   X                 X",
				mg: "@lg",
				hg: "@lg",
				re: "X   X   X   X   X   X   X     f     X     X",
				ca: "@lg",
				ta: "@lg",
				ag: "a   a   a   a   a   a   a                  ",
				ch: "@lg",
				time: 12
			},
			"Break 2": {
				lg: "                                          X                                               X                                               X     X   X   X   X   X   X   X                 X",
				mg: "@lg",
				hg: "@lg",
				re: "X        X                          X           X        X                          X           X        X                          X           X   X   X   X   X   X   X     f     X     X",
				ca: "@re",
				ta: "@re",
				ag: "a        a                          a           a        a                          a           a        a                          a           a   a   a   a   a   a   a                  ",
				ch: "@re",
				time: 12
			},
			"Intro": {
				lg: "                                                                                                                                                                                                                                                        XXXX    ",
				mg: "                                                                                                                                                                                                                                                            XXXX",
				re: "r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   r  r  rr  r r   ",
				ca: "@re",
				ta: "                                                                                                                                X  X      f X   X  X            X  X      f X   X  X            X  X      f X   X  X            X  X      f X   X  X            ",
				ag: "                                                                o  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  ao  a            o  a  a o o a  a",
				ch: "                                                                                                                                                                                                X..X..X...X.X.X.X..X..X.........X..X..X...X.X.X.X..X..X.XXXXXXXX"
			},
			"Tune (6/8)": {
				loop: true,
				lg: "X     XX    X     XX",
				mg: "  X XX   X X  X XX   X X",
				hg: "@mg",
				re: "X.X.XX.X.X..X.X.XX.X.X..",
				ca: "@re",
				ta: "X X X  f X  f X X    X X",
				ag: "o a aaoo a ao a aaoo a a",
				ch: "X..X..X..X..X..X..X..X..",
				time: 3
			},
			"Intro (6/8)": {
				lg: "                                    XXX XXX XXX",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "o a aaoo a ao a aaoo a ao a aaoo a a           ",
				ch: "@lg",
				time: 3
			},
			"Crest Break (6/8)": {
				lg: "    XX    XX          XX    XX    XX          XX            XXX XXX XXX",
				mg: "@lg",
				hg: "@lg",
				re: "XXXX  XXXX  XXXXXXXXXX  XXXX  XXXX  XXXXXXXXXX  X X XX X X X           ",
				ca: "@lg",
				ta: "@lg",
				ag: "    aa    oo          aa    oo    aa          oo            aaa ooo ooa",
				ch: "@lg",
				time: 3
			}
		},
		exampleSong: [ "Intro", "Tune", "Break 1", "Tune", "Break 2", "Intro (6/8)", "Tune (6/8)", "Crest Break (6/8)", "Tune (6/8)", "Break 2", "Tune", "Break 1" ]
	},
	'Crazy Monkey': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "crazy-monkey.pdf",
		descriptionFilename: "crazy-monkey",
		patterns: {
			Tune: {
				loop: true,
				time: 12,
				lg: 'X                       X                       X                       X     X  X              ',
				mg: '                  X                       X                       X     X     X  X        X     ',
				hg: '         X  X  X  X  X           X  X  X  X  X           X  X  X  X  X  X     X  X              ',
				re: 'f        h  X     X  X  f        h  X     X  X  f        h  X     X  X  X     X  X              ',
				ca: '.  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  .  .  .  .  X  .  X  X  X  .  X  X  .  .        ',
				ta: '      X  X        X        X     X        X           X  X        X        X     X              ',
				ag: 'o     a  a  a     o  o     a     a  a     o  o  o     a  a  a     o  o      a   a   a   a   a   ',
				ch: 'X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .  X     X  X              '
			},
			"Break 1": {
				lg: '        X XX            X XX          X X     X X   X   X XX    ',
				mg: '        X XX            X XX          X X     X X   X   X XX  X ',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: 'o aaa oo      o o aaa oo      o o aaa   o aaa   o aao aao       ',
				ch: '@lg'
			},
			"Break 2": {
				lg: '        X XX            X XX        X XX    X XX        X XX    ',
				mg: '        X XX            X XX        X XX    X XX        X XX  X ',
				hg: '@lg',
				re: '@lg',
				ca: '....X.XXX.XX........X.XXX.XX........X.XX....X.XX....X.XXX.XX    ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Break 3": {
				lg: 'X XX    X XX    X XXX XXX XX    ',
				mg: 'X XX    X XX    X XXX XXX XX  X ',
				hg: '@lg',
				re: '      X       X X XXX XXX XX    ',
				ca: '@re',
				ta: '@re',
				ag: '      X       X o aoo aoo oo  a ',
				ch: '@re'
			},
			"Bongo Break 1": {
				loop: true,
				lg: 'X   X   X   X   X   X   X XX    ',
				mg: '@lg',
				hg: '@lg',
				re: '   X  X  X X  X    X  X       X ',
				ca: '@re',
				ta: '@re',
				ag: 'o  ao a oa ao a o  ao a o oo  a ',
				ch: '@re'
			},
			"Bongo Break 2": {
				loop: true,
				lg: 'X   X   X   X   X   X   X XX  X ',
				mg: '@lg',
				hg: '@lg',
				re: 'X XX XX X XX XX X XX XX       X ',
				ta: '@re',
				ag: 'o  ao a oa ao a o  ao a o oo  a ',
				ch: '@re'
			},
			"Monkey Break": {
				ot: '(  (  ( )  )  ) '
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Bongo Break 1", "Bongo Break 1", "Bongo Break 2", "Bongo Break 2", "Monkey Break", "Tune", "Tune"]
	},
	'Custard': {
		categories: [ "common", "medium", "cultural-appropriation" ],
		sheet: sheetUrl + "custard.pdf",
		descriptionFilename: "custard",
		patterns: {
			Tune: {
				loop: true,
				lg: '0   X   0   X X ',
				mg: 'X   0   X   0   ',
				hg: 'X X 0   XX X0   ',
				re: '  XX  XX  XX  XX',
				ca: 'X.X.X..X.X..X...',
				ta: 'X X XX X X X XX ',
				ag: 'a a oo a a o oo ',
				ch: '................'
			},
			'Break 1': {
				lg: repeat(3, 'X X XX          ') + 'X X XX X X X XX ',
				mg: '@lg',
				hg: '@lg',
				re: repeat(3, '       X X X XX ') + 'X X XX X X X XX ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 2': {
				lg: repeat(3, '       X X X XX ') + 'X X XX X X X XX ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@re',
				ta: repeat(3, 'X X XX          ') + 'X X XX X X X XX ',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 3' : {
				lg: repeat(4, 'X             X X               '),
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: repeat(3, 'X             X X               ') + 'X             X X.X.X..X.X..XXXX',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 3 (Agogô continues)' : {
				lg: repeat(4, 'X             X X               '),
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: repeat(3, 'X             X X               ') + 'X             X X.X.X..X.X..XXXX',
				ta: '@lg',
				ag: repeat(8, 'a a oo a a o oo '),
				ch: '@lg'
			},
			'Break 5': {
				lg: '              X X             X X     X X     X X   X   X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: 'X.X.X..X.X..X     X.X..X.X..X     X X     X X     X   X   X   X ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Singing Break': {
				ot: '4 3 21 C H I M# '
			}
		},
		exampleSong: ["Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3 (Agogô continues)", "Tune", "Tune", "Tune", "Tune", "Break 5", "Tune", "Tune", "Tune", "Tune", "Singing Break"]
	},
	'Drum&Bass': {
		categories: [ "common", "medium", "western" ],
		sheet: sheetUrl + "drum-bass.pdf",
		descriptionFilename: "drum-bass",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/f5331b5e-5de7-41e9-af0f-813f874bb074",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X         X  X  X         X     X         X  X  X         X     ',
				mg: '      XXXX            XXXX            XXXX            XXXX      ',
				hg: '    X       X       X       X       X       X       X       X   ',
				re: '    X  X X XX XX    X       X       X  X X XX XX    X       X   ',
				ca: '....X..X....X.......X..X....X   ....X..X....X...X.X.X.X.X.X.X.X.',
				ta: '    X     X X       X   X X X       X     X X       X   X X X   ',
				ag: 'o ao ao a       o ao ao a       o ao ao a       o ao ao a       ',
				ch: '................................................................'
			},
			'Break 1': {
				displayName: 'Dance Break',
				time: 2,
				ot: 'TUVWY Z '
			},
			'Break 2': {
				lg: 'X  X X  X  X X  X  X X          ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X   X   X   X   X XXXX    ',
				ca: '@re',
				ta: '  X   X   X   X   X   X         ',
				ag: '@ta',
				ch: '@ta'
			},
			'Break 3': {
				lg: 'X     X   X  X  X     X   X  X  X     X   X  X  ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Hip-Hop Break': {
				lg: 'X  X     X X    X  X   X X X  X X  X     X X                    X  X     X X    X  X   X X X  X X  X     X X                    ',
				mg: '@lg',
				hg: '@lg',
				re: '    X       X       X       X       X       X   Xr Xr Xr Xr XXrr    X       X       X       X       X       X                   ',
				ca: '    X       X       X       X       X       X                       X       X       X       X       X       X     X   X   X   X ',
				ta: '    X       X       X       X       X       X                       X       X       X       X       X       X                   ',
				ag: '@ta',
				ch: '@ta'
			}
		},
		exampleSong: [ "Tune", "Break 2", "Tune", "Break 3", "Break 1", "Tune", "Hip-Hop Break", "Tune" ]
	},
	'Drunken Sailor': {
		categories: [ "uncommon", "medium", "western" ],
		sheet: sheetUrl + "drunken-sailor.pdf",
		descriptionFilename: "drunken-sailor",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/00dd3ac1-a872-49ea-aec1-8c8ebc8f334e",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X   X   X X     X   X   X X     X   X   X X             X   X   ',
				mg: 'X   X   X   X   X   X   X   X   X   X   X   X       X X         ',
				hg: 'X   X   X     X X   X   X     X X   X   X     X X X             ',
				re: 'f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r f XrX XrX f X r ',
				ca: 'X..XX..XX.......X..XX..XX.X.X.X.X..XX..XX.......X..XX..XX.X.X.X.',
				ta: 'XX      X X X   XX      X X X   XX      X X X   XX      X X X   ',
				ag: 'o oao oao o a o o oao oao o a o o oao oao o a o o oao oao o a o ',
				ch: '................................................................'
			},
			'Break 1': {
				lg: 'X X XX  X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 2': {
				lg: 'X   X   X   XXX ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X   X XXX ',
				ca: '@re',
				ta: '@re',
				ag: '@re'
			},
			'White Shark': {
				lg: 'X               X       X               X       X       X       X   X   X   X   X   X   X   X   X   X   X   X   X       X       ',
				mg: '@lg',
				hg: '@lg',
				re: '   X               X       X               X       X       X      X   X   X   X   X   X   X   X   X   X   X   X   X     X       ',
				ca: '@re',
				ta: '@re',
				ag: '                                                                                ooa         ooa ooa         ooa                 '
			}
		},
		exampleSong: [ "Tune", "Break 1", "Tune", "Break 2", "Tune", "White Shark", "Tune" ]
	},
	"Flip Flop": {
		categories: ["new", "uncommon", "medium"],
		descriptionFilename: "flip-flop",
		patterns: {
			Tune: {
				loop: true,
				lg: "X r X  rX r X  rX r X  rX r X  r",
				mg: "  X    X  X    X  X    X  X XXXX",
				hg: "@mg",
				re: "X  XX  XX  XX  XX  XX  XXX XX  X",
				ca: "...XX.X ...XX.X....XX.XX X XX.X.",
				ta: "               XX X XX X X XX X ",
				ag: "o a oa o a oao                  ",
				ch: "X X X X X X X X X X X X X X X X ",
			},
			"Break 1": {
				lg: "        XXXXX   ",
				hg: "XXXXX           ",
				ag: "aaaaa  aooooo  o"
			},
			"Break 2": {
				lg: "X  X    X  X    X  X   X   X    ",
				mg: "@lg",
				hg: "@lg",
				re: "    XX      XX      XX   X  XXXX",
				ca: "@re",
				ta: "@re",
				ag: "    oo      oo      oo   o  oooo",
				ch: "@re"
			},
			"Break 3": {
				ag: "o a oa oa  oao aa a oao a  oao o"
			},
			"Ping Pong Break": {
				lg: "X XX  X X XX  X",
				mg: "@lg",
				hg: "@lg",
				re: "    XX X    XX X",
				ca: "@re",
				ta: "@re",
				ag: "    oo o    oo o",
				ch: "@re"
			},
			"Kick back": {
				loop: true,
				lg: "X   X   X   X   ",
				mg: "@lg",
				hg: "@lg",
				re: "   X  X    X  X ",
				ca: "@re",
				ta: "@re",
				ag: "  ao  a  aaa  a ",
				ch: "@re"
			},
			"Call Break": {
				lg: "   XX r    XX r    XXrr    XX r ",
				mg: "@lg",
				hg: "@lg",
				re: "f     rf f    rf     rrf f    r ",
				ca: "@re",
				ta: "@re",
				ag: "   oo r    oo r    oorr    oo r ",
				ch: "   XX      XX      XX      XX   "
			}
		},
		exampleSong: ["Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Ping Pong Break", "Tune", "Tune", "Kick back", "Kick back", "Kick back", "Kick back", "Tune", "Tune", "Call Break", "Tune", "Tune"]
	},
	'Funk': {
		categories: [ "common", "onesurdo", "easy" ],
		sheet: sheetUrl + "funk.pdf",
		descriptionFilename: "funk",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X  X  X X X     X  X  X X       ',
				mg: '@lg',
				hg: '@lg',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				ca: '....X.......X.......X.......X...',
				ta: '    X       X X     X     X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			"Break 1": {
				lg: 'X X     X X   X X X     X       X X     X X   X X X     X       ',
				mg: '@lg',
				hg: '@lg',
				re: '    X X     X       X X   X   X     X X     X       X X   XXX   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			"Break 2": {
				lg: 'X X X X X X X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: 'o o o o o o o o ',
				ch: '@lg'
			},
			"Tune (Variant 1)": {
				lg: 'X       X X   X X       X       ',
				mg: '@lg',
				hg: '@lg',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				ca: '....X.......X.......X.......X...',
				ta: '    X       X X   XXX   X X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			"Tune (Variant 2)": {
				lg: 'X X     X X   X X X     X       ',
				mg: '@lg',
				hg: '@lg',
				re: 'f  hf  hf  hf  hf  hf  hf  hXhrh',
				ca: '....X.......X.......X.......X...',
				ta: '    X       X X     X     X X   ',
				ag: 'o  a  o   a a a o  a  o   a a a ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Hafla': {
		categories: [ "common", "tricky" ],
		sheet: sheetUrl + "hafla.pdf",
		descriptionFilename: "hafla",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/2fbb7d46-3399-4818-89aa-a5dc0b377238",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X       X       X X     X       ',
				mg: '  X   X     X         X     X   ',
				hg: '    X   X   X       X   X   X   ',
				re: 'r X   X r   X   r X XXr r   X XX',
				ca: '..X...X.....X.....X.XXX.....X.XX',
				ta: 'X X   X X   X XXX X   X X   X   ',
				ag: 'o a   a o   a     a   a o   a   ',
				ch: '................................'
			},
			'Yala Break': {
				lg: 'X X   X X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Kick Back 1': {
				loop: true,
				lg: 'X       X       X       X       X       X       X       X       ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X     X     X   X     X     X   X     X     X   X     X   ',
				ca: '@re',
				ta: '@re',
				ag: 'a a aaa a aaa aaa a aaa a aaa aao o ooo o ooo ooo o ooo o ooo oo',
				ch: '@re'
			},
			'Kick Back 2': {
				loop: true,
				lg: 'X       X       X       X X     ',
				mg: '@lg',
				hg: '@lg',
				re: '   X  X    X  X    X  X     X   ',
				ca: '   X  X    X  X    X  X     X ..',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 3': {
				lg: '    X       X       X X     X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: 'XXXX            XXXX    XXXX    ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Hook Break': {
				lg: 'X X     X       X       X X     X   X   X   X   X       X       ',
				mg: '@lg',
				hg: '@lg',
				re: '   XXX    XXX XX  XXXXX     X XX  XX  XX  XX  XX  X   X     X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Yala Break", "Tune", "Tune", "Break 3", "Tune", "Tune", "Hook Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Tune", "Tune", "Kick Back 2", "Kick Back 2", "Tune", "Tune" ]
	},
	'Hedgehog': {
		categories: [ "uncommon", "easy" ],
		sheet: sheetUrl + "hedgehog.pdf",
		descriptionFilename: "hedgehog",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/fgvBGKSd2QasSYmASbAtPb",
		patterns: {
			Tune: {
				loop: true,
				lg: 's  X    s  X    s  X    X X X X ',
				mg: '      XX      XX      XX      XX',
				hg: '   X  X    X  X    X  X   X   X ',
				re: 'r  X  X r  X  X r  X  X r X r X ',
				ca: 'X..X..X.X..X..X.X..X..X.X...X...',
				ta: 'X  X    X  X    X  X    X X X   ',
				ag: 'o  a  a o  a  a o  a  a o a o a ',
				ch: '................................'
			},
			'Break 1': {
				lg: 'X   X   X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: 'r  X  X r X r X ',
				ca: 'X..X..X.X...X...',
				ta: 'X  X    X X X   ',
				ag: 'o  a  a o a o a ',
				ch: 'XXXXXXXXXXXXXXXX'
			},
			'Break 2': {
				lg: 'X               ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ot: '        R   S   '
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Hip Hop': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "hiphop.pdf",
		descriptionFilename: "hiphop",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X X    X  X     X X    X  X   s ',
				mg: 'X X    X        X X    X        ',
				hg: 'X X      XX     X X      XX     ',
				re: 'f   X       X   f   X       X h ',
				ca: 'XX..X..X....X...XX..X..X....X...',
				ta: '    X  X  X X       X    XX X   ',
				ag: 'o o a  o  o a   o o a    oo a   ',
				ch: 'X...X...X...X...X...X...X...X...'
			},
			'Kick Back 1': {
				loop: true,
				lg: 'X      X  X     ',
				mg: '@lg',
				hg: '@lg',
				re: '    X       X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Kick Back 2': {
				loop: true,
				lg: 'X X    X XX     ',
				mg: '@lg',
				hg: '@lg',
				re: '    X       X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 1': {
				lg: 'X      X X X    ',
				mg: '@lg',
				hg: '@lg',
				re: '    X       X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Kick Back 2", "Kick Back 2", "Tune", { patternName: "Tune", length: 4 }, "Break 1", "Tune", "Tune" ]
	},
	'Jungle': {
		categories: [ "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "jungle.pdf",
		descriptionFilename: "jungle",
		patterns: {
			Tune: {
				loop: true,
				lg: '    X       X X     X       X X ',
				mg: 'XXXX    XX      XXXX    XX      ',
				hg: ' X    X  X    X  X    X  X    X ',
				re: ' f  r X  f  r X  f  r X  f  r X ',
				ca: 'XX..X...XX..X...XX..X..X.X..X...',
				ta: 'X  X    X  X  X X  X    X  X  X ',
				ag: 'ooo a o aa  o   aaa   o aa  o   ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			'Break 1': {
				lg: 'XXX             XXX X           XXX             XXX X X XX  X   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '      o aa  o         o aa  o         o aa  o   ooo o o oo  o   ',
				ch: '@lg'
			},
			'Break 2': {
				lg: 'X  XX X X  XX X ',
				mg: 'X  XX X X  XX   ',
				hg: '@mg',
				re: '@mg',
				ca: '@mg',
				ta: '@mg',
				ag: '@mg',
				ch: '@mg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Kaerajaan': {
		categories: [ "new", "uncommon", "medium", "onesurdo", "western" ],
		sheet: sheetUrl + "kaerajaan.pdf",
		descriptionFilename: "kaerajaan",
		patterns: {
			Tune: {
				loop: true,
				lg: "X   0 X X   0 X X   0 X X   X",
				mg: "@lg",
				hg: "@lg",
				re: "  XX  X   XX  X   XX  X f X X",
				ca: "....X.......X.......X.......X...",
				ta: "X X X   X X X   X X XX XX   X",
				ag: "a a o  oa a o  oa a a a o   o  o",
				ch: "@ca"
			},
			"Break 1": {
				lg: "X X X   X X X   X X XX XX    ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "a a o   a a o   a a aa ao    ",
				ch: ". . .   . . .   . . .. ..    ",
				ot: "                            F"
			},
			'Break 2': {
				lg: '                X X XXX X X X                   X X XXX   X X   ',
				mg: '@lg',
				hg: '@lg',
				re: 'X   X  XX X X                   X   X  XX X X                   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Karla Shnikov': {
		categories: [ "common", "onesurdo", "easy" ],
		sheet: sheetUrl + "karla-shnikov.pdf",
		descriptionFilename: "karla-shnikov",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/cc4d0222-3713-4943-bba1-cc733cb84ccc",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X   0 XX    0   X   0 XX    0   X   0 XX    0   X   0 XX X XX X ',
				mg: '@lg',
				hg: '@lg',
				re: 'X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X X  XX  X X XX X ',
				ca: '....X.......X.......X.......X.......X.......X.......X.......X...',
				ta: '    X       X       X  X X XX       X       X       X  X X XX   ',
				ag: 'o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o o  oa o ',
				ch: '................................................................'
			},
			'Break 2': {
				lg: 'XXXXXXXXXXXXXXXXX   X   X   X   X X    X X      X X    X X      ',
				mg: '@lg',
				hg: '@lg',
				re: 'XXXXXXXXXXXXXXXXX   X   X   X       X      XXXX     X      XXXX ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 2 Inverted': {
				lg: 'XXXXXXXXXXXXXXXXX   X   X   X   X X    X X      X X    X X      X X    X X      X X    X X      X   X   X   X   XXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: 'XXXXXXXXXXXXXXXXX   X   X   X       X      XXXX     X      XXXX     X      XXXX     X      XXXX X   X   X   X   XXXXXXXXXXXXXXXX',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Break 2", "Tune", "Break 2 Inverted", "Tune" ]
	},
	"Keep Moving": {
		categories: ["new", "uncommon", "tricky"],
		descriptionFilename: "keep-moving",
		patterns: {
			Tune: {
				loop: true,
				lg: "    X       X       X       X       X       X       X       X X ",
				mg: "XXX     XXX     XXX     X X X  XXXX     XXX     XXX     X X X   ",
				hg: "      X       X       X XXXXX X       X       X       X XXXXXXX ",
				re: "f   XXX f XXX X f   XXX f XXX   f   XXX f XXX X f   XXX f XXX   ",
				ca: "X..X..X.X..X..X.X..X..X.X...X...X..X..X.X..X..X.X..X..X.X...f   ",
				ta: "X  XX X X  XX X X  XX X X  XX   X  XX X X  XX X X  XX X X       ",
				ag: "a o a oa o aa a a o a oa o aa   a o a oa o aa a a o a oaooooa   ",
				ch: "X..X..X.X..X..X.X..X..X.X...X...X..X..X.X..X..X.X..X..X.X...X   "
			},
			"Break 1": {
				lg: "XXX   X XXX   X XXX   X X XXX   ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "X...........................f   ",
				ta: "@lg",
				ag: "aaa   o aaa   o aaa   o a ooa   "
			},
			"Break 2": {
				lg: "    X X     X X     X X     X X ",
				mg: "@lg",
				hg: "@lg",
				re: "XXX     XXX     XXX     XX Xf   ",
				ca: "@re",
				ta: "XXX     XXX     XXX     XX XX   ",
				ag: "a o a oa o aa a a o a oa o aa   "
			},
			"Washing Machine Break": {
				lg: "X       X  X X  X       X  XXXX X       X  X X  X       X  XXXX ",
				mg: "@lg",
				hg: "@lg",
				re: "X   X       X  XX   X           X   X       X  XX   X   X       ",
				ca: "............................................................... ",
				ta: "@re",
				ag: "o   o       a  ao   o          oo   o       a  ao   o   a      a",
				ch: "@re"
			}
		},
		exampleSong: ["Tune", "Break 1", "Tune", "Break 2", "Tune", "Washing Machine Break", "Tune"]
	},
	'Malkhas Akhber': {
		categories: [ "new", "uncommon", "tricky" ],
		sheet: sheetUrl + "malkhas-akhber.pdf",
		descriptionFilename: "malkhas-akhber",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/8wp31sH88dMbxHKxSXGAKM",
		patterns: {
			Tune: {
				loop: true,
				"lg": "X       X       X       X       ",
				"mg": "   XX X    XX X    XX X    XX X ",
				"hg": "@mg",
				"re": "                  Xr Xr   rXrh  ",
				"ca": "ff.X..X.ff.X..X.ff.X..X.ff.X..X.",
				"ta": "                        X X X X ",
				"ag": "  ooo o aoaoaoa                 "
			},
			"Hey Break": {
				displayName: "Hey! Break",
				"lg": "XX  r           ",
				"mg": "@lg",
				"hg": "@lg",
				"re": "@lg",
				"ca": "@lg",
				"ta": "@lg",
				"ag": "oo  r           ",
				"ch": "XX              ",
				"ot": "        F       "
			}
		},
		exampleSong: ["Tune", "Tune", "Hey Break", "Tune", "Tune"]
	},
	'March for Biodiversity': {
		categories: [ "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "march-for-biodiversity.pdf",
		descriptionFilename: "march-for-biodiversity",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X X X X XXX XXX X X X X XXX XXX X X X X XXX XXX X X X X X   X   ',
				mg: 's s s s         s s s s         s s s s         s s s s X   X   ',
				hg: '        XXX XXX         XXX XXX         XXX XXX         X   X   ',
				re: 'f r   rrf r  r  f r   rrf r  r  f r   rrf r  r  f r   rrf X  s  ',
				ca: '. . X . . . X . . . X . . . X . . . X . . . X . . . X . . . X . ',
				ta: '    X  X  X XX  X  X  X  XX XXX     X  X  X XX  X  X  X  XX XXX ',
				ag: 'o   o   o a aa  o a aa  o   o   a   a   a o oo  o o o o o   a   ',
				ch: '. . X . . . X . . . X . . . X . . . X . . . X . . . X . . . X . '
			},
			Intro: {
				lg: 's   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s   s        X X XX ',
				mg: '                               X   X   X   X   X   X   X   X   X   X   X   X   X         X X XX ',
				hg: '                             X   X   X   X   X   X   X   X   X   X   X   X   X   X       X X XX ',
				re: '  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX  zX         X X XX ',
				ca: '                                                         f   f   f   f   f   f   f ....X X X XX ',
				ta: '                                                        X   X   X   X   X   X   X        X X XX ',
				ag: '                                                aao         aao             aao          a a aa '
			},
			'Break 1': {
				lg: 'rrr X XXr rrX   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: 'rrr o oor rro a '
			},
			'Break 2': {
				lg: 'X X X X X       ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '          F     '
			}
		},
		exampleSong: ['Intro', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune']
	},
	'Menaiek': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "menaiek.pdf",
		descriptionFilename: "menaiek",
		patterns: {
			Tune: {
				loop: true,
				time: 12,
				lg: stretch(4, 12, 'X   s X X   s X X   s X X   s X '),
				mg: stretch(4, 12, '    s   X         s     X   X   '),
				hg: stretch(4, 12, 'X   s         X   s         X   '),
				re: stretch(4, 12, 'rrX s   f  f  f       Xhr Xhr Xh'),
				ca: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
				ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
				ag: stretch(4, 12, 'o   a   o     o   a   o o   o   '),
				ch: stretch(4, 12, 'X..XX..XX..XX..XX..XX..XX..XX..X')
			},
			"Break 1": {
				lg: 'X X X XX X XX X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Break 2": {
				lg: repeat(3, '                      XXX XX  XX'),
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: repeat(3, 'o   a   o     o                 ') + 'o a o  o a oo o                 ',
				ch: '@lg'
			},
			"Double Break": {
				time: 12,
				lg: repeat(2, stretch(4, 12, 'X hXX hXX hXX hX')),
				mg: repeat(2, stretch(4, 12, '  s X    s  X X ')),
				hg: repeat(2, stretch(4, 12, 'X s    X s    X ')),
				re: stretch(4, 12, 'rrX s   f  f  f       Xhr Xhr Xh'),
				ca: stretch(4, 12, 'X..XX..XX..XX.X.X..XX..XX...X.X.'),
				ta: stretch(4, 12, 'X   X XXX X   f       f     ') + stretch(3, 12, 'XXX'),
				ag: repeat(2, stretch(4, 12, 'o a o  o a oo oa')),
				ch: stretch(4, 12, 'X..XX..XX..XX..XX..XX..XX..XX..X')
			},
			"Kick Back 1": {
				loop: true,
				time: 12,
				lg: stretch(4, 12, 'X   X  X   XX X '),
				mg: '@lg',
				hg: '@lg',
				re: stretch(4, 12, '  X       X ') + stretch(3, 12, 'XXX'),
				ca: '@re',
				ta: '@re',
				ag: stretch(4, 12, 'oaaoaaoa        '),
				ch: '@re'
			},
			"Mozambique Break": {
				lg: '   h  0    h  0 ',
				mg: '@lg',
				hg: '@lg',
				re: 'r r rr r rr rr r',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: 'X X XX X XX XX X'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Double Break", "Tune", "Tune", "Mozambique Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Kick Back 1", "Tune", "Tune" ]
	},
	'No Border Bossa': {
		categories: [ "uncommon", "onesurdo", "medium" ],
		sheet: sheetUrl + "no-border-bossa.pdf",
		descriptionFilename: "no-border-bossa",
		patterns: {
			Tune: {
				loop: true,
				upbeat: 2,
				lg: 's s   h X X   h s s   h X X X h s s   h X X   h s s   h X   X h s ',
				mg: '@lg',
				hg: '@lg',
				re: '    X r   fh fh f   X r   fh fh f   X r   fh fh f   X r   fh fh f ',
				ca: '  X..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..XX..X',
				ta: '    X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X ',
				ag: '  a a . o o o . a a a . o o o . a a a . o o o . a a a . o o o . a ',
				ch: '@ca'
			},
			'Break 1': {
				lg: '  X X   X  X  X   X X   XX XX   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 2': {
				upbeat: 2,
				lg: 's s     s s     s s     s s     s ',
				mg: '@lg',
				hg: '@lg',
				re: '    X r   fh fh f   X r   fh fh f ',
				ca: '  X..XX..XX..XX..XX..XX..XX..XX..X',
				ta: '    X X   X  X  X   X X   X  X  X ',
				ag: '  a a . o o o . a a a . o o o . a ',
				ch: '@ca'
			},
			'Break 2*': {
				upbeat: 2,
				lg: 's s     s s     s s     s s     s ',
				mg: '@lg',
				hg: '@lg',
				re: '    X r   fh fh f   X r   fh fh f ',
				ca: '  X..XX..XX..XX..XX..XX..XX..XX..X',
				ta: '    X X   X  X  X   X X   X  X  X ',
				ag: '  a a . o o o . a a a . o o o . a ',
				volumeHack: {
					lg: crescendo(32),
					mg: crescendo(32),
					hg: crescendo(32)
				}
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: '                        XX XX   ',
				mg: '@lg',
				hg: '@lg',
				re: 'X X X   X  X  X   X X           ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Break 1", "Tune", "Bra Break", "Tune" ]
	},
	'Norppa': {
		categories: [ "new", "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "norppa.pdf",
		descriptionFilename: "norppa",
		patterns: {
			Tune: {
				loop: true,
				lg: "X   X   X   X   ",
				mg: "      X        X",
				hg: "  X       X     ",
				re: "  X   X   X  f r",
				ca: "..X...X...X..X.X",
				ta: " X   X   X XX  X",
				ag: "   a    a  a   a"
			},
			'Break 1': {
				lg: "        X       ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "X.X.X.X.X       ",
				ta: "@lg",
				ag: "        o       ",
				ot: "            F   "
			},
			'Break 2': {
				lg: " X X X X X X X XX X X X X       ",
				mg: "                X X X X X       ",
				hg: "X X X X X X X X X X X X X       ",
				re: "        r r r r rrrrXXXXX       ",
				ca: "        . . . . X.X.XXXXX       ",
				ta: "            X X X X X X X       ",
				ag: "                           ooooo",
			},
			'Break 3': {
				lg: "X X X X X X X X ",
				mg: "    X X X X X X ",
				hg: "      X X X X X ",
				re: "        X X X X ",
				ca: "          X X X ",
				ta: "            X X ",
				ag: "              o "
			},
			'Call break': {
				lg: "X               ",
				mg: "@lg",
				hg: "@lg",
				re: "        X       ",
				ca: "@re",
				ta: "@re",
				ag: "        o       ",
				ot: "    F       F   ",
			},
			'Shouting break': {
				displayName: 'Shouting break (replace with own shout)',
				lg: "X            XX ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "a            aa ",
				ch: "@lg",
				ot: "  '  =Å \\ l     ",
			},
			'Break 5': {
				lg: "X           XXXX",
				mg: "X            XXX",
				hg: "X             XX",
				re: "X              X",
				ca: "X               ",
				ta: "X XXXX         X",
				ag: "o      a        ",
				ch: "X               "
			}
		},
		exampleSong: ['Tune', 'Tune', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 3', 'Tune', 'Tune', 'Tune', 'Tune', 'Call break', 'Tune', 'Tune', 'Tune', 'Tune', 'Shouting break', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 5', 'Tune', 'Tune', 'Tune', 'Tune']
	},
	'Nova Balanca': {
		displayName: "Nova Balança",
		categories: [ "uncommon", "medium" ],
		sheet: sheetUrl + "nova-balanca.pdf",
		descriptionFilename: "nova-balanca",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X  X            ',
				mg: '     XX       X ',
				hg: '        X  X    ',
				re: 'XX  X       X   ',
				ca: '....X...XX..X...',
				ta: 'X  XX X X  XX X ',
				ag: 'o  oa o o  oa o ',
				ch: '................'
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: '    X     X         X     X     ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: 'XXXXX XXXXX     XXXXX XXXXX     ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 1': {
				lg: 'X X X X X X X X ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: crescendo(16)
			},
			'Break 2': {
				lg: 'X X X X XX XX X ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X  X X  X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune" ]
	},
	'Orangutan': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "orangutan.pdf",
		descriptionFilename: "orangutan",
		patterns: {
			Tune: {
				loop: true,
				lg: '    XXXX    XXXX',
				mg: 'X XX        XXXX',
				hg: '        X XX    ',
				re: 'X rrX rr rrrX r ',
				ca: '..XX..XX..XX..XX',
				ta: '  XX XX   XX XX ',
				ag: 'oa  o aa o  a oo',
				ch: '@ca'
			},
			"Funky gibbon" : {
				lg: 'X   X   X  XX X XX              X   X   X  XX X X               ',
				mg: '@lg',
				hg: '@lg',
				re: '  r   r   r   r   r   r   r   r   r   r   r   r   r   r   r   r ',
				ca: '..X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X.',
				ta: '@re',
				ag: '@re',
				ch: '  X   X   X   X   X   X   X   X   X   X   X   X   X   X   X   X '
			},
			"Monkey break" : {
				lg: '  XX XX   XX XX ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: 'G       G       '
			},
			"Break 2": {
				lg: 'X   X       X   ',
				mg: '@lg',
				hg: '@lg',
				re: '  XX  XX XXX  X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Monkey break", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Funky gibbon", "Funky gibbon", "Tune", "Tune", "Tune", "Tune" ]
	},
	'Pekurinen': {
		categories: [ "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "pekurinen.pdf",
		descriptionFilename: "pekurinen",
		patterns: {
			Tune: {
				loop: true,
				lg: '    X       X X     X     X     ',
				mg: 'X       X       X       X       ',
				hg: 'X       X       X       X     X ',
				re: 'f XXX X XXX X XXf XXX X fXX X   ',
				ca: 'X...X.X..X..X.X.X...X.X..X..X...',
				ta: 'X XX  X XX  X XX  X XX   XX   X ',
				ag: 'a  o  a   o   a a  o  a  aa o   ',
				ch: '................................'
			},
			'Break 1': {
				lg: '        X X X   ',
				mg: '@lg',
				hg: '@lg',
				re: 'X XX Xf X X X   ',
				ca: '@lg',
				ta: '@lg',
				ag: '        o o o a ',
				ch: '@lg'
			},
			'Break 2': {
				lg: '                        X X X   ',
				mg: '@lg',
				hg: '@lg',
				re: '  XX XX   XX XX   XX XX X X X   ',
				ca: '@re',
				ta: '@re',
				ag: 'a       a       a       a a a   ',
				ch: '@re'
			},
			'Break 3': {
				lg: '                                                X X X X X   X   ',
				mg: '        XXX XXX         XXX XXX         XXX XXX             X   ',
				hg: '@mg',
				re: '@mg',
				ca: '@mg',
				ta: 'X X X X         X X X X         X X X X                     X   ',
				ag: '@mg',
				ch: '@mg'
			},
			'Clave Plus': {
				lg: 'X  X  X   XXX   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Disco Barricade Break': {
				lg: '                X  X  X   XXX   ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: 'İ Ǐ İ Ǐ Ī ĨĮ Ĳ                  '
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: '                        X  X X  ',
				mg: '@lg',
				hg: '@lg',
				re: 'f XXXX r XXXX r X XX rr X  X X  ',
				ca: '@lg',
				ta: '       X      X      XX X  X X  ',
				ag: '       a      a      aa        a',
				ch: '@lg'
			}
		},
		exampleSong: ['Tune', 'Tune', 'Tune', 'Tune', 'Break 1', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 2', 'Tune', 'Tune', 'Tune', 'Tune', 'Break 3', 'Tune', 'Tune', 'Tune', 'Tune', 'Clave Plus', 'Tune', 'Tune', 'Tune', 'Tune', 'Disco Barricade Break', 'Tune', 'Tune', 'Tune', 'Tune', 'Bra Break', 'Tune', 'Tune', 'Tune', 'Tune']
	},
	'Police': {
		displayName: "Sound of da Police",
		categories: [ "new", "uncommon", "medium" ],
		sheet: sheetUrl + "sound-of-da-police.pdf",
		descriptionFilename: "police",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/a8253384-c3bb-4b9f-a50c-aa954288bb37",
		patterns: {
			Intro: {
				lg: "      XXXXXXX         XXX XXX   ",
				mg: "@lg",
				hg: "@lg",
				ot: "D  D            D  D            ",
			},
			Tune: {
				loop: true,
				lg: "X  X    s   s   X  X    s   s   ",
				mg: "      XXXXXXX         XXX XXX   ",
				hg: "@mg",
				re: "f hf hXhf h Xhrhf hf hXhf h Xhrh",
				ca: "X..X........X...X..X........X...",
				ta: "  XX  XX      XX  XX  XX      XX",
				ag: "a  a  a o a o   a  a  a o a o   ",
				ot: "D  D            D  D            ",
			},
			"Break 1": {
				lg: "X X X X X X X X ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "o o o o o o o o ",
			},
			"Break 2": {
				lg: "X  X            X  X            ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "a  a            a  a            ",
				ot: "D  D            D  D            ",
			},
			"Beast Break": {
				lg: "X  X            X  X            ",
				mg: "@lg",
				hg: "@lg",
				re: "      XXXXXXX         XXX XXX   ",
				ca: "@lg",
				ta: "@lg",
				ag: "      aaaaaaa         aaa aaa   ",
				ot: "D  D            D  D            ",
			},
			"Beast Break Inverted": {
				lg: "      XXXXXXX         XXX XXX   ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "a  a            a  a            ",
				ot: "D  D            D  D            ",
			},
		},
		exampleSong: ["Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Beast Break", "Tune", "Tune", "Beast Break Inverted"]
	},
	'Ragga': {
		categories: [ "common", "tricky" ],
		sheet: sheetUrl + "ragga.pdf",
		descriptionFilename: "ragga",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/bb2a4cd6-021b-4596-9917-f53bed8363a8",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X  X  0 X  X  0 X  X  0 X  X  0 ',
				mg: '0  X  X 0  X  X 0  X  X 0  X  X ',
				hg: '0     X 0     X 0     X 0     X ',
				re: '  X   X   X   X   X   X  XXX  X ',
				ca: '..XX..X...XX..X...XX..X...XX..X.',
				ta: '  X   X   X   X   X   X   XX  X ',
				ag: 'o a o a oa ao a o a  oooo a o   ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			'Kick Back 1': {
				loop: true,
				lg: 'X  X    X  X    X  X    X  X    ',
				mg: '@lg',
				hg: '@lg',
				re: '      X       X       X       X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Kick Back 2': {
				loop: true,
				lg: 'X  X X  X  X X  X  X X  X  X X  ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X   X   X   X   X   X   X ',
				ca: '@re',
				ta: '@re',
				ag: 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa',
				ch: '@re'
			},
			'Break 2': {
				lg: 'X           XXX ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 3': {
				lg: 'X  X  X         ',
				mg: '@lg',
				hg: '@lg',
				re: '        X  X  X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Zorro-Break': {
				loop: true,
				lg: 'X       X       X       X  X  X ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X   X   X   X   X  XXX  X ',
				ca: '..XX..X...XX..X...XX..X...XX..X.',
				ta: '  X   X   X   X   X   X   XX  X ',
				ag: 'o a o a oa ao a o a  oooo a o   ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Tune", "Tune", "Zorro-Break", "Zorro-Break", "Tune", "Tune" ]
	},
	'Rope Skipping': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "rope-skipping.pdf",
		descriptionFilename: "rope-skipping",
		patterns: {
			Tune: {
				loop: true,
				time: 12,
				lg: stretch(4, 12, repeat(2, 'XXXXXXXXX   X               X X ')),
				mg: stretch(4, 12, repeat(2, '  ss       XX     ss       XX   ')),
				hg: stretch(4, 12, repeat(2, '            X X XXXXXXXXX   X   ')),
				re: stretch(4, 12, repeat(2, 's XXf   s XXf   s XXf   XXX f   ')),
				ca: stretch(4, 12, repeat(2, '....X.......X.......X..XX..XX...')),
				ta: stretch(4, 12, 'X  XX   X  XX   X  XX  XX  XX   X  XX   X  XX   X  XX   ') + stretch(3, 12, 'XXX   '),
				ag: stretch(4, 12, repeat(2, 'a  aa  oo  oo a a  aa  oo  oo a ')),
				ch: stretch(4, 12, repeat(2, '................................'))
			},
			'Oh Shit': {
				lg: 'X               ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '        N   O   '
			},
			'Fuck Off': {
				lg: 'X               ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: '        P   Q   '
			},
			'Break 1': {
				lg: 'X      XX         X    XX       ',
				mg: '@lg',
				hg: '@lg',
				re: '    X     X         X     X X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 2': {
				lg: 'XX  XX  XX  X     XX  XX  XX    ',
				mg: '@lg',
				hg: '@lg',
				re: '  XX  XX  XX    XX  XX  XX  X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 3': {
				lg: 'X   X   X   X   ',
				mg: '@lg',
				hg: '@lg',
				re: ' XX  XX  XX     ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Küsel Break': {
				lg: 'X XXX X X X X                   ',
				mg: '@lg',
				hg: '@lg',
				re: '                X XXX X X X X   ',
				ca: 'X..XX..XX...X.X.X.X.X.X.X.X.X...',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Skipping Agogo': {
				displayName: "Skipping Agogô",
				ag: 'a  aaa aa  aaaoao  ooo oo  oooao'
			},
			'I like to move it': {
				loop: true,
				re: '                X   X   X   X   ',
				ag: 'o   o   o   o a           a   a '
			},
			'Eye of the tiger': {
				time: 12,
				lg: stretch(4, 12, '                                              X                 '),
				mg: stretch(4, 12, '           X               X               X                    '),
				hg: stretch(4, 12, 'X       X     X         X     X         X                       '),
				ca: stretch(4, 12, '................................................                '),
				ag: stretch(4, 12, '                                                ') + 'oaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoa'
			}
		},
		exampleSong: [ "Tune", "Tune", "Oh Shit", "Tune", "Tune", "Fuck Off", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Küsel Break", "Küsel Break", "Tune", "Tune", "Skipping Agogo", "Tune", "Tune", "I like to move it", "Tune", "Tune", "Eye of the tiger", "Tune", "Tune" ]
	},
	'Samba Reggae': {
		categories: [ "common", "medium", "cultural-appropriation" ],
		sheet: sheetUrl + "samba-reggae.pdf",
		descriptionFilename: "samba-reggae",
		patterns: {
			Tune: {
				loop: true,
				lg: '0   X   0   X X ',
				mg: 'X   0   X   0   ',
				hg: '0     X 0   XXXX',
				re: '  XX  XX  XX  XX',
				ca: 'X..X..X...X..X..',
				ta: 'X  X  X   X X   ',
				ag: 'o a a oo a aa o ',
				ch: '................'
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: '          X X             X X             X X                                                                 X ',
				mg: '          X X             X X             X X                                                                   ',
				hg: '@mg',
				re: 'f XX XX X       f XX XX X       f XX XX X                                                                       ',
				ca: '          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...',
				ta: '          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
				ag: '@mg',
				ch: '@mg'
			},
			'Break 1': {
				lg: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ',
				mg: '@lg',
				hg: '                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX',
				re: 'XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ',
				ca: '                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 2': {
				lg: '            XXXX            XXXX            XXXX            XXXX',
				mg: '@lg',
				hg: '@lg',
				re: 'X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 3': {
				lg: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ',
				mg: '@lg',
				hg: '                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX',
				re: '                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ',
				ca: 'X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...',
				ta: '                                X  X  X   X                     X  X  X   X                 X X             X X                 ',
				ag: '                                X  X  X   X                     X  X  X   X                 a a             a a                 ',
				ch: '                                X  X  X   X                     X  X  X   X                                                     '
			},
			'SOS Break': {
				lg: 'X       X       X       X       X       X       X       X     X ',
				mg: 'X       X       X       X       X       X       X       X       ',
				hg: '@mg',
				re: '  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Knock On The Door Break': {
				time: 12,
				lg: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Knock On The Door (Cut)': {
				time: 12,
				lg: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X               '),
				mg: '@lg',
				hg: '@lg',
				re: stretch(3, 12, 'X        XXX') + stretch(4, 12, 'X               X  X  X   X X X X X XX X X X XX '),
				ca: repeat(4, stretch(4, 12, 'X..XX..XX..XX..X')),
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Dancing Break': {
				lg: repeat(3, 'X  X   XX   X                   ') + 'X  X   XX   X                 X ',
				mg: repeat(4, 'X  X   XX   X                   '),
				hg: '@lg',
				re: repeat(4, '                X  X   XX   X   '),
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune" ]
	},
	"Samba Reggae High": {
		categories: [ "proposed", "cultural-appropriation" ],
		descriptionFilename: "samba-reggae-high",
		patterns: {
			Tune: {
				loop: true,
				lg: "0   X   0   X X ",
				mg: "X   0   X   0   ",
				hg: "0     X 0   XXXX",
				re: "  XX  XX  XX  XX",
				ca: "X..X..X...X..X..",
				ta: "X XX XXX  X  X  ",
				ag: "o a a oo a aa o ",
				ch: "................"
			},
			"Break 1": {
				lg: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX                   ",
				mg: "@lg",
				hg: "                X X XX XX                       X  X  X X                                  XX                              XX                              XX               XXXX",
				re: "XX XX XXXX XX                   XX XX XXXX XX                                              XX                              XX                              XX                   ",
				ca: "                X X XX XX                       X  X  X X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X..X..X.X..X..X.X..X..X.X       X  X  X   X     ",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Break 2": {
				lg: "            XXXX            XXXX            XXXX            XXXX",
				mg: "@lg",
				hg: "@lg",
				re: "X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Break 3": {
				lg: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X         ",
				mg: "@lg",
				hg: "                X  XX X XX XX X                 X  XX X XX XX X                 X  XX X X       X  XX X X       X  X  X     XXXX",
				re: "                                X  X  X   X                     X  X  X   X              fX X X          fX X X                 ",
				ca: "X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...X...",
				ta: "                                X  X  X   X                     X  X  X   X                 X X             X X                 ",
				ag: "                                X  X  X   X                     X  X  X   X                 a a             a a                 ",
				ch: "                                X  X  X   X                     X  X  X   X                                                     "
			},
			"Pickup": {
				hg: "            XXXX"
			},
			"Stop on 1": {
				lg: "X               ",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Tam Entrada": {
				time: 3,
				ta: "XXXXXXXXXXXX",
			},
			"Tam “Bossa Mess About”": {
				time: 12,
				ta: stretch(4, 12, "X  X  X   X  X  X  X  X  XX  X  X  X  X  XX XX  X  X  X ") + stretch(3, 12, "XXXXXX"),
			},
			"Tam “Little Turn” Groove": {
				ta: "X   XXXXX       X X XXXXX       X X X   XXXXX   XX XX   XXXXX   "
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Break 1", "Tune", "Tune", "Tune", "Tune", "Break 2", "Tune", "Tune", "Tune", "Tune", "Break 3", "Tune", "Tune", "Tune", "Tune", "Stop on 1" ]
	},
	"Samba Reggae Low": {
		categories: [ "proposed", "cultural-appropriation" ],
		descriptionFilename: "samba-reggae-low",
		patterns: {
			Tune: {
				loop: true,
				lg: "0   X   0   X   0   X   0   X   ",
				mg: "X   0   X   0   X   0   X   0   ",
				hg: "0     XX0     XX0     XX0 X XXXX",
				re: "  XX  XX  XX  XX  XX  XX  XX  XX",
				ca: "X..X..X...X.X...X..X..X...X.X...",
				ta: "X  X  X   X X   X  X  X   X X   ",
				ag: "o  a  o   a a   o  a  o   a a   ",
				ch: "................................"
			},
			"Bra Break": {
				displayName: "Call Break",
				lg: "          X X             X X             X X                                                                 X ",
				mg: "          X X             X X             X X                                                                   ",
				hg: "@mg",
				re: "f XX XX X       f XX XX X       f XX XX X                                                                       ",
				ca: "          X X             X X             X X                   X..X..X...X.X...X..X..X...X.X...X..X..X...X.X...",
				ta: "          X X             X X             X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   X  X  X   X X   ",
				ag: "@mg",
				ch: "@mg"
			},
			"SOS Break": {
				lg: "X       X       X       X       X       X       X       X     X ",
				mg: "X       X       X       X       X       X       X       X       ",
				hg: "@mg",
				re: "  XX XX   X X     XX XX   X X     XX XX   X X     XX XX   X X   ",
				ca: "@re",
				ta: "@re",
				ag: "@re",
				ch: "@re"
			},
			"Knock On The Door Break": {
				time: 12,
				lg: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
				mg: "@lg",
				hg: "@lg",
				re: "@lg",
				ca: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Knock On The Door (Cut)": {
				time: 12,
				lg: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
				mg: "X                                   X   X   X   X                                               X        X        X           X     X     X     X                                               ",
				hg: "@mg",
				re: "X                                   X   X   X   X                                               X        X        X           X     X     X     X     X     X  X     X     X     X     X  X     ",
				ca: "X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  X  .  .  X  ",
				ta: "@mg",
				ag: "@mg",
				ch: "@mg"
			},
			"Dancing Break": {
				lg: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                 X ",
				mg: "X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   ",
				hg: "@mg",
				re: "                X  X   XX   X                   X  X   XX   X                   X  X   XX   X                   X  X   XX   X   ",
				ca: "@re",
				ta: "@re",
				ag: "@re",
				ch: "@re"
			},
			"Pickup": {
				lg: "              X "
			},
			"Stop on 1": {
				lg: "X               ",
				hg: "@lg",
				re: "@lg",
				ca: "@lg",
				ta: "@lg",
				ag: "@lg",
				ch: "@lg"
			},
			"Fancy Tam Line": {
				ta: repeat(2, "X  X  X   X X   X  X  X   X X   ") + repeat(2, "X  X  X   X X XXX  X  X XXX X   ")
			},
			"Fancy Tam Line 2": {
				ta: repeat(2, "X  X  X         X  X  X         ") + repeat(2, "X  X  X   XXX XXX  X  X         ")
			}
		},
		exampleSong: [ "Tune", "Tune", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Tune", "Tune", "SOS Break", "Tune", "Tune", "Tune", "Tune", "Knock On The Door Break", "Knock On The Door (Cut)", "Tune", "Tune", "Tune", "Tune", "Dancing Break", "Tune", "Tune", "Tune", "Tune", "Stop on 1" ]
	},
	'Sambasso': {
		categories: [ "common", "onesurdo", "tricky" ],
		sheet: sheetUrl + "sambasso.pdf",
		descriptionFilename: "sambasso",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/f75a6a4e-121a-4170-aaf4-2e96a7eed95e",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X  tX t X  tX t X  tX t X  tX t ',
				mg: '@lg',
				hg: '@lg',
				re: 'X..X..X..XX..XX.X..X..X..XX..XX.',
				ca: 'X..X..X...X..X..X..X..X...X..X..',
				ta: ' X XX X XX XX  X X XXXX X  XX   ',
				ag: 'o  aa oo a oo a o  aa oo a oo a ',
				ch: 'X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.'
			},
			'Break 1': {
				lg: 'X  tX t XX XX   ',
				mg: '@lg',
				hg: '@lg',
				re: 'X..X..X.XX XX   ',
				ca: 'X..X..X.XX XX   ',
				ta: ' X XX X XX XX   ',
				ag: 'o  aa ooXX XX   ',
				ch: 'X X X X XX XX   ',
				ot: 'y w w           '
			},
			'Break 2': {
				lg: repeat(4, 'X X X X X       '),
				mg: '@lg',
				hg: '@lg',
				re: repeat(4, '          XX XX '),
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re',
				volumeHack: { 0: .1, 16: .4, 32: .7, 48: 1  }
			},
			'Intro': {
				upbeat: 1,
				lg: '         XX XX           XX XX           XX XX           XX XX                       X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   X                   X X X X XX X    X X   X X   ',
				mg: '@lg',
				hg: '@lg',
				re: 'fX X X          fX X X          fX X X          fX X X           X..X..X..X..ffffX                               X..X..X..X..ffffX                               X..X..X..X..ffffX                               X..X..X..X..ffffX                               ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Intro", "Tune", "Tune", "Break 1", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Sheffield Samba Reggae': {
		categories: [ "uncommon", "medium", "cultural-appropriation" ],
		sheet: sheetUrl + "sheffield-samba-reggae.pdf",
		descriptionFilename: "sheffield-samba-reggae",
		patterns: {
			Tune: {
				loop: true,
				lg: '    X X     XXXX    X X     XXXX    X X     XXXX    X X     XXXX',
				mg: 'X       X       X       X       X       X       X       X       ',
				hg: '    X X     X X     X X X X XXXX    X X     X X     X X X X XXXX',
				re: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
				ca: '@re',
				ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
				ag: repeat(4, '  a o o aa oa o '),
				ch: '................................................................'
			},
			'Intro': {
				lg: '                           XX X X             X X             X X             X XX X X X    X X ',
				mg: '@lg',
				hg: '@lg',
				re: 'X X X X X  XXXXXX X X X X          fXX X fXXX      fXX X fXXX      fXX X fXXX            fXX    ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Break 1': {
				loop: true,
				lg: 'X               X               X               X               ',
				mg: '@lg',
				hg: '@lg',
				re: 'X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..X..X..X...X..X..',
				ca: '@re',
				ta: 'X XX    X XX    X XX    X XX    X XX    X XX    X XXX XXX XX    ',
				ag: repeat(4, '  a o o aa oa o '),
				ch: '................................................................'
			},
			'Break 2': {
				lg: 'X               X             X X               X               ',
				mg: '@lg',
				hg: '@lg',
				re: 'XXrXXXrXXXrXX r XXrXXXrXXXrXX r XXrXXXrXXXrXXXrXX X X X fXX X X ',
				ca: '@re',
				ta: '  X   X   X   X   X   X   X   X   X   X   X   XXX X X X     X X ',
				ag: '@ta',
				ch: '@ta'
			},
			'Break 3': {
				lg: 'X  X  X         X  X  X         ',
				mg: '@lg',
				hg: '@lg',
				re: '        X  X  X         XXXXX X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Whistle Break': {
				loop: true,
				lg: 'X  XX  XXX XX   ',
				mg: '@lg',
				hg: '@lg',
				re: '  X   X   X   X ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Outro': {
				upbeat: 2,
				lg: 'X XX X X X      X X               ',
				mg: '@lg',
				hg: '@lg',
				re: 'X XX X X X fXXX X X               ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Intro", "Tune", "Break 1", "Tune", "Break 2", "Tune", "Break 3", "Tune", "Whistle Break", "Tune", "Outro" ]
	},
	'Tequila': {
		categories: [ "uncommon", "medium", "western" ],
		sheet: sheetUrl + "tequila.pdf",
		descriptionFilename: "tequila",
		patterns: {
			Tune: {
				loop: true,
				upbeat: 1,
				lg: 'X0 00 X 0 X     X0 00 X 0        ',
				mg: ' X XX   X        X XX   X        ',
				hg: '     X               X           ',
				re: '     X      hX       X    X XrXh ',
				ca: ' ....X.......X.X.....X.......X...',
				ta: '     X       X X     X       X   ',
				ag: ' a a o  a a ao o a a o  a        ',
				ch: ' ................................'
			},
			'Break 1': {
				lg: '                ',
				mg: '                ',
				hg: '                ',
				ag: 'ooooo o a       ',
				ot: '           uvx  '
			},
			'Break 2': {
				upbeat: 3,
				lg: 'X               X               X                  ',
				mg: ' XX       X      XX       X      XX       X        ',
				hg: '   X               X               X               ',
				ch: '   XXXXXXXX        XXXXXXXX        XXXXXXXX        '
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: repeat(3, '    X       X X '),
				mg: '@lg',
				hg: '@lg',
				re: repeat(3, 'X X    X X X    '),
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Break 1", "Tune", "Tune", "Bra Break", "Break 1", "Tune", "Tune" ]
	},
	'The Roof Is on Fire': {
		categories: [ "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "the-roof-is-on-fire.pdf",
		descriptionFilename: "the-roof-is-on-fire",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/1c318897-e3b7-436b-b319-4608774169e0",
		patterns: {
			Tune: {
				loop: true,
				lg: "        X       X       X   X   X ",
				hg: "    XXX     XXX     XXX     X   X ",
				re: "  X  X  X  XXXX   X X X X  XXXX   ",
				ca: "  ...XX.....X.X......XX.....X.X...",
				ta: "    X       X     X X X X   X     ",
				ag: "o a     o a     o a a a   a       ",
				ch: "  ................................",
				upbeat: 2
			},
			"Break 1": {
				lg: "    X X     X X             X     ",
				ot: "i l     i l     i l p $ % &       ",
				upbeat: 2
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: "                X     X X                       X     X X                       X     X X                       ",
				mg: "@lg",
				hg: "@lg",
				re: "X..X..X.X..X..X.                X..X..X.X..X..X.                X..X..X.X..X..X.                X  X  X X       ",
				ca: "@lg",
				ta: "@lg",
				ag: "                o     o a  a  a                 o     o a  a  a                 o     o a  a  a                 ",
				ch: "@lg",
				ot: "                                                                                                            '   "
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Bra Break", "Tune", "Tune" ]
	},
	'The Sirens of Titan': {
		categories: [ "uncommon", "medium" ],
		time: 3,
		speed: 120,
		sheet: sheetUrl + "the-sirens-of-titan.pdf",
		descriptionFilename: "the-sirens-of-titan",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X  X              X  X        X  X        XXXX  ',
				mg: '            X  X        X  X                    ',
				hg: '      XXXX                          X  X        ',
				re: repeat(4, 'X  X  X XX  '),
				ca: repeat(4, 'X..X..X..X..'),
				ta: 'XXXX        XXXX        XXXX  XXXX  XXXX        ',
				ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
				ch: repeat(4, 'X XX  X XX  ')
			},
			'Rented a Tent Break': {
				lg: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX      X  ',
				mg: 'XXX  X  X   XXX  X  X   XXX   XXX   XXX   XXX   ',
				hg: '   X  X  X     X  X  X     X     X        XXX   ',
				re: 'XXXX XX XX  XXXX XX XX  XXXX  XXXX  XXX   XXXX  ',
				ca: 'XXXX.XX.XX..XXXX.XX.XX..XXXX..XXXX..XXX...XXXX..',
				ta: '@re',
				ag: 'oooa oa oa  oooa oa oa  oooa  oooa  ooo   aaao  ',
				ch: '@re'
			}
		},
		exampleSong: [ "Tune", "Rented a Tent Break", "Tune" ]
	},
	'Trans-Europa-Express': {
		categories: [ "new", "uncommon", "medium" ],
		sheet: sheetUrl + "trans-europa-express.pdf",
		descriptionFilename: "trans-europa-express",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/cdgQ9uW6rNwSQDTY5kibZW",
		patterns: {
			Tune: {
				upbeat: 1,
				loop: true,
				lg: " XX      X X     XX      X X     ",
				mg: "@lg",
				hg: "     X       X       X       X   ",
				re: "hX rhX  hX rhX  hX rhX  hX rhX  h",
				ca: " ....X..X....X..X....X..X....X..X",
				ta: " X     X X X   X X               ",
				ag: " o     o o o   o o               ",
				ch: ".X X.X  .X X.X  .X X.X  .X X.X  ."
			},
			"Doppler Break": {
				upbeat: 1,
				lg: "                                 XXXXXXXXXXXXXXXXssssssssssssssss",
				mg: "                             XXXXXXXXsssssssssssssssssssssssssss ",
				hg: "                 rrrrrrrrrrrrXXXX                                ",
				re: " rrrrrrrrrrrrrrrrrrrrrrrrrrrrXXXX                                ",
				ca: "     rrrrrrrrrrrrrrrrrrrrrrrrXXXX                                ",
				ta: "                             XXXX                                ",
				ch: ".X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  ."
			},
			"Break 1": {
				"upbeat": 1,
				"lg": " X               X                                               ",
				"mg": "         X       X               X                               ",
				"hg": "         X               X       X               Xsssssssssss    ",
				"re": " h                       X               r       X               ",
				"ca": "                                         r                       ",
				"ta": "                                         X                       ",
				"ch": ".X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  .X X.X  ."
			},
			"Tamborim Stroke": {
				"lg": "X     X X X   X X               ",
				"mg": "@lg",
				"hg": "@lg",
				"re": "@lg",
				"ca": "@lg",
				"ta": "@lg",
				"ag": "o     o o o   o o               ",
				"ch": "@lg"
			}
		},
		exampleSong: [
			{ patternName: "Tune", instruments: ["lg", "mg", "hg", "ch"] },
			{ patternName: "Tune", instruments: ["lg", "mg", "hg", "ch"] },
			"Break 1",
			"Tune", "Tune", "Tune", "Tune",
			"Doppler Break",
			"Tune", "Tune", "Tune", "Tune",
			"Tamborim Stroke",
			"Tune", "Tune", "Tune", "Tune"
		]
	},
	'Van Harte Pardon': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "van-harte-pardon.pdf",
		descriptionFilename: "van-harte-pardon",
		patterns: {
			Tune: {
				loop: true,
				lg: '0     XX0     X 0     XX0   X X ',
				mg: '@lg',
				hg: 's  X    s  X    s  X    ss sX   ',
				re: '  X   X  X X  X   X   X  X X  X ',
				ca: 'X..X..X.X..X..X.X..X..X.X..X..X.',
				ta: '  X   X  X X  X   X   X  X X  X ',
				ag: 'a.ooo.aa.o.oo.ooo.aaa.oo.a.aa.oo',
				ch: '................................'
			},
			'Break 1': {
				lg: '                XX XX XX        ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				ot: 'J           L               F   '
			},
			'Silence Break': {
				lg: '              XX',
				ag: '@lg'
			},
			'Break 2': {
				lg: 'X  s          X X  s          X ',
				hg: 'X  s            X  s            ',
				re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
				ca: '@re',
				ta: '      XXXX XX X       XXXX XX   ',
				ag: '      aaaa oa a       oooo ao   '
			},
			'Break 2 (Cut)': {
				lg: 'X  s          X X  s  ssss sX X ',
				hg: 'X  s            X  s  ssss sX   ',
				re: 'X..X..XXXX.XX.X.X..X..XXXX.XX...',
				ca: '@re',
				ta: '      XXXX XX X       XXXX XX   ',
				ag: '      aaaa oa a       oooo ao   '
			},
			'Cross Break': {
				lg: 'X  s          X X  s          X ',
				hg: 'X  s            X  s            '
			},
			'Cross Eight Break': {
				lg: 'X X X X X X X X ',
				mg: '@lg',
				hg: '@lg',
				volumeHack: crescendo(16)
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 1", "Tune", "Tune", "Silence Break", "Tune", "Tune", "Break 2", "Break 2 (Cut)", "Tune", "Tune", "Cross Break", "Tune", "Tune", "Cross Eight Break", "Tune", "Tune" ]
	},
	'Voodoo': {
		categories: [ "uncommon", "easy", "cultural-appropriation" ],
		sheet: sheetUrl + "voodoo.pdf",
		descriptionFilename: "voodoo",
		patterns: {
			Tune: {
				loop: true,
				lg: '   XX 0    XX 0    XX 0 X X X 0 ',
				mg: 's   s X s   s X s   s X s   s X ',
				hg: '@mg',
				re: 'X  X  X X  X  X X  X  X X  X  X ',
				ca: 'X..X..X.X..X..X.X..X..X.X..X..X.',
				ta: 'X X X X X X X X XX              ',
				ag: 'a a o o oa a oo a a o o oa a oo ',
				ch: 'X.......X.......X.......X.......'
			},
			'Scissor Break': {
				lg: 'X X X X XX X XX ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Scissor Break", "Tune", "Tune" ]
	},
	'Walc(z)': {
		categories: [ "uncommon", "easy", "western" ],
		time: 6,
		speed: 60,
		sheet: sheetUrl + "walc.pdf",
		descriptionFilename: "walc",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X     X     X     X     ',
				mg: '  X X   X X   X X   XXXX',
				hg: '@mg',
				re: '  X X   XXX   X X   XXX ',
				ca: '..X.X...X.X...X.X.XXXXXX',
				ta: '  X X   X X       X X X ',
				ag: 'o a a o a a o a a o     ',
				ch: 'X X X X XXX X X X X XXX '
			},
			'Break 2': {
				lg: 'X X X                   ',
				mg: '      X X X             ',
				hg: '            X X X       ',
				re: '                  XXXXXX',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 3': {
				lg: 'X X X       X X X       X X   X X   X X X X     ',
				mg: '@lg',
				hg: '@lg',
				re: '      X           X         X     X X X X X     ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 5': {
				lg: '                  XXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '..X.X...X.X...X.X.XXXXXX',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Bra Break': {
				displayName: "Call Break",
				lg: '      X           X         X     X     X X     ',
				mg: '@lg',
				hg: '@lg',
				re: 'X X X       X X X       X X   X X   X X         ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Cut-throat Break': {
				lg: 'X     X     X           ',
				mg: '@lg',
				hg: '@lg',
				re: '  X X   X X   X X       ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Cut-throat Break Fast': {
				lg: 'X  X  X                 ',
				mg: '@lg',
				hg: '@lg',
				re: ' XX XX XX               ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			"Karla Break (6⁄4)": {
				lg: repeat(3, 'XXXXXXXXXXXXXXXXXXXXXXXX') + 'X                       ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: { 0: .1, 24: .4, 48: .7, 72: 1  }
			},
			"8 up (6⁄4)": {
				lg: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg',
				volumeHack: crescendo(48)
			},
			'Progressive (6⁄4)': {
				lg: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXX',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			'Progressive Karla (6⁄4)': {
				lg: 'X     X     X     X     X X X X X X X X X X X X XXXXXXXXXXXXXXXXXXXXXXXXX                       ',
				mg: '@lg',
				hg: '@lg',
				re: '@lg',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Break 2", "Tune", "Tune", "Break 3", "Tune", "Tune", "Break 5", "Tune", "Tune", "Bra Break", "Tune", "Tune", "Cut-throat Break", "Tune", "Tune" ]
	},
	'Wolf': {
		categories: [ "uncommon", "tricky" ],
		sheet: sheetUrl + "wolf.pdf",
		descriptionFilename: "wolf",
		patterns: {
			Tune: {
				loop: true,
				lg: repeat(4, 'X   X   X   X   '),
				mg: repeat(4, '  XX     XXX    '),
				hg: repeat(2, '      XX      XX      XXXXXXXXXX'),
				re: repeat(2, 'X XX  r X X X rrX XX  r  XXXX rr'),
				ca: repeat(4, 'f.X...X...X...X.'),
				ta: 'X X     X X     XX XXX XX       X XX XX X X X X XX XXX XX       ',
				ag: repeat(4, 'ooooo a   a   a '),
				ch: repeat(4, '................')
			},
			'Pat 1': {
				lg: '              XXX     XXX       ',
				mg: '   X X     X X                  ',
				hg: 'XXXXXXXXX                       '
			},
			'Pat 2': {
				lg: '              XXX     XXX       ',
				mg: '   X X     X X                  ',
				hg: 'XXXXXXXXXXXXX                   '
			},
			'Break 1': {
				lg: '   XX  XX X X    XXXX  XX X X      XX  XX X X    XXXX  XX       ',
				mg: '@lg',
				hg: '@lg',
				ca: 'X               X               X               X               '
			},
			'Break 2': {
				lg: 'X X   XXX X    XX X    XX X     X X   XXX X    X X X X X        ',
				mg: '@lg',
				hg: '@lg',
				re: '    X       X       X       X       X       X  X X X X X        ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re',
				ot: '                                                            A   '
			}
		},
		exampleSong: [ "Tune", "Pat 1", "Tune", "Pat 2", "Tune", "Break 1", "Tune", "Break 2", "Tune" ]
	},
	'Xango': {
		displayName: "Xangô",
		categories: [ "uncommon", "tricky", "cultural-appropriation" ],
		sheet: sheetUrl + "xango.pdf",
		descriptionFilename: "xango",
		video: "https://tube.rhythms-of-resistance.org/videos/embed/ae1fe3a3-dd7e-4670-9415-b47ee60a54b0",
		patterns: {
			Tune: {
				loop: true,
				lg: repeat(2, 's   X XX        '),
				mg: repeat(2, 'X X             '),
				hg: repeat(2, '            XXXX'),
				re: repeat(2, ' XXX XXX XXX XXX'),
				ca: repeat(2, 'X..X....X.XX....'),
				ta: 'X X X X X X X X XX              ',
				ag: repeat(2, 'o a o  o o ao   '),
				ch: repeat(2, '................')
			},
			'Intro': {
				loop: true,
				re: repeat(4, 'r rrr r r r r r '),
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Intro+Surdos': {
				loop: true,
				lg: 'X         X X X X           X X X       X X X X X           X   ',
				mg: '@lg',
				hg: '@lg',
				re: repeat(4, 'r rrr r r r r r '),
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Boum Shakala Break': {
				lg: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X                 ',
				mg: '@lg',
				hg: 'X XXX X XXX X X X XXX X XXX X X X XXX X XXX X X             XXXX',
				re: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X                 ',
				ca: '  XXX   XXX   X   XXX   XXX   X   XXX   XXX   X X..X..XXX       ',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			},
			'Break 2': {
				lg: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   ',
				mg: '@lg',
				hg: 'X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX   X XX  XX XXXX XXX XX  XX X XX XX',
				re: '                         X XX                            X XX                            X XX   ',
				ca: '@re',
				ta: '@re',
				ag: '@re',
				ch: '@re'
			}
		},
		exampleSong: [ "Intro", "Intro", "Intro+Surdos", "Intro+Surdos", "Tune", "Tune", "Boum Shakala Break", "Tune", "Tune", "Break 2", "Tune", "Tune" ]
	},
	'Zurav Love / Truant': {
		displayName: "Żurav Love",
		categories: [ "uncommon", "tricky", "western" ],
		sheet: sheetUrl + "zurav-love.pdf",
		descriptionFilename: "zurav-love",
		patterns: {
			Tune: {
				loop: true,
				lg: 'X  X  X  X  X  X                ',
				mg: '@lg',
				hg: '                        X  X  X ',
				re: 'f   h X f   h   f   h X f   h   ',
				ca: 'X...X...X...X.....XXX...XXX.X...',
				ta: '    X       X       X       X   ',
				ag: '  aaa o aaa o     aaa           ',
				ch: '...XX......XX......XX......XX...'
			},
			"Bra Break": {
				displayName: "Call Break",
				lg: repeat(3, '        X       ') + 'X     X X  X  X ',
				mg: '@lg',
				hg: '@lg',
				re: repeat(3, 'f hr hr         ') + 'X     X X  X  X ',
				ca: repeat(3, '                ') + '..XXX...XXX.X...',
				ta: repeat(3, '           X  X ') + 'X     X X  X  X ',
				ag: '@ta',
				ch: '@ta'
			},
			"Kick Back 1": {
				loop: true,
				lg: '            X   ',
				mg: '@lg',
				hg: '@lg',
				re: '  XXX   XXX     ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			},
			"Kick Back 2": {
				loop: true,
				lg: '    X       X   ',
				mg: '@lg',
				hg: '@lg',
				re: '  XXX   XXX     ',
				ca: '@lg',
				ta: '@lg',
				ag: '@lg',
				ch: '@lg'
			}
		},
		exampleSong: [ "Tune", "Tune", "Bra Break", "Tune", "Tune", "Kick Back 1", "Kick Back 1", "Kick Back 2", "Kick Back 2", "Tune", "Tune" ]
	},

	// Morceaux composés par Troup'akada d'Échirolles : voir src/troupakadaTunes.ts / .json
	...troupakadaTunes
};

const defaultTunes: { [tuneName: string]: Tune } = { };

for(const i in rawTunes) {
	const tune = rawTunes[i];

	const newTune = clone(tune) as any as Tune;

	for(const j in tune.patterns) {
		const pattern = tune.patterns[j];
		const newPattern = clone(pattern) as any as Pattern;
		if(!newPattern.time && tune.time)
			newPattern.time = tune.time;

		for(const k of config.instrumentKeys) {
			const thisPattern = pattern[k] = pattern[k] || "";
			const m = thisPattern.match(/^@([a-z]{2})$/);
			if(m)
				newPattern[k] = clone(newPattern[m[1] as Instrument]);
			else {
				newPattern[k] = thisPattern.split('');
				newPattern.length = Math.max(newPattern.length || 0, newPattern[k].length - (pattern.upbeat || 0));
			}

			if(k == "ag")
				newPattern[k] = newPattern[k].map(function(it) { return it == "X" ? "o" : it; });
		}

		newPattern.length = Math.ceil(newPattern.length / (newPattern.time || 4));
		if (newPattern.length % 4) {
			// eslint-disable-next-line no-console
			console.error(`Unusual length ${newPattern.length} for ${j} of ${i}.`);
		}

		newTune.patterns[j] = normalizePattern(newPattern);
	}

	defaultTunes[i] = normalizeTune(newTune);

	const unknown = (defaultTunes[i].exampleSong || [])
		.map((patternName) => typeof patternName === 'string' ? patternName : patternName.patternName)
		.filter((patternName) => !defaultTunes[i].patterns[patternName]);
	if(unknown.length > 0) {
		// eslint-disable-next-line no-console
		console.error(`Unknown breaks in example song for ${i}: ${unknown.join(", ")}`);
	}
}

Object.defineProperty(defaultTunes, "getPattern", {
	configurable: true,
	value: function(tuneName: string | PatternReference, patternName?: string): Pattern | null {
		if(Array.isArray(tuneName)) {
			patternName = tuneName[1];
			tuneName = tuneName[0];
		}

		return this[tuneName]?.patterns[<string> patternName];
	}
});

Object.defineProperty(defaultTunes, "firstInSorting", {
	configurable: true,
	value: [ "General Breaks", "Special Breaks", "Shouting Breaks" ]
});

interface DefaultTunesMethods {
	getPattern(tuneName: string, patternName?: string): Pattern | undefined;
	getPattern(patternReference: PatternReference): Pattern | undefined;
	firstInSorting: Array<string>;
}

type DefaultTunes = Record<string, Tune> & DefaultTunesMethods;

export default defaultTunes as DefaultTunes;
