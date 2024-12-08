import { useContext } from "preact/hooks";
import AppContext from "../../contexts/App";
import Message from "../Message";
import HeartSvg from "../svg/Heart";

export default function LikeForm() {
  const app = useContext(AppContext);
  return (
    <div className="container text-center">
      <p>Like this entry?</p>
      {app.flashMessage.value ? (
        <Message message={app.flashMessage.value} />
      ) : null}
      <button
        type="button"
        className={`button${app.isSending.value ? " is-loading" : ""}`}
        onClick={app.sendLike}
        disabled={app.isSending.value}
      >
        Like <HeartSvg />
      </button>
    </div>
  );
}
