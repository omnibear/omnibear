import storage from "./storage";

export function createEmptyDraft() {
	return {
		title: "",
		content: "",
		category: [],
		slug: "",
		syndicateTo: [],
		type: null,
	};
}
const KEYS = Object.keys(createEmptyDraft());

export async function getDraft() {
	const { draft } = await storage.get(["draft"]);
	return draft || createEmptyDraft();
}

export async function saveDraft(draft) {
	const clean = {};
	KEYS.forEach((key) => {
		clean[key] = draft[key];
	});

	await storage.set({ draft: clean });
}

// export function deleteDraft() {
//   const draft = getDraft();
//   saveDraft({
//     content: '',
//     category: [],
//     slug: '',
//     syndicateTo: draft.syndicateTo,
//   });
// }
