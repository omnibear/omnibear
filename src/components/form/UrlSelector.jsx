import { useState, useContext, useCallback, useEffect } from "preact/hooks";
import { publishContext } from "../../context/publishContext";
import DownArrow from "../svg/DownArrow";
import WebmentionSvg from "../svg/Webmention";
import { BOOKMARK, LIKE, REPOST } from "../../constants";
import storage from "../../util/storage";

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
  console.log("Options loaded", options);
  return options;
}

export default function UrlSelector() {
  const publish = useContext(publishContext);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [supportsWebmention, setSupportsWebmention] = useState(false);

  useEffect(async () => {
    setOptions(await loadOptions());
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectEntry = (entry, initialLoad) => {
    setIsOpen(false);
    setSupportsWebmention(entry.webmention); // ?
    publish.setSelectedEntry(entry, initialLoad);
  };

  useEffect(() => {
    if (options.length === 0) {
      console.log("No options available");
    } else if (options[1].isDisabled) {
      selectEntry(options[0], true);
    } else {
      selectEntry(options[1], true);
    }

    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("click", close);
    };
  }, [options]);

  function getLabel() {
    let action;
    switch (publish.viewType.value) {
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
    const urlType = option?.name ? ` ${option.name.toLowerCase()}` : "";
    return `${action}${urlType}:`;
  }

  function findActiveOption() {
    return (
      options.find(
        (option) => option.url === publish.selectedEntry.value?.url
      ) || publish.selectedEntry.value
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
          <div className="nowrap">{publish.selectedEntry.value?.url}</div>
          <div className="dropdown__toggle__arrow">
            <DownArrow />
          </div>
        </button>
        <div className="dropdown__drawer">
          {options.map((option) => (
            <UrlOption
              option={option}
              isOpen={isOpen}
              isActive={option.url === publish.selectedEntry.value?.url}
              onClick={() => selectEntry(option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UrlOption({ option, isOpen, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`url-option${isActive ? " is-active" : ""} ${
        isOpen ? " is-in" : ""
      }`}
      onClick={() => onClick(option)}
      disabled={option.isDisabled}
    >
      <div className="url-option__type">{option.name}</div>
      <div className="url-option__url">{option.url}</div>
    </button>
  );
}
