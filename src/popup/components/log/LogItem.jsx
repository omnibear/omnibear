import { useState } from "preact/hooks";
import LogDetails from "./LogDetails";

export default function LogItem({ log }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const className = [
    "log",
    `log--${log.type}`,
    isExpanded ? "is-expanded" : "",
    log.data ? "has-data" : "",
  ].join(" ");

  const toggle = () => {
    if (log.data) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <li>
      <button type="button" className={className} onClick={toggle}>
        <time>{log.timestamp}</time>
        <div>{log.message}</div>
      </button>
      {isExpanded ? <LogDetails details={log.data} /> : null}
    </li>
  );
}
