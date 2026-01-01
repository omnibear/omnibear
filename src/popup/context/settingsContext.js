import { createContext } from "preact";
import { signal, computed, effect } from "@preact/signals";
import {
	DEFAULT_REACJI,
	NOTE,
	REPLY,
	LIKE,
	BOOKMARK,
	REPOST,
	LOGIN,
	LOGS,
	SETTINGS,
} from "../../constants";
import storage from "../../util/storage";

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
	const postTypesOptions = signal(
		/** @type {{type: string, name: string}[]} */ ([]),
	);
	const aliases = computed(() => ({
		slug: slugFieldName.value,
		syndicateTo: syndicateToFieldName.value,
	}));
	const postTypesMap = computed(() => {
		// If no post types are configured, assume all are supported
		const defaultSupport = !(postTypesOptions.value?.length > 0);
		/** @type {Record<string, boolean>} */
		const map = {
			[NOTE]: defaultSupport,
			[REPLY]: defaultSupport,
			[BOOKMARK]: defaultSupport,
			[LIKE]: defaultSupport,
			[REPOST]: defaultSupport,
			[LOGIN]: true,
			[LOGS]: true,
			[SETTINGS]: true,
		};
		for (const postType of postTypesOptions.value || []) {
			if (postType.type in map) {
				map[postType.type] = true;
			}
		}

		return map;
	});

	storage.get(["settings", "syndicateTo", "postTypes"]).then((storedValues) => {
		if (storedValues.settings) {
			/**
			 *
			 * @param {ReturnType<typeof signal<boolean>>} stateSignal
			 * @param {boolean | undefined} storedValueToCheck
			 */
			function setStateFromStorage(stateSignal, storedValueToCheck) {
				if (storedValueToCheck != undefined) {
					stateSignal.value = storedValueToCheck;
				}
			}
			const storedSettings = storedValues.settings;
			setStateFromStorage(
				defaultToCurrentPage,
				storedSettings.defaultToCurrentPage,
			);
			setStateFromStorage(autoSlug, storedSettings.autoSlug);
			setStateFromStorage(closeAfterPosting, storedSettings.closeAfterPosting);
			setStateFromStorage(debugLog, storedSettings.debugLog);
			setStateFromStorage(reacji, storedSettings.reacji);
			setStateFromStorage(slugFieldName, storedSettings.slugFieldName);
			setStateFromStorage(
				syndicateToFieldName,
				storedSettings.syndicateToFieldName,
			);
		}
		if (storedValues.syndicateTo) {
			syndicateOptions.value = storedValues.syndicateTo;
		}
		if (storedValues.postTypes) {
			postTypesOptions.value = storedValues.postTypes;
		}
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
		postTypesOptions,
		postTypesMap,
		aliases,
	};
}

export const settingsState = createSettingsState();
export const settingsContext = createContext(settingsState);
export const SettingsProvider = settingsContext.Provider;
