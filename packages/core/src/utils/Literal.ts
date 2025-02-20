import type { MarkdownLink } from 'packages/core/src/parsers/MarkdownLinkParser';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { P_float, P_int } from 'packages/core/src/parsers/nomParsers/MiscNomParsers';
import { isUrl } from 'packages/core/src/utils/Utils';

export type MBLiteral = string | number | boolean | null;
export type MBExtendedLiteral = MBLiteral | MBLiteral[];

export function parseLiteral(literalString: string): MBLiteral {
	if (literalString.toLowerCase() === 'null') {
		return null;
	} else if (literalString === 'true') {
		return true;
	} else if (literalString === 'false') {
		return false;
	} else {
		const parseResult = P_float.tryParse(literalString);

		if (parseResult.success) {
			return parseResult.value;
		} else {
			return literalString;
		}
	}
}

export function stringifyLiteral(literal: MBExtendedLiteral | undefined): string {
	if (literal === undefined) {
		return '';
	}

	if (literal === null) {
		return '';
	}

	if (typeof literal === 'string') {
		return literal;
	} else if (typeof literal === 'boolean') {
		return literal ? 'true' : 'false';
	} else {
		// typeof number
		return literal.toString();
	}
}

export function isLiteral(literal: unknown): literal is MBLiteral {
	return (
		literal === null || typeof literal === 'string' || typeof literal === 'boolean' || typeof literal === 'number'
	);
}

/**
 * Turns a value into an array of literals. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToLiteralArray(literal: unknown): MBLiteral[] | undefined {
	if (literal === undefined || literal === null) {
		return undefined;
	}

	if (isLiteral(literal)) {
		return [literal];
	}

	if (typeof literal === 'object' && Array.isArray(literal)) {
		return literal.filter(x => isLiteral(x));
	}

	return undefined;
}

/**
 * Turns a value into a float. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToFloat(literal: unknown): number | undefined {
	if (typeof literal === 'number') {
		return literal;
	} else if (typeof literal === 'string') {
		const v = P_float.tryParse(literal);
		if (v.success) {
			return v.value;
		}
	}

	return undefined;
}

/**
 * Turns a value into an int. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToInt(literal: unknown): number | undefined {
	if (typeof literal === 'number') {
		return Number.isInteger(literal) ? literal : undefined;
	} else if (typeof literal === 'string') {
		const v = P_int.tryParse(literal);
		if (v.success) {
			return v.value;
		}
	}

	return undefined;
}

/**
 * Turns a value into a string. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToString(literal: unknown): string | undefined {
	return isLiteral(literal) ? stringifyLiteral(literal) : undefined;
}

/**
 * Turns a value into a literal. If it can't convert, it returns undefined.
 *
 * @param literal
 */
export function parseUnknownToLiteral(literal: unknown): MBLiteral | undefined {
	return isLiteral(literal) ? literal : undefined;
}

/**
 * Turns a value into a literal. If it can't convert, it turns the value into a string.
 *
 * @param literal
 * @param nullAsEmpty
 */
export function parseUnknownToLiteralOrString(literal: unknown, nullAsEmpty: boolean): MBLiteral {
	return isLiteral(literal) ? literal : stringifyUnknown(literal, nullAsEmpty);
}

/**
 * Turns a value into a pretty string. Objects get turned to JSON.
 *
 * @param literal
 * @param nullAsEmpty
 */
export function stringifyUnknown(literal: unknown, nullAsEmpty: boolean): string {
	if (Array.isArray(literal)) {
		return literal
			.map(x => internalStringifyUnknown(x, nullAsEmpty))
			.filter(x => x !== '')
			.join(', ');
	}
	return internalStringifyUnknown(literal, nullAsEmpty);
}

function internalStringifyUnknown(literal: unknown, nullAsEmpty: boolean): string {
	if (literal === null || literal === undefined) {
		return nullAsEmpty ? '' : 'null';
	}
	if (typeof literal === 'function') {
		return '<function>';
	}

	if (typeof literal === 'object' || Array.isArray(literal)) {
		return JSON.stringify(literal);
	}

	// eslint-disable-next-line @typescript-eslint/no-base-to-string
	return literal.toString();
}

export function stringifyAndLinkUnknown(
	literal: unknown,
	nullAsEmpty: boolean,
): string | MarkdownLink | (string | MarkdownLink)[] {
	if (Array.isArray(literal)) {
		return literal.map(x => internalStringifyAndLinkUnknown(x, nullAsEmpty)).filter(x => x !== '');
	}
	return internalStringifyAndLinkUnknown(literal, nullAsEmpty);
}

function internalStringifyAndLinkUnknown(literal: unknown, nullAsEmpty: boolean): string | MarkdownLink {
	if (typeof literal === 'string') {
		if (MDLinkParser.isLink(literal)) {
			return MDLinkParser.parseLink(literal);
		} else if (isUrl(literal)) {
			return MDLinkParser.urlToLink(new URL(literal));
		}

		return literal;
	}

	return internalStringifyUnknown(literal, nullAsEmpty);
}
