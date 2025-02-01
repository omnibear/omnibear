export default function SyndicateInputs({
  options,
  selected,
  onUpdate,
  isDisabled,
}) {
  const toggle = (uid, isChecked) => {
    const updated = [...selected] || [];
    if (isChecked) {
      updated.push(uid);
    } else {
      const index = updated.indexOf(uid);
      updated.splice(index, 1);
    }
    onUpdate(updated);
  };

  if (!options || !options.length) {
    return null;
  }
  return (
    <div className="checkbox">
      <div className="label">Syndicate to</div>
      {options.map((option) => (
        <Option
          option={option}
          isChecked={selected ? selected.indexOf(option.uid) > -1 : false}
          isDisabled={isDisabled}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function Option({ option, isChecked, isDisabled, onToggle }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled}
        onClick={(e) => onToggle(option.uid, e.target.checked)}
      />
      {option.name}
    </label>
  );
}
