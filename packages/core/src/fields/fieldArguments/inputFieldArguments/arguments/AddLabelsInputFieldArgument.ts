import { type InputFieldArgumentConfig, InputFieldArgumentConfigs } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import { type ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';

export class AddLabelsInputFieldArgument extends AbstractInputFieldArgument {
	value: boolean = true;

	override _parseValue(value: ParsingResultNode[]): void {
		this.value = value[0] === undefined || value[0]?.value.toLowerCase() === 'true';
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.addLabels;
	}
}
