import { useContext } from "preact/hooks";
import { publishContext } from "../../context/publishContext";
import { settingsContext } from "../../context/settingsContext";

export default function QuickReplies() {
  const publish = useContext(publishContext);
  const settings = useContext(settingsContext);

  const reacji = settings.reacji.value;
  if (!reacji || !reacji.length) {
    return null;
  }

  return (
    <ul className="quick-replies">
      {reacji.map((content) => (
        <Reacji
          content={content}
          isSending={publish.isSending.value}
          send={publish.addQuickReply}
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
