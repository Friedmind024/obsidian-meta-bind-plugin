import type { MetaBind } from 'packages/core/src';
import { ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import { toResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { P_ViewFieldDeclaration } from 'packages/core/src/parsers/nomParsers/ViewFieldNomParsers';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import type {
	PartialUnvalidatedViewFieldDeclaration,
	SimpleViewFieldDeclaration,
	UnvalidatedViewFieldDeclaration,
	ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldDeclarationValidator } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclarationValidator';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';

export class ViewFieldParser {
	mb: MetaBind;

	constructor(mb: MetaBind) {
		this.mb = mb;
	}

	fromString(fullDeclaration: string): UnvalidatedViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		try {
			const parserResult = runParser(P_ViewFieldDeclaration, fullDeclaration);

			return this.partialToFullDeclaration(parserResult, fullDeclaration, errorCollection);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: fullDeclaration,
			errorCollection: errorCollection,
			viewFieldType: { value: ViewFieldType.INVALID },
			writeToBindTarget: undefined,
			arguments: [],
			templateDeclaration: [],
		};
	}

	fromStringAndValidate(declarationString: string, filePath: string, scope?: BindTargetScope): ViewFieldDeclaration {
		return this.validate(this.fromString(declarationString), filePath, scope);
	}

	fromSimpleDeclaration(simpleDeclaration: SimpleViewFieldDeclaration): UnvalidatedViewFieldDeclaration {
		const errorCollection = new ErrorCollection('ViewFieldDeclaration');

		return {
			declarationString: undefined,
			templateDeclaration: (simpleDeclaration.templateDeclaration ?? []).map(x => {
				if (typeof x === 'string') {
					return x;
				} else {
					return this.mb.bindTargetParser.fromExistingDeclaration(x);
				}
			}),
			viewFieldType: toResultNode(simpleDeclaration.viewFieldType),
			arguments: (simpleDeclaration.arguments ?? []).map(x => ({
				name: toResultNode(x.name),
				value: x.value.map(y => toResultNode(y)),
			})),
			writeToBindTarget: this.mb.bindTargetParser.fromExistingDeclaration(simpleDeclaration.writeToBindTarget),
			errorCollection: errorCollection,
		};
	}

	fromSimpleDeclarationAndValidate(
		simpleDeclaration: SimpleViewFieldDeclaration,
		filePath: string,
		scope?: BindTargetScope,
	): ViewFieldDeclaration {
		return this.validate(this.fromSimpleDeclaration(simpleDeclaration), filePath, scope);
	}

	private partialToFullDeclaration(
		unvalidatedDeclaration: PartialUnvalidatedViewFieldDeclaration,
		declarationString: string | undefined,
		errorCollection: ErrorCollection,
	): UnvalidatedViewFieldDeclaration {
		return {
			...structuredClone(unvalidatedDeclaration),
			declarationString: declarationString,
			errorCollection: errorCollection,
		};
	}

	validate(
		unvalidatedDeclaration: UnvalidatedViewFieldDeclaration,
		filePath: string,
		scope?: BindTargetScope,
	): ViewFieldDeclaration {
		const validator = new ViewFieldDeclarationValidator(unvalidatedDeclaration, filePath, this.mb);

		return validator.validate(scope);
	}
}
