import { useContext } from "preact/hooks";
import AppContext from "../contexts/App";
import Auth from "../contexts/Auth";
import { openLink } from "../util/utils";

export default function Footer() {
  const app = useContext(AppContext);
  const auth = useContext(Auth);

  return (
    <footer className="l-main__footer footer">
      {auth.isLoggedIn.value
        ? [
            <div key="message" className="footer__message">
              Authenticated to <strong>{auth.domain}</strong>
            </div>,
            <a
              key="help"
              href="https://omnibear.com/help"
              className="footer__right"
              onClick={openLink}
            >
              Help
            </a>,
            <button
              key="logout"
              className="button-link"
              type="button"
              onClick={app.logout}
            >
              Logout
            </button>,
          ]
        : [
            <div key="message" className="footer__message">
              Not authenticated
            </div>,
            <a
              key="help"
              href="https://omnibear.com/help"
              className="footer__right"
              onClick={openLink}
            >
              Help
            </a>,
          ]}
    </footer>
  );
}
