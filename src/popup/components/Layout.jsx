import { useContext } from "preact/hooks";
import { publishContext } from "../context/publishContext";
import { authContext } from "../context/authContext";
import ChangeViewTabs from "./ChangeViewTabs";
import Header from "./Header";
import MainPane from "./MainPane";
import Footer from "./Footer";
import { LOGIN } from "../../constants";

export default function Layout() {
  const publish = useContext(publishContext);

  const getClass = () => {
    // TODO: Can we remove this and let the CSS be adaptive?
    const height =
      publish?.viewType.value === LOGIN ? "l-main--short" : "l-main--tall";
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
