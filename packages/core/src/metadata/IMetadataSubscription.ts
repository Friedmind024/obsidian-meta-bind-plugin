import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';

/**
 * Interface for a metadata subscription.
 */
export interface IMetadataSubscription {
	/**
	 * UUID for identification.
	 */
	uuid: string;
	/**
	 * Whether the subscription has been deleted. Used as a flag to prevent double deletion.
	 */
	deleted: boolean;
	/**
	 * The property the subscription is bound to and thus watches.
	 */
	bindTarget: BindTargetDeclaration | undefined;
	/**
	 * Unsubscribes from the cache.
	 */
	unsubscribe: () => void;
	/**
	 * Called when the metadata manager wats to delete the subscription.
	 */
	delete: () => void;
	/**
	 * Called by the metadata manager when the cache receives an update that concerns this subscription.
	 * This is NOT called with a clone of the value, so the subscription should not modify the value.
	 * If the subscription can't guarantee that the value won't be modified, it should clone the value.
	 *
	 * @param value
	 * @returns Whether the subscription has updated, i.e. the value was different from the current memorized value.
	 */
	onUpdate: (value: unknown) => boolean;
	/**
	 * Whether the subscription can be updated by the metadata manager.
	 */
	updatable(): boolean;
	/**
	 * Returns the dependencies of this subscription or an empty array if there are none.
	 */
	getDependencies: () => BindTargetDeclaration[];
}
