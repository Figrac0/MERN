import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useHttpClient } from "../../shared/hooks/http-hook";

import PlaceList from "../components/PlaceList";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { buildApiUrl } from "../../shared/util/url";
import {
    buildCollectionMetrics,
    extractCity,
    inferPlaceCategory,
} from "../../shared/util/place-insights";
import { AuthContext } from "../../shared/context/auth-context";

import "./UserPlaces.css";

const UserPlaces = () => {
    const auth = useContext(AuthContext);
    const [loadedPlaces, setLoadedPlaces] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [sortMode, setSortMode] = useState("quality");

    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const { userId } = useParams();

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(
                    buildApiUrl(`/places/user/${userId}`),
                );
                setLoadedPlaces(responseData.places);
            } catch (err) {}
        };

        fetchPlaces();
    }, [sendRequest, userId]);

    const placeDeletedHandler = (deletedPlaceId) => {
        setLoadedPlaces((prevPlaces) =>
            prevPlaces.filter((place) => place.id !== deletedPlaceId),
        );
    };

    const filteredPlaces = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return [...loadedPlaces]
            .filter((place) => {
                if (!normalizedSearch) {
                    return true;
                }

                return [place.title, place.description, place.address]
                    .filter(Boolean)
                    .some((value) =>
                        value.toLowerCase().includes(normalizedSearch),
                    );
            })
            .sort((firstPlace, secondPlace) => {
                if (sortMode === "title") {
                    return firstPlace.title.localeCompare(secondPlace.title);
                }

                if (sortMode === "city") {
                    return extractCity(firstPlace.address).localeCompare(
                        extractCity(secondPlace.address),
                    );
                }

                return secondPlace.description.length - firstPlace.description.length;
            });
    }, [loadedPlaces, searchValue, sortMode]);

    const metrics = useMemo(
        () => buildCollectionMetrics(loadedPlaces),
        [loadedPlaces],
    );

    const leadingTags = useMemo(() => {
        const categories = loadedPlaces.reduce((accumulator, place) => {
            const category = inferPlaceCategory(place);
            accumulator[category] = (accumulator[category] || 0) + 1;
            return accumulator;
        }, {});

        return Object.entries(categories)
            .sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1])
            .slice(0, 3);
    }, [loadedPlaces]);

    const isOwner = auth.userId === userId;

    return (
        <div className="page page--wide places-page">
            <ErrorModal error={error} onClear={clearError} />
            <section className="page-hero places-hero">
                <div>
                    <span className="eyebrow">Saved Places</span>
                    <h1>
                        {isOwner
                            ? "See all of your saved places in one view."
                            : "See the places saved by this user."}
                    </h1>
                    <p className="page-lead">
                        {isOwner
                            ? "Search your list, sort it in different ways, and quickly spot what you might want to add next."
                            : "Browse the full list, search by title or address, and open the places that sound most useful."}
                    </p>
                </div>

                <div className="places-hero__actions">
                    {isOwner && <Button to="/places/new">Add Another Place</Button>}
                    <Button inverse to="/community">
                        Back to Community
                    </Button>
                </div>

                <div className="places-hero__stats">
                    <Card className="places-stat">
                        <strong>{metrics.totalPlaces}</strong>
                        <span>places saved</span>
                    </Card>
                    <Card className="places-stat">
                        <strong>{metrics.uniqueCities}</strong>
                        <span>cities</span>
                    </Card>
                    <Card className="places-stat">
                        <strong>{metrics.primaryCity}</strong>
                        <span>most saved city</span>
                    </Card>
                    <Card className="places-stat">
                        <strong>{metrics.leadingCategory}</strong>
                        <span>most common type</span>
                    </Card>
                </div>
            </section>

            <Card className="places-toolbar">
                <div className="places-toolbar__field">
                    <label htmlFor="place-search">Search places</label>
                    <input
                        id="place-search"
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Filter by title, description, or address"
                        type="search"
                        value={searchValue}
                    />
                </div>
                <div className="places-toolbar__field">
                    <label htmlFor="place-sort">Sort collection</label>
                    <select
                        id="place-sort"
                        onChange={(event) => setSortMode(event.target.value)}
                        value={sortMode}>
                        <option value="quality">Best described first</option>
                        <option value="title">Alphabetical</option>
                        <option value="city">City</option>
                    </select>
                </div>
                <div className="places-toolbar__insight">
                    <strong>Quick idea</strong>
                    <p>{metrics.nextSuggestion}</p>
                    <div className="places-toolbar__tags">
                        {leadingTags.map(([tag, count]) => (
                            <span key={tag}>
                                {tag}
                                <strong>{count}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            </Card>

            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedPlaces && (
                <PlaceList
                    emptyActionText={isOwner ? "Add New Place" : "Explore Community"}
                    emptyActionTo={isOwner ? "/places/new" : "/community"}
                    emptyText={
                        isOwner
                            ? "Try a different filter or add another place to your list."
                            : "Try a different filter or explore more shared places."
                    }
                    emptyTitle={
                        isOwner
                            ? "No places match your current view."
                            : "No places match the current collection view."
                    }
                    items={filteredPlaces}
                    onDeletePlace={placeDeletedHandler}
                />
            )}
        </div>
    );
};

export default UserPlaces;
