import { truncate } from "fs";

export const Abilities: {[k: string]: ModdedAbilityData} = {
	/* Modified vanilla abilities */
	toxicboost: {
		inherit: true,
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isWeather(['acidrain'])) {
				return this.chainModify(1.5);
			} else if (((attacker.status === 'psn' || attacker.status === 'tox') && move.category === 'Physical')) {
				return this.chainModify(1.5);
			}
		},
		desc: "During Acid rain, the power of its attacks is multiplied by 1.5. If this Pokemon is poisoned, the power of its physical attacks is multiplied by 1.5.",
		shortDesc: "1.5x Atk and SpA during Acid Rain, else 1.5x Atk if poisoned",
		isNonstandard: null,
	},
	raindish: {
		inherit: true,
		onWeather(target, source, effect) {
			if (effect.id === 'acidrain' && !target.hasType('Poison')) {
				this.damage(target.baseMaxhp / 16, target, target);
			}
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		desc: "If Rain Dance is active, this Pokemon restores 1/16 of its maximum HP, rounded down. If Acid Rain is active and the Pokemon doesn't have the Poison type, it takes 1/16 of its maximum HP, rounded down, at the end of each turn. The Rain Dance effect is prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "Rain Dance: heals 1/16, Acid Rain: takes 1/16.",
		isNonstandard: null,
	},
	poisonheal: {
		inherit: true,
		onWeather(target, source, effect) {
			if (effect.id === 'acidrain') this.heal(target.baseMaxhp / 14);
		},
		onImmunity(type, pokemon) {
			if (type === 'acidrain') return false;
		},
		desc: "If this Pokemon is poisoned, it restores 1/8 of its maximum HP, rounded down, at the end of each turn instead of losing HP. Also heals 1/14 of its maximum HP on Acid Rain.",
		shortDesc: "Heals 1/8 if psn and 1/14 if Acid Rain.",
		isNonstandard: null,
	},
	immunity: {
		inherit: true,
		onImmunity(type, pokemon) {
			if (type === 'acidrain') return false;
		},
		shortDesc: "Can't be psn and cures it. Immune to Acid Rain.",
		isNonstandard: null,
	},
	overcoat: {
		inherit: true,
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'acidrain' || type === 'bladerain' || type === 'hyperboreanarctic' || type === 'powder') return false;
		},
		onTryHit() {},
		desc: "This Pokemon is immune to damage from Sandstorm, Hail, Acid Rain, Blade Rain and the Effect Spore Ability.",
		shortDesc: "Immune to Sandstorm, Hail, Acid Rain and Blade Rain damage.",
		isNonstandard: null,
	},
	chlorophyll: {
		inherit: true,
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather('midnight')) {
				return this.chainModify(0.5);
			}
			if (pokemon.hasItem('utilityumbrella')) return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		desc: "If Sunny Day is active, this Pokemon's Speed is doubled, this effect is prevented if this Pokemon is holding a Utility Umbrella. If Midnight is active, this Pokemon's Speed is halved.",
		shortDesc: "Sunny Day: spd doubled. Midnight: spd halved.",
		isNonstandard: null,
	},
	heavymetal: {
		inherit: true,
		onImmunity(type, pokemon) {
			if (type === 'bladerain') return false;
		},
		desc: "This Pokemon's weight is doubled. This effect is calculated after the effect of Autotomize, and before the effect of Float Stone. It's immune to Blade Rain.",
		shortDesc: "Weight doubled. Immune to Blade Rain.",
		isNonstandard: null,
	},
	forecast: {
		inherit: true,
		onWeather(target, source, effect) {
			if (effect.id === 'hail') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		onModifySpe(spe, pokemon) {
			if (pokemon.hasItem('utilityumbrella')) return;
			if (this.field.isWeather(['sunnyday', 'desolateland', 'raindance', 'primordialsea'])) return this.chainModify(2);
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (this.field.isWeather('sandstorm')) {
				if (typeof accuracy !== 'number') return;
				this.debug('Forecast - decreasing accuracy');
				return this.chainModify(1.2);
			}
		},
		desc: "If Hail is active, heal 1/16 of the Pokemon's HP. If Sunny Day or Rain Dance is active, boost speed by 2. If this Pokemon is a Castform, its type changes to the current weather condition's type, except Sandstorm. This effect is prevented if this Pokemon is holding a Utility Umbrella and the weather is Rain Dance or Sunny Day.",
		shortDesc: "Hail, Heals 1/16 max HP. Sun, Rain, Doubles speed. Sandstorm, Evasion x1.2. Transforms Castform.",
		isNonstandard: null,
	},
	pixilate: {
		inherit: true,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([5325, 4096]);
		},
	},
	refrigerate: {
		inherit: true,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([5325, 4096]);
		},
	},
	aerilate: {
		inherit: true,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([5325, 4096]);
		},
	},
	protean: {
		inherit: true,
		onPrepareHit(source, target, move) {
			if (move.hasBounced || move.isFutureMove || move.sourceEffect === 'snatch') return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Protean');
			}
		},
		onSwitchIn() {},
		rating: 4.5,
	},
	illuminate: {
		inherit: true,
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy === 'number') {
				return this.chainModify(1.1);
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Dark') {
				this.debug('Illuminate weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Dark') {
				this.debug('Illuminate weaken');
				return this.chainModify(0.5);
			}
		},
		isBreakable: true,
		shortDesc: "x1.1 accuracy. Dark-type moves against this Pokemon deal damage with a halved offensive stat.",
		rating: 2.5,
	},
	magmaarmor: {
		inherit: true,
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire' || move.type === 'Magma') {
				this.debug('Magma Armor boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire' || move.type === 'Magma') {
				this.debug('Magma Armor boost');
				return this.chainModify(1.5);
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ice') {
				this.debug('Magma Armor weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Ice') {
				this.debug('Magma Armor weaken');
				return this.chainModify(0.5);
			}
		},
		shortDesc: "Immune to frz. Boosts Fire- and Magma-type moves. Ice-type moves against this Pokemon deal damage with a halved offensive stat.",
	},
	waterveil: {
		inherit: true,
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Water') {
				this.debug('Water Veil boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Water') {
				this.debug('Water Veil boost');
				return this.chainModify(1.5);
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Water Veil weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Water Veil weaken');
				return this.chainModify(0.5);
			}
		},
		shortDesc: "Immune to brn. Boosts Water-type moves. Fire-type moves against this Pokemon deal damage with a halved offensive stat.",
	},
	keeneye: {
		inherit: true,
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy === 'number') {
				return this.chainModify(1.05);
			}
		},
		onModifyMove() {},
		desc: "Prevents other Pokemon from lowering this Pokemon's accuracy stat stage. This Pokemon's accuracy is boosted by x1.05",
		shortDesc: "This Pokemon's accuracy is boosted by x1.05 and can't be lowered by others.",
	},
	hypercutter: {
		inherit: true,
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sword']) {
				this.debug('Hyper Cutter boost');
				return this.chainModify(1.2);
			}
		},
		shortDesc: "Prevents this Pokemon's Attack stat drop. Boosts sword-based attacks.",
	},
	hustle: {
		inherit: true,
		onModifySpAPriority: 5,
		onModifySpA(spa) {
			return this.modify(spa, 1.5);
		},
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (move.category !== 'Status' && typeof accuracy === 'number') {
				return this.chainModify([3277, 4096]);
			}
		},
		desc: "This Pokemon's Attack and Special Attack stats is multiplied by 1.5 and the accuracy of its attacks is multiplied by 0.8.",
		shortDesc: "This Pokemon's Atk and SpA is 1.5x and accuracy of its attacks is 0.8x.",
	},
	heatproof: {
		inherit: true,
		onSourceBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Fire' || move.type === 'Magma') {
				return this.chainModify(0.5);
			}
		},
		desc: "The power of Fire and Magma-type attacks against this Pokemon is halved. This Pokemon takes half of the usual burn damage, rounded down.",
		shortDesc: "The power of Fire and Magma-type attacks against this Pokemon is halved; burn damage halved.",
	},
	scrappy: {
		inherit: true,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity = true;
			}
		},
		onBoost(boost, target, source, effect) {},
		desc: "This Pokemon can hit all types.",
		shortDesc: "Damaging moves ignore immunities.",
	},
	bigpecks: {
		inherit: true,
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['beak']) {
				this.debug('Big Pecks boost');
				return this.chainModify(1.5);
			}
		},
		shortDesc: "Prevents Defense stat drop. Boosts beak-like attacks.",
	},
	// Gen5 vanilla abilities
	anticipation: {
		inherit: true,
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					if (move.category !== 'Status' && (
						this.dex.getImmunity(move.type, pokemon) && this.dex.getEffectiveness(move.type, pokemon) > 0 ||
						move.ohko
					)) {
						this.add('-ability', pokemon, 'Anticipation');
						return;
					}
				}
			}
		},
	},
	frisk: {
		inherit: true,
		onStart(pokemon) {
			const target = pokemon.side.randomFoe();
			if (target?.item) {
				this.add('-item', target, target.getItem().name, '[from] ability: Frisk', '[of] ' + pokemon);
			}
		},
	},
	oblivious: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.volatiles['attract']) {
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] ability: Oblivious');
			}
		},
		onTryHit(pokemon, target, move) {
			if (move.id === 'captivate') {
				this.add('-immune', pokemon, '[from] Oblivious');
				return null;
			}
		},
		rating: 0.5,
	},
	sapsipper: {
		inherit: true,
		onAllyTryHitSide() {},
	},
	serenegrace: {
		inherit: true,
		onModifyMove(move) {
			if (move.secondaries && move.id !== 'secretpower') {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			}
		},
	},
	soundproof: {
		inherit: true,
		onAllyTryHitSide() {},
	},
	/* Wack abilities */
	darklife: {
		inherit: true,
		isNonstandard: null,
	},
	memetic: {
		inherit: true,
		isNonstandard: null,
	},
	isolation: {
		inherit: true,
		isNonstandard: null,
	},
	acidcloudburst: {
		inherit: true,
		isNonstandard: null,
	},
	ethereal: {
		inherit: true,
		isNonstandard: null,
	},
	mozart: {
		inherit: true,
		isNonstandard: null,
	},
	pride: {
		inherit: true,
		isNonstandard: null,
	},
	pounce: {
		inherit: true,
		isNonstandard: null,
	},
	vespertine: {
		inherit: true,
		isNonstandard: null,
	},
	acidrush: {
		inherit: true,
		isNonstandard: null,
	},
	headache: {
		inherit: true,
		isNonstandard: null,
	},
	windate: {
		inherit: true,
		isNonstandard: null,
	},
	immolate: {
		inherit: true,
		isNonstandard: null,
	},
	sunbathe: {
		inherit: true,
		isNonstandard: null,
	},
	snowrush: {
		inherit: true,
		isNonstandard: null,
	},
	magicate: {
		inherit: true,
		isNonstandard: null,
	},
	oasis: {
		inherit: true,
		isNonstandard: null,
	},
	winterforce: {
		inherit: true,
		isNonstandard: null,
	},
	evaporate: {
		inherit: true,
		isNonstandard: null,
	},
	berserker: {
		inherit: true,
		isNonstandard: null,
	},
	martialate: {
		inherit: true,
		isNonstandard: null,
	},
	machinate: {
		inherit: true,
		isNonstandard: null,
	},
	furiousfeet: {
		inherit: true,
		isNonstandard: null,
	},
	thicktail: {
		inherit: true,
		isNonstandard: null,
	},
	skeptic: {
		inherit: true,
		isNonstandard: null,
	},
	coldblooded: {
		inherit: true,
		isNonstandard: null,
	},
	lodestone: {
		inherit: true,
		isNonstandard: null,
	},
	vaporize: {
		inherit: true,
		isNonstandard: null,
	},
	firewall: {
		inherit: true,
		isNonstandard: null,
	},
	focus: {
		inherit: true,
		isNonstandard: null,
	},
	shadowcall: {
		inherit: true,
		isNonstandard: null,
	},
	wacky: {
		inherit: true,
		isNonstandard: null,
	},
	hydrate: {
		inherit: true,
		isNonstandard: null,
	},
	sugarrush: {
		inherit: true,
		isNonstandard: null,
	},
	vacuum: {
		inherit: true,
		isNonstandard: null,
	},
	solarforce: {
		inherit: true,
		isNonstandard: null,
	},
	ionate: {
		inherit: true,
		isNonstandard: null,
	},
	graze: {
		inherit: true,
		isNonstandard: null,
	},
	pro: {
		inherit: true,
		isNonstandard: null,
	},
	builder: {
		inherit: true,
		isNonstandard: null,
	},
	siphon: {
		inherit: true,
		isNonstandard: null,
	},
	bellows: {
		inherit: true,
		isNonstandard: null,
	},
	sadist: {
		inherit: true,
		isNonstandard: null,
	},
	metalworker: {
		inherit: true,
		isNonstandard: null,
	},
	drumroll: {
		inherit: true,
		isNonstandard: null,
	},
	explosive: {
		inherit: true,
		isNonstandard: null,
	},
	dreamcatcher: {
		inherit: true,
		isNonstandard: null,
	},
	irradiated: {
		inherit: true,
		isNonstandard: null,
	},
	safeshield: {
		inherit: true,
		isNonstandard: null,
	},
	choicepower: {
		inherit: true,
		isNonstandard: null,
	},
	cactus: {
		inherit: true,
		isNonstandard: null,
	},
	vastknowledge: {
		inherit: true,
		isNonstandard: null,
	},
	neutral: {
		inherit: true,
		isNonstandard: null,
	},
	rubberboost: {
		inherit: true,
		isNonstandard: null,
	},
	activecurrent: {
		inherit: true,
		isNonstandard: null,
	},
	triggered: {
		inherit: true,
		isNonstandard: null,
	},
	glitchboost: {
		inherit: true,
		isNonstandard: null,
	},
	thunderstorm: {
		inherit: true,
		isNonstandard: null,
	},
	flytrap: {
		inherit: true,
		isNonstandard: null,
	},
	wishmaker: {
		inherit: true,
		isNonstandard: null,
	},
	burningdisease: {
		inherit: true,
		isNonstandard: null,
	},
	computerbug: {
		inherit: true,
		isNonstandard: null,
	},
	trashpile: {
		inherit: true,
		isNonstandard: null,
	},
	godsendurance: {
		inherit: true,
		isNonstandard: null,
	},
	souleater: {
		inherit: true,
		isNonstandard: null,
	},
	polite: {
		inherit: true,
		isNonstandard: null,
	},
	/** Wack abilities that have their name taken by Clover */
	turbine: {
		inherit: true,
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Wind') {
				if (!this.boost({spa: 1})) {
					this.add('-immune', target, '[from] ability: Turbine');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (move.type !== 'Wind' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Turbine');
				}
				return this.effectState.target;
			}
		},
		name: "Turbine",
		shortDesc: "Draws in all Wind-type moves to up Sp. Attack.",
		desc: "Draws in all Wind-type moves to up Sp. Attack.",
		isBreakable: true,
		isNonstandard: null,
	},
	constrictor: {
		inherit: true,
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.volatileStatus === 'partiallytrapped') {
				this.debug('Constrictor boost');
				return this.chainModify(1.3);
			}
		},
		name: "Constrictor",
		shortDesc: "Boosts the power of trapping moves.",
		desc: "Boosts the power of trapping moves.",
		isBreakable: false,
		isNonstandard: null,
	},
	breakdown: {	/** Same as in data/abilities.ts */
		inherit: true,
		isNonstandard: null,
	},
	cacophony: {
		inherit: true,
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) {
				this.debug('Cacophony boost');
				return this.chainModify([4915, 4096]);
			}
		},
		onTryHit(target, source, move) {},
		onAllyTryHitSide(target, source, move) {},
		name: "Cacophony",
		shortDesc: "Boosts the power of sound based moves.",
		desc: "Boosts the power of sound based moves.",
		isBreakable: false,
		isNonstandard: null,
	},
	balance: {		/** Same as in data/abilities.ts */
		inherit: true,
		shortDesc: "NVE moves are boosted, SE moves against the Pokemon are weakened.",
		desc: "This pokemon's not very effective moves are boosted and super effective moves against it are decreased.",
		isNonstandard: null,
	},
	detonator: {
		inherit: true,
		onModifyMove(move, pokemon, target) {
			if (move.selfdestruct) delete move.selfdestruct;
		},
		onAfterMove(source, target, move) {
			if (['explosion', 'mindblown', 'mistyexplosion', 'selfdestruct'].includes(move.id)) {
				this.damage(source.baseMaxhp / 5, source, source)
			}
		},
		onBasePowerPriority: undefined,
		onBasePower(basePower, attacker, defender, move) {},
		name: "Detonator",
		shortDesc: "Explosion don't kill, 1/5 max HP recoil.",
		desc: "Explosion moves do not kill the user, just recoil.",
		isNonstandard: null,
	},
	infected: {
		inherit: true,
		shortDesc: "Contact spreads this Ability. Dmgs non-Zombie and Virus types.",
		desc: "Contact spreads this Ability. Dmgs non-Zombie and Virus types.",
		isNonstandard: null,
	},
};