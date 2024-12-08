import { useContext } from "preact/hooks";
import AppContext from "../../contexts/App";
import Message from "../Message";
import RepostSvg from "../svg/Repost";

export default function RepostForm() {
  const app = useContext(AppContext);
  return (
    <div className="container text-center">
      <p>Repost this entry?</p>
      {app.flashMessage.value ? (
        <Message message={app.flashMessage.value} />
      ) : null}
      <button
        type="button"
        className={`button${app.isSending.value ? " is-loading" : ""}`}
        onClick={app.sendRepost}
        disabled={app.isSending.value}
      >
        Repost <RepostSvg />
      </button>
    </div>
  );
}
