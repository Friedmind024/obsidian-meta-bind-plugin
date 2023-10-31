import { AbstractInputField } from '../../AbstractInputField';
import { parseUnknownToString } from '../../../utils/Utils';
import { type InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import TextComponent from './TextComponent.svelte';
import { InputFieldArgumentType } from '../../../parsers/inputFieldParser/InputFieldConfigs';

export class TextIPF extends AbstractInputField<string, string> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return TextComponent;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			placeholder: this.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Text',
			limit: this.renderChild.getArgument(InputFieldArgumentType.LIMIT)?.value,
		};
	}
}