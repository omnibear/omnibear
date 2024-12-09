import { useEffect } from "preact/hooks";
import LogItem from "./LogItem";
import { getLogs, clearLogs } from "../../util/log";

export default function Logs({ onClose }) {
  const [logs, setLogs] = useState(getLogs());

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getLogs());
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
            clearLogs();
            setLogs([]);
          }}
        >
          Clear logs
        </button>
      </p>
    </div>
  );
}
