import { javascript } from '@codemirror/legacy-modes/mode/javascript';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import type { Mode, StringStream } from 'codemirror';
import type { InlineFieldType } from 'packages/core/src/config/APIConfigs';
import { SyntaxHighlighting } from 'packages/core/src/parsers/syntaxHighlighting/SyntaxHighlighting';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

export function registerCm5HLModes(mb: ObsMetaBind): void {
	/* eslint-disable */

	if (!mb.getSettings().enableSyntaxHighlighting) {
		return;
	}

	window.CodeMirror.defineMode('meta-bind-button', _config => {
		const mode: Mode<any> = {
			startState: () => {
				return yaml.startState?.(4);
			},
			blankLine: (state: any) => {
				return yaml.blankLine?.(state, 4);
			},
			copyState: (_state: any) => {
				return yaml.startState?.(4);
			},
			token: (stream: any, state: any) => {
				return `line-HyperMD-codeblock ${yaml.token?.(stream, state)}`;
			},
		};

		return mode;
	});

	window.CodeMirror.defineMode('meta-bind-js-view', _config => {
		const mode: Mode<any> = {
			startState: () => {
				return javascript.startState?.(4);
			},
			blankLine: (state: any) => {
				return javascript.blankLine?.(state, 4);
			},
			copyState: (_state: any) => {
				return javascript.startState?.(4);
			},
			token: (stream: any, state: any) => {
				return `line-HyperMD-codeblock ${javascript.token?.(stream, state)}`;
			},
		};

		return mode;
	});

	const codeBlockEndRegexp = /^\s*(```+|~~~+)/;

	type MBModeState = {
		str: string;
		fieldType: InlineFieldType;
		highlights: SyntaxHighlighting;
		line: number;
	};

	window.CodeMirror.defineMode('meta-bind', _config => {
		const mode: Mode<any> = {
			startState: () => {
				return {
					str: undefined,
					mdrcType: undefined,
					highlights: undefined,
					line: 1,
				};
			},

			token: (stream: StringStream, state: MBModeState) => {
				// the idea is that we get the whole content of the code block at the beginning
				// then parse it and save the generated highlights
				// then the stream parser can simply look up the highlights for the current line and column
				if (state.str === undefined) {
					let lines = [stream.string];
					let i = 1;
					let lookAhead = stream.lookAhead(i);

					while (lookAhead !== undefined && !codeBlockEndRegexp.test(lookAhead)) {
						lines.push(lookAhead);
						i += 1;
						lookAhead = stream.lookAhead(i);

						// fail-safe, if we miss the end of the code block
						if (i > 100) break;
					}

					state.str = lines.filter(x => x.trim() !== '').join('\n');

					let fieldType = mb.api.isInlineFieldDeclarationAndGetType(state.str.trim());
					if (fieldType === undefined) {
						state.highlights = new SyntaxHighlighting(state.str, []);
					} else {
						state.fieldType = fieldType;
						state.highlights = mb.syntaxHighlighting.highlight(state.str, state.fieldType, true);
					}

					// console.log(state.str, state.highlights.getHighlights());
				}

				const lineHighlights = state.highlights.getHighlights().filter(h => h.range.from.line === state.line);
				const highlight = lineHighlights.find(h => h.range.from.column === stream.pos + 1);

				// console.log(state.line, stream.pos, stream.peek(), highlight);

				if (highlight === undefined) {
					stream.next();
					if (stream.eol()) {
						state.line += 1;
					}
					return `line-HyperMD-codeblock`;
				}

				if (!stream.eatWhile(() => stream.pos + 1 < highlight.range.to.column)) {
					stream.next();
				}
				if (stream.eol()) {
					state.line += 1;
				}
				return `line-HyperMD-codeblock mb-highlight-${highlight.tokenClass}`;
			},
		};

		return mode;
	});
}
