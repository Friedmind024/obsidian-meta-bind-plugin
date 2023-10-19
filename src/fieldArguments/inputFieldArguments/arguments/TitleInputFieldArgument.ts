import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { InputFieldArgumentConfig, InputFieldArgumentConfigs } from '../../../parsers/inputFieldParser/InputFieldConfigs';
import { ParsingResultNode } from '../../../parsers/nomParsers/GeneralParsers';

export class TitleInputFieldArgument extends AbstractInputFieldArgument {
	value: string = '';

	_parseValue(value: ParsingResultNode[]): void {
		this.value = value[0].value;
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.title;
	}
}