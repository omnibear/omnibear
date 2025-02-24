import { useContext } from "preact/hooks";
import { publishContext } from "../../context/publishContext";
import Message from "../Message";
import HeartSvg from "../svg/Heart";

export default function LikeForm() {
  const publish = useContext(publishContext);
  return (
    <div className="container text-center">
      <p>Like this entry?</p>
      {publish.flashMessage.value ? (
        <Message message={publish.flashMessage.value} />
      ) : null}
      <button
        type="button"
        className={`button${publish.isSending.value ? " is-loading" : ""}`}
        onClick={publish.sendLike}
        disabled={publish.isSending.value}
      >
        Like <HeartSvg />
      </button>
    </div>
  );
}
