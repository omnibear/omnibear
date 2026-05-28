/**
 * @import {MicropubSyndicationTarget} from '../../../omnibear.d.ts'
 */

/**
 *
 * @param {object} props
 * @param {MicropubSyndicationTarget[]} props.options
 * @param {string[]} props.selected Array of selected syndication target uids
 * @param {(updated: string[]) => void} props.onUpdate Callback for when syndication targets are updated, receives the updated array of selected syndication target uids
 * @param {boolean} [props.isDisabled] Whether the inputs are disabled
 * @returns
 */
export default function SyndicateInputs({
  options,
  selected = [],
  onUpdate,
  isDisabled,
}) {
  /**
   *
   * @param {string} uid Unique id for syndicate selection
   * @param {boolean} isChecked true if the option is active
   */
  const toggle = (uid, isChecked) => {
    const updated = [...selected];
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

/**
 * Render a single syndication target option
 * @param {object} props
 * @param {MicropubSyndicationTarget} props.option
 * @param {boolean} props.isChecked
 * @param {boolean} props.isDisabled
 * @param {(uid: string, isChecked: boolean) => void} props.onToggle
 * @returns
 */
function Option({ option, isChecked, isDisabled, onToggle }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={isChecked}
        disabled={isDisabled}
        onClick={(e) =>
          onToggle(
            option.uid,
            /** @type {HTMLInputElement} */ (e.target).checked,
          )
        }
      />
      {option.name}
    </label>
  );
}
