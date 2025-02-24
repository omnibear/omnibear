import { useState, useContext } from "preact/hooks";
import { settingsContext } from "../../context/settingsContext";

export default function EmojiSettings() {
  const [value, setValue] = useState("");
  const settings = useContext(settingsContext);

  const deleteReacji = (index) => {
    const reacji = settings.reacji.value;
    const before = reacji.slice(0, index);
    const after = reacji.slice(index + 1);
    settings.reacji.value = before.concat(after);
  };

  const addReacji = () => {
    if (value && !settings?.reacji.value?.includes(value)) {
      settings.addReacji(value);
      setValue("");
    }
  };

  return (
    <div>
      <label>Quick emoji</label>
      <div className="reacji-row">
        {settings.reacji.value.map((char, i) => (
          <Reacji key={char} char={char} index={i} onDelete={deleteReacji} />
        ))}
      </div>
      <div className="input-inline">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          placeholder="Enter reaction emoji"
          maxLength="15"
        />
        <button type="button" onClick={addReacji}>
          Add
        </button>
      </div>
    </div>
  );
}

function Reacji({ char, index, onDelete }) {
  return (
    <div className="reacji-tag">
      {char}
      <button type="button" onClick={() => onDelete(index)}>
        ×
      </button>
    </div>
  );
}
