import { useContext } from "preact/hooks";
import Auth from "../contexts/Auth";
import ChangeViewTabs from "./ChangeViewTabs";
import Header from "./Header";
import MainPane from "./MainPane";
import Footer from "./Footer";

export default function Layout() {
  const auth = useContext(Auth);

  const getClass = () => {
    // TODO: Can we remove this and let the CSS be adaptive?
    const height = auth?.isLoggedIn.value ? "l-main--tall" : "l-main--short";
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
