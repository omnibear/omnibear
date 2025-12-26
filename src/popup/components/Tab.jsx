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
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
