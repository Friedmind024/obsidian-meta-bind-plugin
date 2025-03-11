import type { Editor, Menu } from 'obsidian';
import { stringifyYaml } from 'obsidian';
import {
	createInputFieldInsertExamples,
	createViewFieldInsertExamples,
} from 'packages/core/src/utils/InputFieldExamples';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

export function createEditorMenu(menu: Menu, editor: Editor, mb: ObsMetaBind): void {
	const inputFieldExamples = createInputFieldInsertExamples(mb);
	const viewFieldExamples = createViewFieldInsertExamples(mb);

	menu.addItem(mbItem => {
		mbItem.setTitle('Meta Bind');
		mbItem.setIcon('blocks');

		const mbSubmenu = mbItem.setSubmenu();

		mbSubmenu.addItem(ipfItem => {
			ipfItem.setTitle('Input Field');

			const ipfSubmenu = ipfItem.setSubmenu();

			for (const [type, declaration] of inputFieldExamples) {
				ipfSubmenu.addItem(item => {
					item.setTitle(type);
					item.onClick(() => insetAtCursor(editor, declaration));
				});
			}
		});

		mbSubmenu.addItem(vfItem => {
			vfItem.setTitle('View Field');

			const vfSubmenu = vfItem.setSubmenu();

			for (const [type, declaration] of viewFieldExamples) {
				vfSubmenu.addItem(item => {
					item.setTitle(type);
					item.onClick(() => insetAtCursor(editor, declaration));
				});
			}
		});

		mbSubmenu.addItem(inlineButtonItem => {
			inlineButtonItem.setTitle('Inline Button');
			inlineButtonItem.onClick(() => {
				insetAtCursor(editor, '`BUTTON[example-id]`');
			});
		});

		mbSubmenu.addItem(buttonItem => {
			buttonItem.setTitle('Button');
			buttonItem.onClick(() => {
				mb.internal.openButtonBuilderModal({
					onOkay: (config): void => {
						insetAtCursor(editor, `\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``);
					},
					submitText: 'Insert',
				});
			});
		});
	});
}

function insetAtCursor(editor: Editor, text: string): void {
	editor.replaceSelection(text);
}
