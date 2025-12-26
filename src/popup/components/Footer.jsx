import { useContext } from "preact/hooks";
import { publishContext } from "../context/publishContext";
import { authContext } from "../context/authContext";
import { openLink } from "../../util/utils";

export default function Footer() {
  const publish = useContext(publishContext);
  const auth = useContext(authContext);

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
              onClick={publish.logout}
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
