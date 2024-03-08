import type { IPlugin } from 'packages/core/src/IPlugin';
import type {
	JsViewFieldDeclaration,
	PartialUnvalidatedJsViewFieldDeclaration,
	SimpleJsViewFieldDeclaration,
	UnvalidatedJsViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import { JS_VIEW_FIELD_DECLARATION } from 'packages/core/src/parsers/nomParsers/ViewFieldNomParsers';

export class JsViewFieldParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	fromString(fullDeclaration: string): UnvalidatedJsViewFieldDeclaration {
		const errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		try {
			const parserResult = runParser(JS_VIEW_FIELD_DECLARATION, fullDeclaration);

			return this.partialToFullDeclaration(parserResult, fullDeclaration, errorCollection);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: fullDeclaration,
			errorCollection: errorCollection,
			bindTargetMappings: [],
			writeToBindTarget: undefined,
			code: '',
		};
	}

	public fromStringAndValidate(fullDeclaration: string, filePath: string): JsViewFieldDeclaration {
		return this.validate(this.fromString(fullDeclaration), filePath);
	}

	public fromSimpleDeclaration(simpleDeclaration: SimpleJsViewFieldDeclaration): UnvalidatedJsViewFieldDeclaration {
		const errorCollection = new ErrorCollection('JsViewFieldDeclaration');

		return {
			declarationString: undefined,
			code: simpleDeclaration.code,
			bindTargetMappings: simpleDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.fromSimpleDeclaration(x.bindTarget),
					name: x.name,
				};
			}),
			writeToBindTarget: simpleDeclaration.writeToBindTarget
				? this.plugin.api.bindTargetParser.fromSimpleDeclaration(simpleDeclaration.writeToBindTarget)
				: undefined,
			errorCollection: errorCollection,
		};
	}

	public fromSimpleDeclarationAndValidate(
		simpleDeclaration: SimpleJsViewFieldDeclaration,
		filePath: string,
	): JsViewFieldDeclaration {
		return this.validate(this.fromSimpleDeclaration(simpleDeclaration), filePath);
	}

	private partialToFullDeclaration(
		unvalidatedDeclaration: PartialUnvalidatedJsViewFieldDeclaration,
		fullDeclaration: string | undefined,
		errorCollection: ErrorCollection,
	): UnvalidatedJsViewFieldDeclaration {
		const declaration = unvalidatedDeclaration as UnvalidatedJsViewFieldDeclaration;
		declaration.declarationString = fullDeclaration;
		declaration.errorCollection = errorCollection;
		declaration.bindTargetMappings = [...declaration.bindTargetMappings]; // copy array to avoid modifying the original

		return declaration;
	}

	public validate(
		unvalidatedDeclaration: UnvalidatedJsViewFieldDeclaration,
		filePath: string,
	): JsViewFieldDeclaration {
		const declaration: JsViewFieldDeclaration = {} as JsViewFieldDeclaration;

		declaration.declarationString = unvalidatedDeclaration.declarationString;
		declaration.errorCollection = unvalidatedDeclaration.errorCollection;

		try {
			declaration.bindTargetMappings = unvalidatedDeclaration.bindTargetMappings.map(x => {
				return {
					bindTarget: this.plugin.api.bindTargetParser.validate(
						unvalidatedDeclaration.declarationString,
						x.bindTarget,
						filePath,
					),
					name: x.name,
				};
			});

			if (unvalidatedDeclaration.writeToBindTarget !== undefined) {
				declaration.writeToBindTarget = this.plugin.api.bindTargetParser.validate(
					unvalidatedDeclaration.declarationString,
					unvalidatedDeclaration.writeToBindTarget,
					filePath,
				);
			}

			declaration.code = unvalidatedDeclaration.code;

			return declaration;
		} catch (e) {
			declaration.errorCollection.add(e);
		}

		return {
			declarationString: unvalidatedDeclaration.declarationString,
			errorCollection: declaration.errorCollection,
			bindTargetMappings: [],
			writeToBindTarget: undefined,
			code: '',
		};
	}
}