import { Link } from "react-router-dom";

import "./Button.css";

const buildButtonClassName = (props) =>
    `button button--${props.size || "default"} ${
        props.inverse ? "button--inverse" : ""
    } ${props.danger ? "button--danger" : ""} ${props.className || ""}`.trim();

const Button = (props) => {
    if (props.href) {
        return (
            <a
                className={buildButtonClassName(props)}
                href={props.href}>
                {props.children}
            </a>
        );
    }
    if (props.to) {
        return (
            <Link
                to={props.to}
                exact={props.exact}
                className={buildButtonClassName(props)}>
                {props.children}
            </Link>
        );
    }
    return (
        <button
            className={buildButtonClassName(props)}
            type={props.type}
            onClick={props.onClick}
            disabled={props.disabled}>
            {props.children}
        </button>
    );
};

export default Button;
