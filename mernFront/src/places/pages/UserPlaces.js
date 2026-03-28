import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";

const DUMMY_PLACES = [
    {
        id: "p1",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSf3qmXgmlpkXYoYwtc2SuqCRqoTZnRqHS6Q&s",
        address: "20 W 34th St, New York, NY 10001, United States",
        location: {
            lat: 40.7484405,
            lng: -73.9878584,
        },
        creator: "u1",
    },
    {
        id: "p2",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSf3qmXgmlpkXYoYwtc2SuqCRqoTZnRqHS6Q&s",
        address: "20 W 34th St, New York, NY 10001, United States",
        location: {
            lat: 40.7484405,
            lng: -73.9878584,
        },
        creator: "u2",
    },
];

const UserPlaces = () => {
    const userId = useParams().userId;
    const loadedPlaces = DUMMY_PLACES.filter(
        (place) => place.creator === userId,
    );
    return (
        <>
            <PlaceList items={loadedPlaces} />
        </>
    );
};

export default UserPlaces;
