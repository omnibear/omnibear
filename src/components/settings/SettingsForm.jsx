import { useContext } from "preact/hooks";
import Settings from "../../contexts/Settings";
import EmojiSettings from "./EmojiSettings";
import EndpointFields from "./EndpointFields";
import AuthenticationFields from "./AuthenticationFields";

export default function SettingsForm() {
  const settings = useContext(Settings);

  const updateBoolean = (sig) => {
    return (event) => {
      sig.value = event.target.checked;
    };
  };

  return (
    <div className="container container--full">
      <h1 className="section-heading">Settings</h1>
      <form className="settings-form">
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              checked={settings.defaultToCurrentPage.value}
              onChange={updateBoolean(settings.defaultToCurrentPage)}
            />
            Always open in “Reply” mode
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.autoSlug.value}
              onChange={updateBoolean(settings.autoSlug)}
            />
            Automatically generate slug from post content
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.closeAfterPosting.value}
              onChange={updateBoolean(settings.closeAfterPosting)}
            />
            Close Omnibear window after posting
          </label>

          <label>
            <input
              type="checkbox"
              checked={settings.debugLog.value}
              onChange={updateBoolean(settings.debugLog)}
            />
            Record debug logs
          </label>
        </div>

        <EmojiSettings />
        <EndpointFields />
        <AuthenticationFields />
      </form>
    </div>
  );
}
