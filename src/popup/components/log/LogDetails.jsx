export default function LogDetails({ details }) {
  return (
    <div className="log-details">
      <LogDetail detail={details} isTopLevel />
    </div>
  );
}

/**
 *
 * @param {object} param
 * @param {any} param.detail
 * @param {boolean} [param.isTopLevel]
 * @returns
 */
function LogDetail({ detail, isTopLevel }) {
  const marginLeft = `${isTopLevel ? 0 : 1}em`;

  if (!detail || typeof detail === "string" || typeof detail === "number") {
    return <span>{detail}</span>;
  }

  if (Array.isArray(detail)) {
    return (
      <div style={{ marginLeft }}>
        {"["}
        {detail.map((d, i) => (
          <div key={i} style={{ marginLeft: "1em" }}>
            <LogDetail detail={d} />
          </div>
        ))}
        {"]"}
      </div>
    );
  }

  return [
    <span key="open-brace">{"{"}</span>,
    <div key="content" style={{ marginLeft }}>
      {Object.keys(detail).map((key) => (
        <div key={key} style={{ marginLeft: "1em" }}>
          {key}: <LogDetail detail={detail[key]} />
        </div>
      ))}
    </div>,
    <span key="close-brace">{"}"}</span>,
  ];
}
