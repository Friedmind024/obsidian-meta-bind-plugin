import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
import ProgressBarComponent from 'packages/core/src/fields/inputFields/fields/ProgressBar/ProgressBarComponent.svelte';
import { parseUnknownToFloat } from 'packages/core/src/utils/Literal';
import { optClamp } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { type SvelteComponent } from 'svelte';

export class ProgressBarIPF extends AbstractInputField<number, number> {
	minValue: number;
	maxValue: number;
	stepSize: number;

	constructor(base: InputFieldBase) {
		super(base);

		this.minValue = this.base.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = this.base.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
		this.stepSize = this.base.getArgument(InputFieldArgumentType.STEP_SIZE)?.value ?? 1;

		if (this.minValue >= this.maxValue) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create progress bar input field',
				cause: `minValue (${this.maxValue}) must be less than maxValue (${this.maxValue})`,
			});
		}
	}

	protected filterValue(value: unknown): number | undefined {
		return optClamp(parseUnknownToFloat(value), this.minValue, this.maxValue);
	}

	protected getFallbackDefaultValue(): number {
		return this.minValue;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return ProgressBarComponent;
	}

	protected rawReverseMapValue(value: number): number | undefined {
		return value;
	}

	protected rawMapValue(value: number): number {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			minValue: this.minValue,
			maxValue: this.maxValue,
			stepSize: this.stepSize,
		};
	}
}
