<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import type { UpdateMetadataButtonAction } from 'packages/core/src/config/ButtonConfig';

	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import Toggle from 'packages/core/src/utils/components/Toggle.svelte';

	const {
		mb,
		action = $bindable(),
	}: {
		mb: MetaBind;
		action: UpdateMetadataButtonAction;
	} = $props();
</script>

<SettingComponent name="Metadata property" description="The metadata property in form of a bind target.">
	<input type="text" bind:value={action.bindTarget} placeholder="some value" />
</SettingComponent>

<SettingComponent name="Value" description="The new value.">
	<input type="text" bind:value={action.value} placeholder="some value" />
</SettingComponent>

<SettingComponent name="Evaluate" description="Whether to evaluate the value as a JS expression.">
	<Toggle bind:checked={action.evaluate}></Toggle>
</SettingComponent>
