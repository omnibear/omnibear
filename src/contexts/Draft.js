import { createContext } from "preact";
import { signal, batch, computed, effect } from "@preact/signals";
import { createEmptyDraft, getDraft, saveDraft } from "../util/draft";
import { generateSlug } from "../util/utils";
import { settingsState } from "./Settings";

export function createDraftStore() {
	const defaultDraft = createEmptyDraft();

	const title = signal(defaultDraft.title);
	const content = signal(defaultDraft.content);
	const tags = signal(defaultDraft.category.join(", "));
	const slug = signal(defaultDraft.slug);
	const isSlugModified = signal(false);
	const type = signal(defaultDraft.type);
	const syndicateList = signal([]);

	const tagsArray = computed(() =>
		tags.value
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean)
	);
	const isEmpty = computed(() => !content.value && !slug.value && !title.value);

	effect(() => {
		const shouldAutoSlug = !isSlugModified.value && settingsState.autoSlug;

		if (!shouldAutoSlug || isSlugModified.value) {
			return;
		}

		slug.value = generateSlug(title.value ? title.value : content.value);
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

	function setSlug(newSlug) {
		batch(() => {
			slug.value = newSlug.replace(/ /g, "-");
			isSlugModified.value = slug.value !== "";
		});
	}

	function clear() {
		// TODO: Can we avoid setting defaults both here and create draft?
		batch(() => {
			title.value = "";
			content.value = "";
			tags.value = "";
			slug.value = "";
			type.value = null;
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
			entity.type = [type.value];
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

export const draftState = createDraftStore();
const Draft = createContext(draftState);
export const DraftProvider = Draft.Provider;
export default Draft;
