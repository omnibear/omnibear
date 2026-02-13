import { createEmptyDraft } from "./util/draft.js";
import { createDraftState } from "./popup/context/draftContext.js";

export interface SelectedEntry {
  type: "item";
  url: string;
  title: string;
}

export type Entry = ReturnType<typeof createEmptyDraft>;
export type Entity = ReturnType<
  ReturnType<typeof createDraftState>["getEntity"]
>;
