import { useContext } from "preact/hooks";
import AppContext from "../contexts/App";
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
} from "../constants";

export default function MainPane() {
  const app = useContext(AppContext);

  switch (app.viewType.value) {
    case LOGIN:
      return <LoginForm />;
    case SETTINGS:
      return <SettingsForm onClose={() => app.setViewType(NOTE)} />;
    case LOGS:
      return <Logs />;
    case LIKE:
      return <LikeForm />;
    case REPOST:
      return <RepostForm />;
    case MESSAGE:
      return (
        <div className="container container--full">
          <Message message={app.flashMessage.value} />
        </div>
      );
    default:
      return <NoteForm />;
  }
}
