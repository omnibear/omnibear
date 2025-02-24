import { useContext } from "preact/hooks";
import { publishContext } from "../../context/publishContext";
import Message from "../Message";
import RepostSvg from "../svg/Repost";

export default function RepostForm() {
  const publish = useContext(publishContext);
  return (
    <div className="container text-center">
      <p>Repost this entry?</p>
      {publish.flashMessage.value ? (
        <Message message={publish.flashMessage.value} />
      ) : null}
      <button
        type="button"
        className={`button${publish.isSending.value ? " is-loading" : ""}`}
        onClick={publish.sendRepost}
        disabled={publish.isSending.value}
      >
        Repost <RepostSvg />
      </button>
    </div>
  );
}
