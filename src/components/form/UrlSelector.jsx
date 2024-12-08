import {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "preact/hooks";
import AppContext from "../../contexts/App";
import DownArrow from "../svg/DownArrow";
import WebmentionSvg from "../svg/Webmention";
import { BOOKMARK, LIKE, REPOST } from "../../constants";

async function loadOptions() {
  const { pageEntry = {} } = await storage.get(["pageEntry"]);
  const options = [
    {
      name: "Current page",
      url: pageEntry.url,
      title: pageEntry.title,
      webmention: pageEntry.webmention,
    },
  ];
  const { itemEntry } = await storage.get(["itemEntry"]);
  if (itemEntry) {
    options.push({
      name: "Selected entry",
      url: itemEntry.url,
      title: itemEntry.title,
      webmention: itemEntry.webmention,
    });
  } else {
    options.push({
      name: "Selected entry",
      url: "- none -",
      title: "",
      isDisabled: true,
    });
  }
  return options;
}

export default function UrlSelector() {
  const app = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const [supportsWebmention, setSupportsWebmention] = useState(false);

  useEffect(async () => {
    setOptions(await loadOptions());
  });

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectEntry = (entry, initialLoad) => {
    setIsOpen(false);
    setSupportsWebmention(entry.webmention); // ?
    app.setSelectedEntry(entry, initialLoad);
  };

  useEffect(() => {
    if (options[1].isDisabled) {
      selectEntry(options[0], true);
    } else {
      selectEntry(options[1], true);
    }

    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("click", close);
    };
  }, []);

  function getLabel() {
    let action;
    switch (app.viewType.value) {
      case BOOKMARK:
        action = "Bookmark";
        break;
      case LIKE:
        action = "Like";
        break;
      case REPOST:
        action = "Repost";
        break;
      default:
        action = "Reply to";
        break;
    }
    const option = findActiveOption();
    const urlType = option.name ? ` ${option.name.toLowerCase()}` : "";
    return `${action}${urlType}:`;
  }

  function findActiveOption() {
    return (
      options.find((option) => option.url === app.selectedEntry.value?.url) ||
      app.selectedEntry.value
    );
  }

  return (
    <div className="url-selector" onClick={(e) => e.stopPropagation()}>
      {supportsWebmention ? (
        <div className="wm-overlay">
          <WebmentionSvg title="This page supports webmention" />
        </div>
      ) : null}
      <h2 className="header-title">{getLabel()}</h2>
      <div className={`dropdown ${isOpen ? " is-open" : ""}`}>
        <button type="button" className="dropdown__toggle" onClick={toggle}>
          <div className="nowrap">{app.selectedEntry.value?.url}</div>
          <div className="dropdown__toggle__arrow">
            <DownArrow />
          </div>
        </button>
        <div className="dropdown__drawer">
          {options.map((option) => (
            <UrlOption
              option={option}
              isOpen={isOpen}
              isActive={option.url === app.selectedEntry.value?.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UrlOption({ option, isOpen, isActive }) {
  return (
    <button
      type="button"
      className={`url-option${isActive ? " is-active" : ""} ${
        isOpen ? " is-in" : ""
      }`}
      onClick={() => selectEntry(option)}
      disabled={option.isDisabled}
    >
      <div className="url-option__type">{option.name}</div>
      <div className="url-option__url">{option.url}</div>
    </button>
  );
}
