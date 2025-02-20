import { useState, useEffect, useContext, useRef } from "preact/hooks";
import Auth from "../contexts/Auth";
import Message from "./Message";
import { openLink } from "../util/utils";
import { MESSAGE_ERROR, MESSAGE_INFO } from "../constants";

export default function LoginForm() {
  const auth = useContext(Auth);
  const input = useRef(null);
  const [domain, setDomain] = useState("");

  useEffect(() => {
    setTimeout(() => {
      if (input.current) {
        input.current.focus();
      }
    }, 150);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = getNormalizedDomain();
    setDomain(normalized);
    await auth.login(normalized);
  };

  const getNormalizedDomain = () => {
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      return domain;
    } else {
      return `https://${domain}`;
    }
  };

  return (
    <form
      className="container container--full"
      method="GET"
      onSubmit={handleSubmit}
    >
      <p>
        To use Omnibear, sign in with your domain. Your website will need to
        support{" "}
        <a href="http://indieweb.org/micropub" onClick={openLink}>
          Micropub
        </a>{" "}
        for creating new posts.
      </p>

      <div className="fields-inline">
        <input
          type="text"
          name="me"
          placeholder="https://example.com"
          className="fields-inline__fill"
          value={domain}
          onInput={(e) => setDomain(e.target.value)}
          disabled={auth.isLoading.value}
          ref={input}
        />
        <button
          type="submit"
          disabled={auth.isLoading.value}
          className={auth.isLoading.value ? "button is-loading" : "button"}
        >
          Sign in
        </button>
      </div>

      {auth.hasErrors.value ? (
        <Message
          message={{
            type: MESSAGE_ERROR,
            message: auth.errorMessage.value || "Error",
          }}
        />
      ) : null}
      {auth.authorizationPageOpened.value ? (
        <Message
          message={{
            type: MESSAGE_INFO,
            message:
              "Your authorization page has been opened in a new tab. You may close this window and complete your login there.",
          }}
        />
      ) : null}
    </form>
  );
}
