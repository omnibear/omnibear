import { createContext } from "preact";
import { signal, batch, computed, effect } from "@preact/signals";
import { createEmptyDraft, getDraft, saveDraft } from "../../util/draft";
import { generateSlug } from "../../util/utils";
import { settingsState } from "./settingsContext";

/** @typedef {ReturnType<typeof createEmptyDraft>} Entity */
/** @typedef {ReturnType<ReturnType<typeof createDraftState>["getEntity"]>} Entry */

export function createDraftState() {
	const defaultDraft = createEmptyDraft();

	const title = signal(defaultDraft.title);
	const content = signal(defaultDraft.content);
	const tags = signal(defaultDraft.category.join(", "));
	const slug = signal(defaultDraft.slug);
	const isSlugModified = signal(false);
	const type = signal(/** @type {string | null} */ (defaultDraft.type));
	const syndicateList = signal([]);

	const tagsArray = computed(() =>
		tags.value
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean)
	);
	const isEmpty = computed(() => !content.value && !slug.value && !title.value);

	/**
	 *
	 * @param {Entity} draft
	 */
	function setValuesFromDraft(draft) {
		title.value = draft.title;
		content.value = draft.content;
		tags.value = draft.category?.join(", ");
		slug.value = draft.slug;
		syndicateList.value = draft.syndicateTo;
		type.value = draft.type;
	}

	getDraft().then(setValuesFromDraft);

	effect(() => {
		const contentToSlugify = title.value ? title.value : content.value;
		if (settingsState.autoSlug.value && !isSlugModified.peek()) {
			slug.value = generateSlug(contentToSlugify);
		}
	});

	effect(() => {
		saveDraft({
			title: title.value,
			content: content.value,
			category: tagsArray.value,
			slug: slug.value,
			syndicateTo: syndicateList.value,
			type: type.value,
		});
	});

	/**
	 * Set the slug value, replacing spaces with dashes
	 * @param {string} newSlug New raw slug value
	 */
	function setSlug(newSlug) {
		batch(() => {
			slug.value = newSlug.replace(/ /g, "-");
			isSlugModified.value = slug.value !== "";
		});
	}

	function clear() {
		batch(() => {
			setValuesFromDraft(createEmptyDraft());
			isSlugModified.value = false;
		});
	}

	function getEntity() {
		const entity = {
			type: type.value,
			title: title.value,
			content: content.value,
			tagsArray: tagsArray.value,
			slug: slug.value,
			syndicateList: syndicateList.value,
		};

		if (type.value) {
			entity.type = type.value;
		}

		return entity;
	}

	return {
		title,
		content,
		tags,
		tagsArray,
		slug,
		type,
		syndicateList,
		isEmpty,
		setSlug,
		clear,
		getEntity,
	};
}

export const draftState = createDraftState();
export const draftContext = createContext(draftState);
export const DraftProvider = draftContext.Provider;
