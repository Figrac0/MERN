import { Link } from "react-router-dom";
import Avatar from "../../shared/components/UIElements/Avatar";
import Card from "../../shared/components/UIElements/Card";
import { buildAssetUrl } from "../../shared/util/url";

import "./UserItem.css";

const UsersItem = (props) => {
    const imageUrl = buildAssetUrl(props.image);
    const memberTone =
        props.placeCount > 3
            ? "Top contributor"
            : props.placeCount > 0
              ? "Active member"
              : "New member";
    const summaryCopy =
        props.placeCount > 3
            ? "Has already saved a strong mix of places with enough detail to inspire a full day out."
            : props.placeCount > 0
              ? "Has started building a useful list of places worth exploring."
              : "Ready to save the first place and start building a personal list.";

    return (
        <li className="user-item">
            <Card className="user-item__content">
                <Link to={`/${props.id}/places`}>
                    <div className="user-item__top">
                        <div className="user-item__image">
                            <Avatar image={imageUrl} alt={props.name} />
                        </div>
                        <span className="user-item__tag">{memberTone}</span>
                    </div>
                    <div className="user-item__info">
                        <h2>{props.name}</h2>
                        <p>{summaryCopy}</p>
                    </div>
                    <div className="user-item__footer">
                        <div className="user-item__metric">
                            <strong>{props.placeCount}</strong>
                            <span>
                                saved {props.placeCount === 1 ? "place" : "places"}
                            </span>
                        </div>
                        <span className="user-item__cta">View places</span>
                    </div>
                </Link>
            </Card>
        </li>
    );
};

export default UsersItem;
