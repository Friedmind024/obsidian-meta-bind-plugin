<script lang="ts">
	import type { SleepButtonAction } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';

	const {
		plugin,
		action = $bindable(),
	}: {
		plugin: IPlugin;
		action: SleepButtonAction;
	} = $props();
</script>

<SettingComponent name="Sleep time" description="The time to sleep in milliseconds.">
	<input type="number" bind:value={action.ms} placeholder="100 ms" />
</SettingComponent>
