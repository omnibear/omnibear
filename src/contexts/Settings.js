import { createContext } from "preact";
import { signal, computed, effect } from "@preact/signals";
import { DEFAULT_REACJI } from "../constants";
import storage from "../util/storage";

const MAX_LENGTH = 15;

export function createSettingsState() {
	const defaultToCurrentPage = signal(false);
	const autoSlug = signal(true);
	const closeAfterPosting = signal(false);
	const debugLog = signal(false);
	const reacji = signal([...DEFAULT_REACJI]);
	const slugFieldName = signal("mp-slug");
	const syndicateToFieldName = signal("mp-syndicate-to");
	const syndicateOptions = signal([]);
	const aliases = computed(() => ({
		slug: slugFieldName.value,
		syndicateTo: syndicateToFieldName.value,
	}));

	storage.get(["settings", "syndicateTo"]).then((storedValues) => {
		if (storedValues.settings) {
			const storedSettings = storedValues.settings;
			defaultToCurrentPage.value =
				storedSettings.defaultToCurrentPage ?? defaultToCurrentPage.value;
			autoSlug.value = storedSettings.autoSlug ?? autoSlug.value;
			closeAfterPosting.valure =
				storedSettings.closeAfterPosting ?? closeAfterPosting.value;
			debugLog.value = storedSettings.debugLog ?? debugLog.value;
			reacji.value = storedSettings.reacji ?? reacji.value;
			slugFieldName.value = storedSettings.slugFieldName ?? slugFieldName.value;
			syndicateToFieldName.value =
				storedSettings.syndicateToFieldName ?? syndicateToFieldName.value;
		}
		storedValues.value = storedValues.settings;
	});

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
		storage.set({ settings });
	});

	effect(() => {
		storage.set({ syndicateTo: syndicateOptions.value });
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

export const settingsState = createSettingsState();
const Settings = createContext(settingsState);
export default Settings;
export const SettingsProvider = Settings.Provider;
