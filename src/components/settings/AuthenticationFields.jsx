import { useContext } from "preact/hooks";
import { signal } from "@preact/signals";
import Auth from "../../contexts/Auth";

const showFields = signal(false);
export default function AuthenticationFields() {
  const auth = useContext(Auth);

  const update = (fn) => {
    return (event) => {
      fn(event.target.value);
      // window.auth = auth; // debugging remnant?
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
                onChange={update(auth.setDomain)}
                placeholder="https://example.com"
              />
            </div>,
            <div key="endpoint">
              <label htmlFor="mp-endpoint">Micropub endpoint</label>
              <input
                id="mp-endpoint"
                type="text"
                value={auth.micropubEndpoint}
                onChange={update(auth.setMicropubEndpoint)}
                placeholder="https://example.com/micropub"
              />
            </div>,
            <div key="token">
              <label htmlFor="token">OAuth Token</label>
              <input
                id="token"
                type="text"
                value={auth.token}
                onChange={update(auth.setToken)}
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
