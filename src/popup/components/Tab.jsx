/**
 * An individual menu tab link
 *
 * @param {object} props
 * @param {boolean} props.isActive Whether the tab is currently active
 * @param {boolean} [props.isDisabled] Whether the tab is disabled
 * @param {boolean} [props.onBottom] Whether to align the tab to the bottom of the menu
 * @param {function} props.onClick Click handler
 * @param {import("preact").JSX.Element} props.children Tab content
 */
export default function Tab({
  isActive,
  isDisabled,
  onBottom,
  onClick,
  children,
}) {
  const getClass = () => {
    let classes = "";
    if (isActive) {
      classes += " is-active";
    }
    if (onBottom) {
      classes += " side-nav__bottom";
    }
    return classes;
  };

  return (
    <button
      className={getClass()}
      disabled={isDisabled}
      title={isDisabled ? "Post type not supported" : undefined}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
