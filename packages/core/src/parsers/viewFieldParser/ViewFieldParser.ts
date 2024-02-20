import { type IPlugin } from 'packages/core/src/IPlugin';
import { ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import { ViewFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import { type BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import {
	JS_VIEW_FIELD_DECLARATION,
	VIEW_FIELD_FULL_DECLARATION,
} from 'packages/core/src/parsers/nomParsers/ViewFieldNomParsers';
import {
	type JsViewFieldDeclaration,
	type UnvalidatedViewFieldDeclaration,
	type ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldDeclarationValidator } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclarationValidator';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export class ViewFieldParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	parseString(fullDeclaration: string, filePath: string, scope?: BindTargetScope | undefined): ViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = runParser(
				VIEW_FIELD_FULL_DECLARATION,
				fullDeclaration,
			) as UnvalidatedViewFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			return this.validateDeclaration(parserResult, filePath, scope);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			errorCollection: errorCollection,
			templateDeclaration: [],
			viewFieldType: ViewFieldType.INVALID,
			argumentContainer: new ViewFieldArgumentContainer(),
			writeToBindTarget: undefined,
		};
	}

	parseStringWithoutValidation(fullDeclaration: string): UnvalidatedViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = runParser(
				VIEW_FIELD_FULL_DECLARATION,
				fullDeclaration,
			) as UnvalidatedViewFieldDeclaration;
			parserResult.fullDeclaration = fullDeclaration;
			parserResult.errorCollection = errorCollection;
			parserResult.arguments = [...parserResult.arguments]; // copy argument array to avoid modifying the original

			return parserResult;
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			fullDeclaration: fullDeclaration,
			errorCollection: errorCollection,
			viewFieldType: { value: ViewFieldType.INVALID },
			writeToBindTarget: undefined,
			arguments: [],
			templateDeclaration: [],
		};
	}

	validateDeclaration(
		unvalidatedDeclaration: UnvalidatedViewFieldDeclaration,
		filePath: string,
		scope?: BindTargetScope | undefined,
	): ViewFieldDeclaration {
		const validator = new ViewFieldDeclarationValidator(unvalidatedDeclaration, filePath, this.plugin);

		return validator.validate(scope);
	}

	parseJsString(fullDeclaration: string, filePath: string): JsViewFieldDeclaration {
		const declaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;
		declaration.errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		declaration.fullDeclaration = fullDeclaration;

		try {
			const unvalidatedDeclaration = runParser(JS_VIEW_FIELD_DECLARATION, fullDeclaration);
			declaration.bindTargetMappings = unvalidatedDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.validateBindTarget(
						fullDeclaration,
						x.bindTarget,
						filePath,
					),
					name: x.name,
				};
			});

			if (unvalidatedDeclaration.writeToBindTarget !== undefined) {
				declaration.writeToBindTarget = this.plugin.api.bindTargetParser.validateBindTarget(
					fullDeclaration,
					unvalidatedDeclaration.writeToBindTarget,
					filePath,
				);
			}

			declaration.code = unvalidatedDeclaration.code;
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return declaration;
	}
}
