import { Component } from "preact";

export default class LinkButton extends Component {
	render() {
		return (
			<button className="button-link" onClick={this.handleClick}>
				{this.props.children}
			</button>
		);
	}

	handleClick = (e) => {
		e.preventDefault();
		this.props.onClick();
	};
}
