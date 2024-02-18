import { InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { ViewFieldParser } from '../parsers/viewFieldParser/ViewFieldParser';
import { BindTargetParser } from '../parsers/bindTargetParser/BindTargetParser';
import { type IPlugin } from '../IPlugin';
import { InputFieldAPI } from './InputFieldAPI';
import { InputFieldFactory } from '../fields/inputFields/InputFieldFactory';
import { ButtonActionRunner } from '../fields/button/ButtonActionRunner';
import { ButtonManager } from '../fields/button/ButtonManager';
import { SyntaxHighlightingAPI } from './SyntaxHighlightingAPI';
import { ViewFieldFactory } from '../fields/viewFields/ViewFieldFactory';
import { type RenderChildType } from '../config/FieldConfigs';
import { getUUID } from '../utils/Utils';
import { InputFieldBase } from '../fields/inputFields/InputFieldBase';
import type { BindTargetScope } from '../metadata/BindTargetScope';
import { ViewFieldBase } from '../fields/viewFields/ViewFieldBase';
import { type FieldBase } from '../fields/IFieldBase';
import { JsViewField } from '../fields/viewFields/JsViewField';
import { InlineButtonBase } from '../fields/button/InlineButtonBase';
import { ButtonBase } from '../fields/button/ButtonBase';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';

export enum FieldType {
	INPUT_FIELD = 'INPUT_FIELD',
	VIEW_FIELD = 'VIEW_FIELD',
	JS_VIEW_FIELD = 'JS_VIEW_FIELD',
	INLINE_BUTTON = 'INLINE_BUTTON',
	BUTTON = 'BUTTON',
}

export function isFieldTypeAllowedInline(type: FieldType): boolean {
	return type === FieldType.INPUT_FIELD || type === FieldType.VIEW_FIELD || type === FieldType.INLINE_BUTTON;
}

export class API<Plugin extends IPlugin> {
	readonly plugin: Plugin;
	readonly inputField: InputFieldAPI;

	readonly inputFieldParser: InputFieldDeclarationParser;
	readonly viewFieldParser: ViewFieldParser;
	readonly bindTargetParser: BindTargetParser;

	readonly inputFieldFactory: InputFieldFactory;
	readonly viewFieldFactory: ViewFieldFactory;

	readonly buttonActionRunner: ButtonActionRunner;
	readonly buttonManager: ButtonManager;

	readonly syntaxHighlighting: SyntaxHighlightingAPI;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
		this.inputField = new InputFieldAPI(plugin);

		this.inputFieldParser = new InputFieldDeclarationParser(plugin);
		this.viewFieldParser = new ViewFieldParser(plugin);
		this.bindTargetParser = new BindTargetParser(plugin);

		this.inputFieldFactory = new InputFieldFactory(plugin);
		this.viewFieldFactory = new ViewFieldFactory(plugin);

		this.buttonActionRunner = new ButtonActionRunner(plugin);
		this.buttonManager = new ButtonManager();

		this.syntaxHighlighting = new SyntaxHighlightingAPI(plugin);
	}

	public createField(
		type: FieldType,
		filePath: string,
		renderChildType: RenderChildType,
		content: string,
		scope?: BindTargetScope | undefined,
	): FieldBase {
		const uuid = getUUID();

		if (type === FieldType.INPUT_FIELD) {
			const declaration = this.inputFieldParser.parseString(content, filePath, scope);
			return new InputFieldBase(this.plugin, uuid, filePath, renderChildType, declaration);
		} else if (type === FieldType.VIEW_FIELD) {
			const declaration = this.viewFieldParser.parseString(content, filePath, scope);
			return new ViewFieldBase(this.plugin, uuid, filePath, renderChildType, declaration);
		} else if (type === FieldType.JS_VIEW_FIELD) {
			const declaration = this.viewFieldParser.parseJsString(content, filePath);
			return new JsViewField(this.plugin, uuid, filePath, renderChildType, declaration);
		} else if (type === FieldType.INLINE_BUTTON) {
			return new InlineButtonBase(this.plugin, uuid, filePath, content);
		} else if (type === FieldType.BUTTON) {
			return new ButtonBase(this.plugin, uuid, filePath, content, false);
		}

		// TODO: Nice error message
		throw new Error(`Unknown field type: ${type}`);
	}

	/**
	 * Gets the prefix of a given widget type. (e.g. INPUT or VIEW)
	 *
	 * @param mdrcType
	 */
	public getInlineFieldDeclarationPrefix(mdrcType: FieldType): string {
		if (mdrcType === FieldType.INPUT_FIELD) {
			return 'INPUT';
		} else if (mdrcType === FieldType.VIEW_FIELD) {
			return 'VIEW';
		} else if (mdrcType === FieldType.INLINE_BUTTON) {
			return 'BUTTON';
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to get declaration prefix',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}

	/**
	 * Checks if a string is a declaration of a given widget type.
	 *
	 * @param mdrcType
	 * @param str
	 */
	public isInlineFieldDeclaration(mdrcType: FieldType, str: string): boolean {
		const startStr: string = this.getInlineFieldDeclarationPrefix(mdrcType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration and if yes returns the widget type.
	 * This does not use {@link isInlineFieldDeclaration} because of performance reasons.
	 *
	 * @param str
	 */
	public isInlineFieldDeclarationAndGetType(str: string): FieldType | undefined {
		if (!str.endsWith(']')) {
			return undefined;
		}

		for (const widgetType of Object.values(FieldType)) {
			if (!isFieldTypeAllowedInline(widgetType)) {
				continue;
			}
			const startStr: string = this.getInlineFieldDeclarationPrefix(widgetType) + '[';
			if (str.startsWith(startStr)) {
				return widgetType;
			}
		}

		return undefined;
	}
}
