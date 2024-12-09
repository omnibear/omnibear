import { useContext } from "preact/hooks";
import AppContext from "../contexts/App";
import UrlSelector from "./form/UrlSelector";
import { NOTE, REPLY, BOOKMARK, LIKE, REPOST } from "../constants";

const headerViews = [NOTE, REPLY, BOOKMARK, LIKE, REPOST];

export default function Header() {
  const app = useContext(AppContext);
  const showUrlSelector = [REPLY, BOOKMARK, LIKE, REPOST].includes(
    app.viewType.value,
  );

  if (!headerViews.includes(app.viewType.value)) {
    return null;
  }

  return (
    <header className="main-header">
      {app.viewType.value === NOTE ? (
        <h2 className="header-title">New note</h2>
      ) : null}
      {showUrlSelector ? <UrlSelector /> : null}
    </header>
  );
}
