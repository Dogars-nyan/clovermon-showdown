export const Conditions: {[k: string]: ModdedConditionData} = {
	/* Modified conditions */
	gem: {
		inherit: true,
		onBasePower(basePower, user, target, move) {
			this.debug('Gem Boost');
			return this.chainModify(1.5);
		},
	},
};
