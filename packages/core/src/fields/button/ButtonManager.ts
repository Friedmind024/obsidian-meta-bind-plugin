import type { MetaBind } from 'packages/core/src';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { RefCounter } from 'packages/core/src/utils/RefCounter';
import { getUUID } from 'packages/core/src/utils/Utils';

export class ButtonManager {
	readonly mb: MetaBind;

	// filePath -> buttonId -> ref counter of buttonConfig
	buttons: Map<string, Map<string, RefCounter<ButtonConfig>>>;
	// filePath -> buttonId -> listenerId -> callback
	buttonLoadListeners: Map<string, Map<string, Map<string, (config: ButtonConfig) => void>>>;
	buttonTemplates: Map<string, ButtonConfig>;

	constructor(mb: MetaBind) {
		this.mb = mb;

		this.buttons = new Map();
		this.buttonLoadListeners = new Map();
		this.buttonTemplates = new Map();
	}

	public setButtonTemplates(buttonTemplates: ButtonConfig[]): ErrorCollection {
		const idSet = new Set<string>();

		const errorCollection = new ErrorCollection('ButtonManager');

		this.buttonTemplates.clear();

		for (const buttonTemplate of buttonTemplates) {
			if (buttonTemplate.id === undefined || buttonTemplate.id === '') {
				errorCollection.add(
					new MetaBindButtonError({
						errorLevel: ErrorLevel.ERROR,
						cause: `Button with label "${buttonTemplate.label}" has no id, but button templates must have an id.`,
						effect: 'Button templates could not be saved.',
					}),
				);
			} else if (idSet.has(buttonTemplate.id)) {
				errorCollection.add(
					new MetaBindButtonError({
						errorLevel: ErrorLevel.ERROR,
						cause: `Button id "${buttonTemplate.id}" is not unique. The same id is used by multiple buttons.`,
						effect: 'Button templates could not be saved.',
					}),
				);
			} else {
				idSet.add(buttonTemplate.id);
				this.buttonTemplates.set(buttonTemplate.id, buttonTemplate);
			}
		}

		if (errorCollection.hasErrors()) {
			this.buttonTemplates.clear();
		}

		return errorCollection;
	}

	public registerButtonLoadListener(
		filePath: string,
		buttonId: string,
		callback: (config: ButtonConfig) => void,
	): () => void {
		const config = this.getButton(filePath, buttonId);
		if (config) {
			callback(config);
		}

		if (!this.buttonLoadListeners.has(filePath)) {
			this.buttonLoadListeners.set(filePath, new Map());
		}

		const fileButtonLoadListeners = this.buttonLoadListeners.get(filePath) as Map<
			string,
			Map<string, (config: ButtonConfig) => void>
		>;
		if (!fileButtonLoadListeners.has(buttonId)) {
			fileButtonLoadListeners.set(buttonId, new Map());
		}

		const buttonLoadListeners = fileButtonLoadListeners.get(buttonId) as Map<
			string,
			(config: ButtonConfig) => void
		>;
		const id = getUUID();
		buttonLoadListeners.set(id, callback);

		return () => this.removeButtonLoadListener(filePath, buttonId, id);
	}

	private notifyButtonLoadListeners(filePath: string, buttonId: string): void {
		const config = this.getButton(filePath, buttonId);
		if (!config) {
			throw new Error(`ButtonManager | button with id ${buttonId} does not exist`);
		}

		const fileLoadListeners = this.buttonLoadListeners.get(filePath);
		if (!fileLoadListeners) {
			return;
		}

		const loadListeners = fileLoadListeners.get(buttonId);
		if (!loadListeners) {
			return;
		}

		for (const [_, fileButtonLoadListener] of loadListeners) {
			fileButtonLoadListener(config);
		}
	}

	private removeButtonLoadListener(filePath: string, buttonId: string, listenerId: string): void {
		const fileLoadListeners = this.buttonLoadListeners.get(filePath);
		if (!fileLoadListeners) {
			return;
		}

		const loadListeners = fileLoadListeners.get(buttonId);
		if (!loadListeners) {
			return;
		}

		loadListeners.delete(listenerId);
		if (loadListeners.size === 0) {
			fileLoadListeners.delete(buttonId);
		}
		if (fileLoadListeners.size === 0) {
			this.buttonLoadListeners.delete(filePath);
		}
	}

	public addButton(filePath: string, button: ButtonConfig): void {
		if (button.id === undefined || button.id === '') {
			throw new Error('ButtonManager | button id is undefined');
		}

		if (this.buttonTemplates.has(button.id)) {
			throw new Error(`ButtonManager | button with id "${button.id}" already exists in the button templates`);
		}

		if (!this.buttons.has(filePath)) {
			this.buttons.set(filePath, new Map());
		}

		const fileButtons = this.buttons.get(filePath)!;

		fileButtons.set(button.id, new RefCounter(button));
		this.notifyButtonLoadListeners(filePath, button.id);
	}

	public getButton(filePath: string, buttonId: string): ButtonConfig | undefined {
		if (this.buttonTemplates.has(buttonId)) {
			return this.buttonTemplates.get(buttonId);
		}

		const fileButtons = this.buttons.get(filePath);
		if (fileButtons) {
			return fileButtons.get(buttonId)?.getValue();
		}
		return undefined;
	}

	public removeButton(filePath: string, buttonId: string): void {
		const fileButtons = this.buttons.get(filePath);
		if (fileButtons) {
			fileButtons.get(buttonId)?.decrement();
			if (fileButtons.get(buttonId)?.isEmpty()) {
				fileButtons.delete(buttonId);
			}

			if (fileButtons.size === 0) {
				this.buttons.delete(filePath);
			}
		}
	}
}
