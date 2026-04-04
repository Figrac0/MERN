import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";

import "./PlaceList.css";

const PlaceList = (props) => {
    if (props.items.length === 0) {
        return (
            <div className="place-list center">
                <Card className="empty-panel">
                    <h2>{props.emptyTitle || "No places found. Maybe create one?"}</h2>
                    {props.emptyText && <p>{props.emptyText}</p>}
                    <Button to={props.emptyActionTo || "/places/new"}>
                        {props.emptyActionText || "Share Place"}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <ul className="place-list">
            {props.items.map((place) => (
                <PlaceItem
                    key={place.id}
                    id={place.id}
                    image={place.image}
                    title={place.title}
                    description={place.description}
                    address={place.address}
                    creator={place.creator}
                    cordinates={place.location}
                    onDelete={props.onDeletePlace}
                />
            ))}
        </ul>
    );
};

export default PlaceList;
