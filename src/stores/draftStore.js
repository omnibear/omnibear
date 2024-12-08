import { observable, computed, action } from "mobx";
import { signal, batch, computed, effect } from "@preact/signals";
import settingsStore from "./settingsStore";
import { getDraft, saveDraft } from "../util/draft";
import { generateSlug } from "../util/utils";

class DraftStore {
	@observable title;
	@observable content;
	@observable tags;
	@observable slug;
	@observable type;
	@observable syndicateList = [];

	constructor() {
		const savedDraft = getDraft();
		this.title = savedDraft.title;
		this.content = savedDraft.content;
		this.tags = savedDraft.category.join(" ");
		// backwards support to <= v1.1.0 'mp-slug'
		this.slug = savedDraft.slug || savedDraft["mp-slug"];
		// backwards support to <= v1.1.0 'mp-syndicate to'
		this.syndicateList =
			savedDraft.syndicateTo || savedDraft["mp-syndicate-to"];
		this.type = savedDraft.type;
		this._settings = settingsStore;
		this._isSlugModified = false;
	}

	// MIGRATED: computed signal
	@computed
	get tagsArray() {
		return this.tags.trim().replace(/[\s+]/g, " ").split(" ");
	}

	// MIGRATED: computed signal
	@computed
	get isEmpty() {
		const x = !this.content && !this.slug && !this.title;
		return x;
	}

	// NOT MIGRATED
	@action
	setTitle(title) {
		this.title = title;
		this.updateSlug();
		this.save();
	}

	// NOT MIGRATED
	@action
	setContent(content) {
		this.content = content;
		this.updateSlug();
		this.save();
	}

	// MIGRATED: In an effect
	@action
	updateSlug() {
		if (!this.shouldAutoSlug() || this._isSlugModified) {
			return;
		}

		if (this.title) {
			this.slug = generateSlug(this.title);
		} else {
			this.slug = generateSlug(this.content);
		}
	}

	// MIGRATED: function
	@action
	setSlug(slug) {
		this.slug = slug.replace(/ /g, "-");
		this._isSlugModified = slug !== "";
		this.save();
	}

	// Not migrated
	@action
	setTags = (tagString) => {
		this.tags = tagString;
		this.save();
	};

	// NOT MIGRATED
	@action
	setSyndicateList = (syndicateTo) => {
		this.syndicateList = syndicateTo;
		this.save();
	};

	// NOT MIGRATED
	@action
	setType(type) {
		this.type = type;
		this.save();
	}

	// MIGRATED: function
	@action
	clear() {
		this.title = "";
		this.content = "";
		this.tags = "";
		this.slug = "";
		this.type = null;
		this._isSlugModified = false;
		this.save();
	}

	// MIGRATED: effect
	save() {
		saveDraft({
			title: this.title,
			content: this.content,
			category: this.tagsArray,
			slug: this.slug,
			syndicateTo: this.syndicateList,
			type: this.type,
		});
	}

	// MIGRATED: Inline in effect
	shouldAutoSlug() {
		if (this._isSlugModified) {
			return false;
		}
		if (this._settings.autoSlug) {
			return true;
		}
		return false;
	}
}

export default new DraftStore();
