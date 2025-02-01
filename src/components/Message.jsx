import { MESSAGE_SUCCESS, MESSAGE_ERROR, MESSAGE_INFO } from "../constants";
import { openLink } from "../util/utils";

export default function Message({ message }) {
  const getClass = () => {
    const types = {
      [MESSAGE_INFO]: "message message--info",
      [MESSAGE_SUCCESS]: "message message--success",
      [MESSAGE_ERROR]: "message message--danger",
    };
    return types[message.type] || types[MESSAGE_INFO];
  };

  if (message) {
    return (
      <div className={getClass()}>
        {message.message}
        {message.location ? (
          <span>
            {":"}
            <br />
            <a href={message.location} onClick={openLink}>
              {message.location}
            </a>
          </span>
        ) : null}
      </div>
    );
  }
  return <div className={getClass()}>{this.children}</div>;
}
