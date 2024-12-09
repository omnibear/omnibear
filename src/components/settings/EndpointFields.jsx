import { useState, useContext } from "preact/hooks";
import Settings from "../../contexts/Settings";

export default function EndpointFields() {
  const [showFields, setShowFields] = useState(false);
  const settings = useContext(Settings);

  return (
    <fieldset>
      <legend>Customize endpoint fields</legend>
      <div className="settings-form__description">
        If your micropub server expects custom or legacy fieldnames, you can
        specify those here
      </div>

      {showFields
        ? [
            <div key="slug">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                type="text"
                value={settings.slugFieldName}
                onChange={(e) =>
                  (settings.slugFieldName.value = e.target.value)
                }
              />
              <div className="settings-form__description">
                Choose the name of the field that the slug will be sent in. This
                should be <code>mp-slug</code> for up-to-date endpoints.
              </div>
            </div>,
            <div key="syndicate">
              <label htmlFor="syndicate-to">Syndicate To</label>
              <input
                id="syndicate-to"
                type="text"
                value={settings.syndicateToFieldName}
                onChange={(e) =>
                  (settings.syndicateToFieldName.value = e.target.value)
                }
              />
              <div className="settings-form__description">
                Choose the name of the field that the syndicate-to UIDs will be
                sent in. This should be <code>mp-syndicate-to</code> for
                up-to-date endpoints.
              </div>
            </div>,
          ]
        : null}
      <div className="text-right">
        <button type="button" onClick={() => setShowFields(!showFields)}>
          {showFields ? "Hide" : "Show"}
        </button>
      </div>
    </fieldset>
  );
}
