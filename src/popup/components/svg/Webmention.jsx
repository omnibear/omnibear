import { h, Component } from "preact";

export default class Webmention extends Component {
  render() {
    const { title } = this.props;
    return (
      <svg className="svg-logs" viewBox="0 0 360 360">
        <desc>Webmention logo</desc>
        {title ? <title>{title}</title> : null}
        <path
          d="M207.54,328.99l-42.141-128.841h-0.699L123.263,328.99h-55.36L2.092,80.214h54.668l39.345,169.338h0.695l43.181-128.845
          h51.189l42.479,130.927h0.698l30.36-130.841l-39.546-0.086l81.975-76.192l50.864,76.29l-40.281-0.025l-55.872,208.21H207.54z"
          fill="currentColor"
        />
      </svg>
    );
  }
}
