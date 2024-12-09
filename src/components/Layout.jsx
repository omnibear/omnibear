import { useContext } from "preact/hooks";
import App from "../contexts/App";
import Auth from "../contexts/Auth";
import ChangeViewTabs from "./ChangeViewTabs";
import Header from "./Header";
import MainPane from "./MainPane";
import Footer from "./Footer";
import { LOGIN } from "../constants";

export default function Layout() {
  const app = useContext(App);
  const auth = useContext(Auth);

  const getClass = () => {
    // TODO: Can we remove this and let the CSS be adaptive?
    const height =
      app?.viewType.value === LOGIN ? "l-main--short" : "l-main--tall";
    return `l-main ${height}`;
  };

  return (
    <div className={getClass()}>
      <nav className="l-main__sidebar">
        <ChangeViewTabs />
      </nav>
      <div className="l-main__full">
        <div className="gradient-wrapper">
          <Header />
          <MainPane />
        </div>
      </div>
      <Footer />
    </div>
  );
}
