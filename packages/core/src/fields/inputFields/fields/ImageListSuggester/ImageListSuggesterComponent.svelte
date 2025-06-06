<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import type { ContextMenuItemDefinition } from 'packages/core/src/utils/IContextMenu';
	import { stringifyLiteral } from 'packages/core/src/utils/Literal';

	const props: InputFieldSvelteProps<string[]> & {
		showSuggester: () => void;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: string[]): void {
		value = v;
	}

	export function pushValue(v: string): void {
		value.push(v);
		props.onValueChange($state.snapshot(value));
	}

	function remove(i: number): void {
		value.splice(i, 1);
		props.onValueChange($state.snapshot(value));
	}

	function openContextMenuForElement(e: MouseEvent, index: number): void {
		const menuActions: ContextMenuItemDefinition[] = [];

		if (index > 0) {
			menuActions.push({
				name: 'Move left',
				icon: 'arrow-left',
				onclick: () => {
					const temp = value[index - 1];
					value[index - 1] = value[index];
					value[index] = temp;
					props.onValueChange($state.snapshot(value));
				},
			});
		}

		if (index < value.length - 1) {
			menuActions.push({
				name: 'Move right',
				icon: 'arrow-right',
				onclick: () => {
					const temp = value[index + 1];
					value[index + 1] = value[index];
					value[index] = temp;
					props.onValueChange($state.snapshot(value));
				},
			});
		}

		menuActions.push({
			name: 'Copy image path',
			icon: 'copy',
			onclick: () => {
				const imagePath = value[index];

				// in this case, using `.then()` is nicer than `await` and a try-catch block
				navigator.clipboard
					.writeText(imagePath)
					.then(() => {
						props.mb.internal.showNotice('Image path copied to clipboard');
					})
					.catch(() => {
						props.mb.internal.showNotice('Failed to copy image path to clipboard');
					});
			},
		});

		menuActions.push({
			name: 'Remove',
			icon: 'x',
			warning: true,
			onclick: () => remove(index),
		});

		props.mb.internal.createContextMenu(menuActions).showWithEvent(e);
	}
</script>

<div class="mb-image-card-grid">
	{#each value as image, i}
		<div
			class="mb-image-card"
			oncontextmenu={e => openContextMenuForElement(e, i)}
			role="listitem"
			data-value={stringifyLiteral(image)}
		>
			<img
				class="mb-image-card-image"
				src={props.mb.internal.imagePathToUri(image)}
				alt={image}
				aria-label={image}
			/>
		</div>
	{/each}
</div>
<div class="mb-list-input">
	<Button variant={ButtonStyleType.DEFAULT} onclick={() => props.showSuggester()}>Add new image</Button>
</div>
