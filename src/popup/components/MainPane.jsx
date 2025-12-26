import { useContext } from "preact/hooks";
import { publishContext } from "../context/publishContext";
import LoginForm from "./LoginForm";
import NoteForm from "./form/NoteForm";
import LikeForm from "./form/LikeForm";
import RepostForm from "./form/RepostForm";
import SettingsForm from "./settings/SettingsForm";
import Message from "./Message";
import Logs from "./log/Logs";
import {
  LOGIN,
  NOTE,
  LIKE,
  REPOST,
  LOGS,
  SETTINGS,
  MESSAGE,
} from "../../constants";

export default function MainPane() {
  const publish = useContext(publishContext);

  switch (publish.viewType.value) {
    case LOGIN:
      return <LoginForm />;
    case SETTINGS:
      return <SettingsForm onClose={() => publish.setViewType(NOTE)} />;
    case LOGS:
      return <Logs onClose={() => publish.setViewType(NOTE)} />;
    case LIKE:
      return <LikeForm />;
    case REPOST:
      return <RepostForm />;
    case MESSAGE:
      return (
        <div className="container container--full">
          <Message message={publish.flashMessage.value} />
        </div>
      );
    default:
      return <NoteForm />;
  }
}
