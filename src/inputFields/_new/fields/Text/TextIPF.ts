import { NewAbstractInputField } from '../../NewAbstractInputField';
import { isLiteral } from '../../../../utils/Utils';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { SvelteComponent } from 'svelte';
import TextComponent from './TextComponent.svelte';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';

export class TextIPF extends NewAbstractInputField<string, string> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: any): string | undefined {
		return isLiteral(value) ? value?.toString() : undefined;
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

	protected getMountArgs(): Record<string, any> {
		return {
			placeholder: this.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Text',
		};
	}
}