import { useState, useEffect, useContext, useRef } from "preact/hooks";
import AppContext from "../../contexts/App";
import Draft from "../../contexts/Draft";
import Settings from "../../contexts/Settings";
import QuickReplies from "./QuickReplies";
import SyndicateInputs from "./SyndicateInputs";
import Message from "../Message";

export default function NoteForm() {
  const app = useContext(AppContext);
  const draft = useContext(Draft);
  const settings = useContext(Settings);
  const [syndicateOptions, setSyndicateOptions] = useState(
    settings.syndicateOptions.value
  );
  const content = useRef(null);
  const onSubmit = (e) => {
    e.preventDefault();
    app.send();
    return false;
  };

  const isLoading = app.isSending.value;
  return (
    <form className="container" onSubmit={onSubmit}>
      {app.includeTitle.value ? (
        <div>
          <label htmlFor="input-title">Title</label>
          <input
            id="input-title"
            type="text"
            name="title"
            value={draft.title}
            onInput={(e) => draft.setTitle(e.target.value)}
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
        <label htmlFor="input-tags">Tags (space separated)</label>
        <input
          id="input-tags"
          type="text"
          placeholder="e.g. web  personal"
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
      {app.flashMessage.value ? (
        <Message message={app.flashMessage.value} />
      ) : null}
      <button
        type="submit"
        disabled={isLoading || !draft.content}
        className={isLoading ? "button is-loading" : "button"}
      >
        Post
      </button>
    </form>
  );
}
