import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_FilePath } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import { isUrl, openURL } from 'packages/core/src/utils/Utils';
import type { MetaBind } from '..';

const P_MDLinkInner: Parser<[string, string | undefined, string | undefined]> = P.sequence(
	P_FilePath, // the file path
	P.or(
		P.string('#').then(P.manyNotOf('[]#|:')), // either a heading with maybe a block
		P.string('#').result(undefined), // or an empty heading
		P.succeed(undefined), // or no heading at all
	),
	P.string('|').then(P.manyNotOf('[]')).optional(), // the optional alias
);

const P_MDLink: Parser<MarkdownLink> = P.or(
	// wiki links
	P.sequenceMap(
		(a, b): MarkdownLink => {
			return new MarkdownLink(a !== undefined, b[0], b[1], b[2], true);
		},
		P.string('!').optional(),
		P_MDLinkInner.wrapString('[[', ']]'),
	),
	// standard markdown links
	P.sequenceMap(
		(a, b, c): MarkdownLink => {
			const internal = !isUrl(c);

			return new MarkdownLink(a !== undefined, c, undefined, b, internal);
		},
		P.string('!').optional(),
		P.manyNotOf('[]').wrapString('[', ']'),
		P.manyNotOf('()').wrapString('(', ')'),
	),
);

const P_MDLinkList: Parser<MarkdownLink[]> = P.separateBy(P_MDLink, P.string(',').trim(P_UTILS.optionalWhitespace()));

export class MarkdownLink {
	isEmbed: boolean;
	target: string;
	block?: string;
	alias?: string;
	internal: boolean;

	constructor(isEmbed: boolean, target: string, block?: string, alias?: string, internal?: boolean) {
		this.isEmbed = isEmbed;
		this.target = target;
		this.block = block;
		this.alias = alias;
		this.internal = internal ?? true;
	}

	static fromUrl(url: URL): MarkdownLink {
		return new MarkdownLink(false, url.href, undefined, url.hostname, false);
	}

	fullTarget(): string {
		return this.block ? `${this.target}#${this.block}` : this.target;
	}

	open(mb: MetaBind, relativeFilePath: string, newTab: boolean): void {
		if (this.internal) {
			void mb.file.open(this.fullTarget(), relativeFilePath, newTab);
		} else {
			openURL(this.target);
		}
	}

	toString(): string {
		const embed = this.isEmbed ? '!' : '';

		if (this.internal) {
			const alias = this.alias ? `|${this.alias}` : '';
			return `${embed}[[${this.fullTarget()}${alias}]]`;
		} else {
			const alias = this.alias ?? this.fullTarget();
			return `${embed}[${alias}](${this.fullTarget()})`;
		}
	}
}

export class MDLinkParser {
	static parseLink(link: string): MarkdownLink {
		return runParser(P_MDLink.thenEof(), link);
	}

	static parseLinkList(link: string): MarkdownLink[] {
		return runParser(P_MDLinkList.thenEof(), link);
	}

	static isLink(str: string): boolean {
		return P_MDLink.thenEof().tryParse(str).success;
	}

	static urlToLink(url: URL): MarkdownLink {
		return MarkdownLink.fromUrl(url);
	}

	static parseLinkOrUrl(str: string): MarkdownLink {
		if (isUrl(str)) {
			return MDLinkParser.urlToLink(new URL(str));
		} else {
			return MDLinkParser.parseLink(str);
		}
	}

	static interpretAsLink(str: string): MarkdownLink | undefined {
		// case 1: it's a valid link
		const linkParseTry = P_MDLink.thenEof().tryParse(str);
		if (linkParseTry.success) {
			return linkParseTry.value;
		}

		// case 2: it's a valid inner link part, so something that is a valid link without the [[]] around it
		const linkParseTry2 = P_MDLinkInner.thenEof().tryParse(str);
		if (linkParseTry2.success) {
			return new MarkdownLink(
				false,
				linkParseTry2.value[0],
				linkParseTry2.value[1],
				linkParseTry2.value[2],
				true,
			);
		}

		// case 3: it's a url
		if (isUrl(str)) {
			const url = new URL(str);
			return MarkdownLink.fromUrl(url);
		}

		// case 4: it's a valid link
		return undefined;
	}
}
