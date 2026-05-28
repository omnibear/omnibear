import { createEmptyDraft } from "./util/draft.js";
import { createDraftState } from "./popup/context/draftContext.js";

export interface SelectedEntry {
  type: "page" | "item" | "link" | string;
  url: string;
  title: string;
  /** Whether the page supports webmentions */
  webmention?: boolean;
}

/**
 * Micropub syndication target account/service details.
 * Spec: https://www.w3.org/TR/micropub/#syndication-targets
 */
export interface MicropubSyndicationTargetDetails {
  /** Human-readable name to display in the client UI. */
  name: string;
  /** Optional URL for the service or user profile. */
  url?: string;
  /** Optional image URL for the service or user. */
  photo?: string;
}

/**
 * Micropub syndication target returned from q=syndicate-to or q=config.
 * Spec: https://www.w3.org/TR/micropub/#syndication-targets
 */
export interface MicropubSyndicationTarget {
  /** Opaque identifier sent back in mp-syndicate-to. */
  uid: string;
  /** Human-readable destination label for users. */
  name: string;
  /** Optional destination service metadata. */
  service?: MicropubSyndicationTargetDetails;
  /** Optional destination user/account metadata. */
  user?: MicropubSyndicationTargetDetails;
}

export interface MicropubSyndicationTargetsResponse {
  "syndicate-to": MicropubSyndicationTarget[];
}

export type Entry = ReturnType<typeof createEmptyDraft>;
export type Entity = ReturnType<
  ReturnType<typeof createDraftState>["getEntity"]
>;
