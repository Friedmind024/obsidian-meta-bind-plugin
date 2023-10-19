import { AbstractViewField } from '../AbstractViewField';
import { ViewFieldDeclaration } from '../../parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldMDRC, ViewFieldVariable } from '../../renderChildren/ViewFieldMDRC';
import { Signal } from '../../utils/Signal';
import { ErrorLevel, MetaBindExpressionError } from '../../utils/errors/MetaBindErrors';
import { ViewFieldArgumentType } from '../../parsers/viewFieldParser/ViewFieldConfigs';
import { Component, MarkdownRenderer } from 'obsidian';

export class TextVF extends AbstractViewField {
	textParts?: (string | number)[];

	renderMarkdown: boolean;
	markdownComponent: Component;

	constructor(renderChild: ViewFieldMDRC) {
		super(renderChild);

		this.renderMarkdown = false;
		this.markdownComponent = new Component();
	}

	public buildVariables(declaration: ViewFieldDeclaration): ViewFieldVariable[] {
		this.textParts = [];

		let varCounter = 0;
		const variables: ViewFieldVariable[] = [];

		for (const entry of declaration.templateDeclaration ?? []) {
			if (typeof entry !== 'string') {
				const variable: ViewFieldVariable = {
					bindTargetDeclaration: entry,
					writeSignal: new Signal<any>(undefined),
					uuid: self.crypto.randomUUID(),
					writeSignalListener: undefined,
					contextName: `MB_VAR_${varCounter}`,
					listenToChildren: false,
				};

				variables.push(variable);

				this.textParts.push(varCounter);
				varCounter += 1;
			} else {
				this.textParts.push(entry);
			}
		}

		return variables;
	}

	public async _render(container: HTMLElement): Promise<void> {
		this.renderMarkdown = this.renderChild.getArgument(ViewFieldArgumentType.RENDER_MARKDOWN)?.value ?? false;
		this.markdownComponent.load();

		if (this.renderMarkdown) {
			container.addClass('mb-view-markdown');
		}
	}

	public async _update(container: HTMLElement, text: string): Promise<void> {
		if (this.renderMarkdown) {
			this.markdownComponent.unload();
			this.markdownComponent.load();

			await MarkdownRenderer.render(this.renderChild.plugin.app, text, container, this.renderChild.filePath, this.markdownComponent);
		} else {
			container.innerText = text;
		}
	}

	public destroy(): void {
		this.markdownComponent.unload();
	}

	computeValue(variables: ViewFieldVariable[]): string {
		if (!this.textParts) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, 'failed to evaluate text view field', 'content parts is undefined');
		}

		return this.textParts
			.map(x => {
				if (typeof x === 'number') {
					return variables[x].writeSignal.get();
				} else {
					return x;
				}
			})
			.join('');
	}

	public getDefaultDisplayValue(): string {
		return '';
	}
}