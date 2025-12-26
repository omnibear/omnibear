import { useState, useContext, useRef } from "preact/hooks";
import { publishContext } from "../../context/publishContext";
import { draftContext } from "../../context/draftContext";
import { settingsContext } from "../../context/settingsContext";
import QuickReplies from "./QuickReplies";
import SyndicateInputs from "./SyndicateInputs";
import Message from "../Message";

export default function NoteForm() {
  const publish = useContext(publishContext);
  const draft = useContext(draftContext);
  const settings = useContext(settingsContext);
  const [syndicateOptions, setSyndicateOptions] = useState(
    settings.syndicateOptions.value
  );
  const content = useRef(null);
  const onSubmit = (e) => {
    e.preventDefault();
    publish.send();
    return false;
  };
  const onClear = () => {
    if (confirm("Are you sure you want to clear the draft?")) {
      draft.clear();
    }
  };

  const isLoading = publish.isSending.value;
  return (
    <form className="container" onSubmit={onSubmit}>
      {publish.includeTitle.value ? (
        <div>
          <label htmlFor="input-title">Title</label>
          <input
            id="input-title"
            type="text"
            name="title"
            value={draft.title}
            onInput={(e) => (draft.title.value = e.target.value)}
            disabled={isLoading}
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="input-content">Content</label>
        <textarea
          id="input-content"
          value={draft.content}
          onInput={(e) => (draft.content.value = e.target.value)}
          onBlur={(e) => (draft.content.value = e.target.value)}
          rows="4"
          disabled={isLoading}
          ref={content}
        />
        <div className="input-extra">{draft.content.length}</div>
        <QuickReplies />
      </div>
      <div>
        <label htmlFor="input-tags">Tags (comma separated)</label>
        <input
          id="input-tags"
          type="text"
          placeholder="e.g. web, personal"
          value={draft.tags}
          onChange={(e) => (draft.tags.value = e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="input-slug">Slug</label>
        <input
          id="input-slug"
          type="text"
          name="mp-slug"
          value={draft.slug}
          onInput={(e) => draft.setSlug(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <SyndicateInputs
        options={syndicateOptions}
        selected={draft.syndicateList}
        onUpdate={draft.setSyndicateList}
        isDisabled={isLoading}
      />
      {publish.flashMessage.value ? (
        <Message message={publish.flashMessage.value} />
      ) : null}
      <button
        type="submit"
        disabled={isLoading || !draft.content}
        className={isLoading ? "button is-loading" : "button"}
      >
        Post
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={isLoading || !draft.content}
        className={"button button-outline" + (isLoading ? " is-loading" : "")}
      >
        Clear
      </button>
    </form>
  );
}
