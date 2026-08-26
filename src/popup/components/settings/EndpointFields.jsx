import { useState, useContext } from "preact/hooks";
import { settingsContext } from "../../context/settingsContext";

export default function EndpointFields() {
  const [showFields, setShowFields] = useState(false);
  const settings = useContext(settingsContext);

  return (
    <fieldset>
      <legend>Customize endpoint fields (legacy)</legend>
      <div className="settings-form__description">
        Override micropub field names.Typically only needed to support legacy
        servers.
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
              <div className="settings-form__description">Default: mp-slug</div>
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
                Default: mp-syndicate-to
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
