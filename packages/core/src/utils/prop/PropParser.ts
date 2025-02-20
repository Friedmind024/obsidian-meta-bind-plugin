import type { UnvalidatedPropAccess } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { toResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { P_int } from 'packages/core/src/parsers/nomParsers/MiscNomParsers';
import { PropAccess, PropAccessType } from 'packages/core/src/utils/prop/PropAccess';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';

export function parsePropPath(arr: string[]): PropPath {
	return new PropPath(
		arr.map(x => {
			if (P_int.tryParse(x).success) {
				return new PropAccess(PropAccessType.ARRAY, x);
			} else {
				return new PropAccess(PropAccessType.OBJECT, x);
			}
		}),
	);
}

export function parsePropPathUnvalidated(arr: string[]): UnvalidatedPropAccess[] {
	return arr.map(x => {
		if (P_int.tryParse(x).success) {
			return {
				prop: toResultNode(x),
				type: PropAccessType.ARRAY,
			};
		} else {
			return {
				prop: toResultNode(x),
				type: PropAccessType.OBJECT,
			};
		}
	});
}
