import { useContext } from "preact/hooks";
import AppContext from "../contexts/App";
import Auth from "../contexts/Auth";
import SettingsContext from "../contexts/Settings";
import Login from "./svg/Login";
import Pen from "./svg/Pen";
import Reply from "./svg/Reply";
import Bookmark from "./svg/Bookmark";
import Heart from "./svg/Heart";
import Repost from "./svg/Repost";
import Logs from "./svg/Logs";
import Settings from "./svg/Settings";
import Tab from "./Tab";
import {
  LOGIN,
  NOTE,
  REPLY,
  BOOKMARK,
  REPOST,
  LIKE,
  LOGS,
  SETTINGS,
} from "../constants";

const UNICODE_NBSP = "\u00a0";
const ICONS = {
  [LOGIN]: Login,
  [NOTE]: Pen,
  [REPLY]: Reply,
  [BOOKMARK]: Bookmark,
  [LIKE]: Heart,
  [REPOST]: Repost,
  [LOGS]: Logs,
  [SETTINGS]: Settings,
};

export default function ChangeViewTabs() {
  const auth = useContext(Auth);
  const settings = useContext(SettingsContext);

  return (
    <div className="side-nav">
      <img className="side-nav__logo" src="/icon.svg" alt="Omnibear Logo" />
      {auth.isLoggedIn.value ? (
        <>
          <ViewTab type={NOTE} label="New note" />
          <ViewTab type={REPLY} label="Reply" />
          <ViewTab type={BOOKMARK} label="Bookmark" />
          <ViewTab type={LIKE} label="Like" />
          <ViewTab type={REPOST} label="Repost" />
        </>
      ) : (
        <ViewTab type={LOGIN} label="Sign in" />
      )}
      {settings.debugLog.value ? (
        <Tab type={LOGS} label="Logs" onBottom />
      ) : null}
      <ViewTab type={SETTINGS} label="Settings" onBottom />
    </div>
  );
}

function ViewTab({ type, label, onBottom }) {
  const app = useContext(AppContext);
  const Icon = ICONS[type];
  return (
    <Tab
      isActive={app.viewType.value === type}
      onClick={() => app.setViewType(type)}
      onBottom={onBottom}
    >
      <Icon />
      {label.replace(" ", UNICODE_NBSP)}
    </Tab>
  );
}
