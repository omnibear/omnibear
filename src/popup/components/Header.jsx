import { useContext } from "preact/hooks";
import { publishContext } from "../context/publishContext";
import UrlSelector from "./form/UrlSelector";
import { NOTE, REPLY, BOOKMARK, LIKE, REPOST } from "../../constants";

const headerViews = [NOTE, REPLY, BOOKMARK, LIKE, REPOST];

export default function Header() {
  const publish = useContext(publishContext);
  const showUrlSelector = [REPLY, BOOKMARK, LIKE, REPOST].includes(
    publish.viewType.value,
  );

  if (!headerViews.includes(publish.viewType.value)) {
    return null;
  }

  return (
    <header className="main-header">
      {publish.viewType.value === NOTE ? (
        <h2 className="header-title">New note</h2>
      ) : null}
      {showUrlSelector ? <UrlSelector /> : null}
    </header>
  );
}
