import { signal, batch, computed, effect } from "@preact/signals";
import { observable, action, computed } from "mobx";
import { DEFAULT_REACJI } from "../constants";

const MAX_LENGTH = 15;

export function createSettingsStore() {
	const storedSettings = JSON.parse(localStorage.getItem("settings")) || {};
	const defaultToCurrentPage = signal(
		storedSettings.defaultToCurrentPage ?? false
	);
	const autoSlug = signal(storedSettings.autoSlug ?? true);
	const closeAfterPosting = signal(storedSettings.closeAfterPosting ?? false);
	const debugLog = signal(storedSettings.debugLog ?? false);
	const reacji = signal(storedSettings.reacji ?? [...DEFAULT_REACJI]);
	const slugFieldName = signal(storedSettings.slugFieldName ?? "mp-slug");
	const syndicateToFieldName = signal(
		storedSettings.syndicateToFieldName ?? "mp-syndicate-to"
	);
	const syndicateOptions = signal(
		JSON.parse(localStorage.getItem("syndicateTo")) ?? []
	);
	const aliases = computed(() => ({
		slug: slugFieldName.value,
		syndicateTo: syndicateToFieldName.value,
	}));

	effect(() => {
		const settings = {
			defaultToCurrentPage: defaultToCurrentPage.value,
			autoSlug: autoSlug.value,
			closeAfterPosting: closeAfterPosting.value,
			debugLog: debugLog.value,
			reacji: reacji.value,
			slugFieldName: slugFieldName.value,
			syndicateToFieldName: syndicateToFieldName.value,
		};
		localStorage.setItem("settings", JSON.stringify(settings));
	});

	effect(() => {
		localStorage.setItem("syndicateTo", JSON.stringify(syndicateOptions.value));
	});

	function addReacji(value) {
		reacji.value = [...reacji.value, value.substr(0, MAX_LENGTH)];
	}

	return {
		defaultToCurrentPage,
		autoSlug,
		closeAfterPosting,
		debugLog,
		reacji,
		slugFieldName,
		syndicateToFieldName,
		addReacji,
		syndicateOptions,
		aliases,
	};
}

class SettingsStore {
	@observable defaultToCurrentPage = false;
	@observable autoSlug = true;
	@observable closeAfterPosting = false;
	@observable debugLog = false;
	@observable reacji = DEFAULT_REACJI;
	@observable slugFieldName = "mp-slug";
	@observable syndicateToFieldName = "mp-syndicate-to";

	constructor() {
		this.loadSettings();
	}

	// MIGRATED: Factory initialization
	@action
	loadSettings() {
		const settings = JSON.parse(localStorage.getItem("settings"));
		if (!settings) {
			return;
		}
		this.defaultToCurrentPage = settings.defaultToCurrentPage;
		this.autoSlug = settings.autoSlug;
		this.closeAfterPosting = settings.closeAfterPosting;
		this.debugLog = settings.debugLog;
		this.reacji = settings.reacji || this.reacji;
		this.slugFieldName = settings.slug || this.slugFieldName;
		this.syndicateToFieldName =
			settings.syndicateTo || this.syndicateToFieldName;
	}

	// MIGRATED: remove setter, use effect to save
	@action
	setDefaultToCurrentPage = (on = true) => {
		this.defaultToCurrentPage = on;
		this.save();
	};

	// MIGRATED: remove setter, use effect to save
	@action
	setAutoSlug = (on = true) => {
		this.autoSlug = on;
		this.save();
	};

	// MIGRATED: remove setter, use effect to save
	@action
	setCloseAfterPosting = (on = true) => {
		this.closeAfterPosting = on;
		this.save();
	};

	// MIGRATED: remove setter, use effect to save
	@action
	setDebugLog = (on = true) => {
		this.debugLog = on;
		this.save();
	};

	// MIGRATED: remove setter, use effect to save
	@action
	setReacji = (reacji) => {
		this.reacji = reacji;
		this.save();
	};

	// MIGRATED: function to set
	@action
	addReacji = (value) => {
		this.reacji.push(value.substr(0, MAX_LENGTH));
	};

	// MIGRATED: remove setter, use effect to save
	@action
	setSlugFieldName = (name) => {
		this.slugFieldName = name;
		this.save();
	};

	// MIGRATED: remove setter, use effect to save
	@action
	setSyndicateToFieldName = (name) => {
		this.syndicateToFieldName = name;
		this.save();
	};

	// MIGRATED: Signal with effect to save
	getSyndicateOptions() {
		const options = localStorage.getItem("syndicateTo");
		if (options && options !== "undefined") {
			return JSON.parse(options);
		} else {
			// Fix bad data from omnibear v1.0.0 bug that saved 'undefined' to localStorage
			localStorage.setItem("syndicateTo", "[]");
			return [];
		}
	}

	// MIGRATED: computed signal
	@computed
	get aliases() {
		return {
			slug: this.slugFieldName || "mp-slug",
			syndicateTo: this.syndicateToFieldName || "mp-syndicate-to",
		};
	}

	// MIGRATED: effect
	save = () => {
		const settings = {
			defaultToCurrentPage: this.defaultToCurrentPage,
			autoSlug: this.autoSlug,
			closeAfterPosting: this.closeAfterPosting,
			debugLog: this.debugLog,
			reacji: this.reacji,
			slug: this.slugFieldName,
			syndicateTo: this.syndicateToFieldName,
		};
		localStorage.setItem("settings", JSON.stringify(settings));
	};
}

export default new SettingsStore();
