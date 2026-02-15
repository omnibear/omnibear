import { createEmptyDraft } from "./util/draft.js";
import { createDraftState } from "./popup/context/draftContext.js";

export interface SelectedEntry {
  type: "page" | "item" | "link" | string;
  url: string;
  title: string;
  /** Whether the page supports webmentions */
  webmention?: boolean;
}

export type Entry = ReturnType<typeof createEmptyDraft>;
export type Entity = ReturnType<
  ReturnType<typeof createDraftState>["getEntity"]
>;
