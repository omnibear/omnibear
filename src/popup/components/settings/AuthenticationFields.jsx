import { useContext } from "preact/hooks";
import { signal } from "@preact/signals";
import { authContext } from "../../context/authContext";

const showFields = signal(false);
export default function AuthenticationFields() {
  const auth = useContext(authContext);

  /**
   * Cleans up the input from dom events
   * @param {import('@preact/signals').Signal<string>} signal The signal to update
   * @returns A callback function
   */
  const update = (signal) => {
    /** @param {Event} event */
    return (event) => {
      signal.value =
        /** @type {HTMLInputElement} */ (event.target)?.value || "";
    };
  };

  return (
    <fieldset>
      <legend>Authentication details (advanced)</legend>
      <div className="settings-form__description">
        These values are set automatically upon logging in. Only edit them if
        you are having trouble authenticating and wish to do so manually.
      </div>

      {showFields.value
        ? [
            <div key="domain">
              <label htmlFor="domain">Me (domain name)</label>
              <input
                id="domain"
                type="text"
                value={auth.domain}
                onChange={update(auth.domain)}
                placeholder="https://example.com"
              />
            </div>,
            <div key="endpoint">
              <label htmlFor="mp-endpoint">Micropub endpoint</label>
              <input
                id="mp-endpoint"
                type="text"
                value={auth.micropubEndpoint}
                onChange={update(auth.micropubEndpoint)}
                placeholder="https://example.com/micropub"
              />
            </div>,
            <div key="token">
              <label htmlFor="token">OAuth Token</label>
              <input
                id="token"
                type="text"
                value={auth.token}
                onChange={update(auth.token)}
              />
            </div>,
          ]
        : null}
      <div className="text-right">
        <button
          type="button"
          onClick={() => {
            showFields.value = !showFields.value;
          }}
        >
          {showFields.value ? "Hide" : "Show"}
        </button>
      </div>
    </fieldset>
  );
}
