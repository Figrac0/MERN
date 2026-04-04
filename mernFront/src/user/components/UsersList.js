import UsersItem from "./UserItem";
import Card from "../../shared/components/UIElements/Card";

import "./UsersList.css";

const UsersList = (props) => {
    const items = props.items || [];

    if (items.length === 0) {
        return (
            <div className="center users-list__empty">
                <Card className="empty-panel">
                    <h2>{props.emptyTitle || "Found no users."}</h2>
                    {props.emptyText && <p>{props.emptyText}</p>}
                </Card>
            </div>
        );
    }
    return (
        <ul className="users-list">
            {items.map((user) => (
                <UsersItem
                    key={user.id}
                    id={user.id}
                    image={user.image}
                    name={user.name}
                    placeCount={user.places ? user.places.length : 0}
                />
            ))}
        </ul>
    );
};

export default UsersList;
