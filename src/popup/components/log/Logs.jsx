import { useEffect, useState } from "preact/hooks";
import LogItem from "./LogItem";
import { getStoredLogs, clearStoredLogs } from "../../../util/log";

export default function Logs({ onClose }) {
  const [logs, setLogs] = useState(/** @type {any[]} */ ([]));

  useEffect(() => {
    (async () => {
      setLogs(await getStoredLogs());
    })();

    const interval = setInterval(async () => {
      setLogs(await getStoredLogs());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container container--full">
      <h1 className="section-heading">Logs</h1>
      {logs.length ? (
        <ul className="logs">
          {logs.map((log, i) => (
            <LogItem key={i} log={log} />
          ))}
        </ul>
      ) : (
        <p className="metadata">No logs found</p>
      )}
      <p className="text-right">
        <button
          type="button"
          onClick={() => {
            clearStoredLogs();
            setLogs([]);
          }}
        >
          Clear logs
        </button>
      </p>
    </div>
  );
}
