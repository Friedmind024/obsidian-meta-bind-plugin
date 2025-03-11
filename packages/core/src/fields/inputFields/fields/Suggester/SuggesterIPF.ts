import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import SuggesterComponent from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterComponent.svelte';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { parseUnknownToLiteral } from 'packages/core/src/utils/Literal';

export class SuggesterIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<MBLiteral> {
		// @ts-ignore
		return SuggesterComponent;
	}

	protected rawMapValue(value: MBLiteral): MBLiteral {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral): MBLiteral | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			showSuggester: () => this.openModal(),
			showTextPrompt: () => this.openTextModal(),
			allowOther: this.mountable.getArgument(InputFieldArgumentType.ALLOW_OTHER)?.value === true,
		};
	}

	openModal(): void {
		this.mountable.mb.internal.openSuggesterModal(this, selected => this.setInternalValue(selected.value));
	}

	openTextModal(): void {
		this.mountable.mb.internal.openTextPromptModal({
			title: 'Meta Bind Suggester',
			subTitle: 'Set the suggester value.',
			value: '',
			multiline: false,
			onSubmit: (newValue: MBLiteral) => {
				this.setInternalValue(newValue);
			},
			onCancel: () => {},
		});
	}
}
