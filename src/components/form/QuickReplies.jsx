import { useContext } from "preact/hooks";
import AppContext from "../../contexts/App";
import Settings from "../../contexts/Settings";

export default function QuickReplies() {
  const app = useContext(AppContext);
  const settings = useContext(Settings);

  const reacji = settings.reacji.value;
  if (!reacji || !reacji.length) {
    return null;
  }

  return (
    <ul className="quick-replies">
      {reacji.map((content) => (
        <Reacji
          content={content}
          isSending={app.isSending.value}
          send={app.addQuickReply}
        />
      ))}
    </ul>
  );
}

function Reacji({ content, isSending, send }) {
  return (
    <li key={content}>
      <button type="button" onClick={() => send(content)} disabled={isSending}>
        {content}
      </button>
    </li>
  );
}
