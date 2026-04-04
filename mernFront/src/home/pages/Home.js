import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import { buildApiUrl } from "../../shared/util/url";
import {
    buildCollectionMetrics,
    buildCoverageSuggestions,
    extractCity,
    getTopCities,
    getTopPlaces,
    inferPlaceCategory,
} from "../../shared/util/place-insights";
import PlaceConcierge from "../components/PlaceConcierge";

import "./Home.css";

const fetchJson = async (url) => {
    const response = await fetch(url);
    const responseText = await response.text();
    let responseData = {};

    if (responseText) {
        try {
            responseData = JSON.parse(responseText);
        } catch (err) {
            throw new Error("Server returned an unexpected response.");
        }
    }

    if (!response.ok) {
        throw new Error(
            responseData.message || `Request failed with status ${response.status}.`,
        );
    }

    return responseData;
};

const Home = () => {
    const auth = useContext(AuthContext);
    const [directoryUsers, setDirectoryUsers] = useState([]);
    const [directoryPlaces, setDirectoryPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadDirectory = async () => {
            try {
                const usersData = await fetchJson(buildApiUrl("/users"));
                const users = usersData.users || [];

                const placesByUser = await Promise.all(
                    users.map(async (user) => {
                        if (!user.places || user.places.length === 0) {
                            return [];
                        }

                        try {
                            const placesData = await fetchJson(
                                buildApiUrl(`/places/user/${user.id}`),
                            );

                            return (placesData.places || []).map((place) => ({
                                ...place,
                                creatorName: user.name,
                            }));
                        } catch (err) {
                            return [];
                        }
                    }),
                );

                if (!isMounted) {
                    return;
                }

                setDirectoryUsers(users);
                setDirectoryPlaces(placesByUser.flat());
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Could not load the app preview.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadDirectory();

        return () => {
            isMounted = false;
        };
    }, []);

    const metrics = useMemo(
        () => buildCollectionMetrics(directoryPlaces),
        [directoryPlaces],
    );

    const topUsers = useMemo(() => {
        return [...directoryUsers]
            .sort((firstUser, secondUser) => {
                return (
                    (secondUser.places?.length || 0) - (firstUser.places?.length || 0)
                );
            })
            .slice(0, 3);
    }, [directoryUsers]);

    const featuredPlaces = useMemo(
        () => getTopPlaces(directoryPlaces, 4),
        [directoryPlaces],
    );

    const coverageSuggestions = useMemo(
        () => buildCoverageSuggestions(directoryPlaces),
        [directoryPlaces],
    );

    const citySnapshot = useMemo(
        () => getTopCities(directoryPlaces, 4),
        [directoryPlaces],
    );

    return (
        <div className="page page--wide home-page">
            <section className="page-hero home-hero">
                <div className="home-hero__content">
                    <span className="eyebrow">Find Better Places</span>
                    <h1>Save great places, explore new ideas, and plan your next stop faster.</h1>
                    <p className="page-lead">
                        Your Places keeps favorite spots in one place, lets you
                        browse what other people have saved, and helps you decide
                        where to go next based on real places and addresses.
                    </p>
                    <div className="home-hero__actions">
                        <Button to="/community">Explore Community</Button>
                        {auth.isLoggedIn ? (
                            <Button inverse to={`/${auth.userId}/places`}>
                                Open My Places
                            </Button>
                        ) : (
                            <Button inverse to="/auth">
                                Create My Account
                            </Button>
                        )}
                    </div>
                    <div className="home-hero__signals">
                        <div className="signal-card">
                            <strong>{directoryUsers.length}</strong>
                            <span>people sharing places</span>
                        </div>
                        <div className="signal-card">
                            <strong>{metrics.totalPlaces}</strong>
                            <span>places already saved</span>
                        </div>
                        <div className="signal-card">
                            <strong>{metrics.uniqueCities}</strong>
                            <span>cities to explore</span>
                        </div>
                    </div>
                </div>

                <Card className="home-hero__panel">
                    <span className="eyebrow">Quick Overview</span>
                    <h2>See what people are saving right now</h2>
                    <div className="home-hero__stats-grid">
                        <div>
                            <small>Top city</small>
                            <strong>{metrics.primaryCity}</strong>
                        </div>
                        <div>
                            <small>Popular type</small>
                            <strong>{metrics.leadingCategory}</strong>
                        </div>
                        <div>
                            <small>What to add next</small>
                            <strong>{metrics.nextSuggestion}</strong>
                        </div>
                    </div>
                    <div className="home-hero__city-list">
                        {citySnapshot.length > 0 ? (
                            citySnapshot.map((city) => (
                                <span key={city.city}>
                                    {city.city}
                                    <strong>{city.count}</strong>
                                </span>
                            ))
                        ) : (
                            <span className="home-hero__city-pill home-hero__city-pill--empty">
                                Popular cities will appear here once the first places are added.
                            </span>
                        )}
                    </div>
                </Card>
            </section>

            <section className="home-grid" id="concierge">
                <Card className="home-panel home-panel--discovery">
                    <span className="eyebrow">What You Can Do</span>
                    <h2>Find ideas, save your own spots, and build a list you will actually use.</h2>
                    <div className="feature-grid">
                        <article>
                            <strong>Browse shared places</strong>
                            <p>
                                Open other profiles, look through saved places, and
                                discover new ideas for your next day out or trip.
                            </p>
                        </article>
                        <article>
                            <strong>Save useful details</strong>
                            <p>
                                Keep titles, descriptions, addresses, and images
                                together so each place stays easy to remember.
                            </p>
                        </article>
                        <article>
                            <strong>Get quick suggestions</strong>
                            <p>
                                Ask which place to visit first, which city already
                                has options, or what kind of place to add next.
                            </p>
                        </article>
                    </div>

                    <div className="home-panel__subgrid">
                        <div>
                            <h3>Ideas for what to add next</h3>
                            <ul className="insight-list">
                                {coverageSuggestions.map((suggestion) => (
                                    <li key={suggestion}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3>Popular profiles</h3>
                            <div className="mini-user-list">
                                {topUsers.length > 0 ? (
                                    topUsers.map((user) => (
                                        <Link
                                            className="mini-user-card"
                                            key={user.id}
                                            to={`/${user.id}/places`}>
                                            <strong>{user.name}</strong>
                                        <span>
                                            {user.places?.length || 0} saved places
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <Card className="mini-user-card mini-user-card--empty">
                                        <strong>No profiles yet</strong>
                                        <span>
                                            Create an account and save the first place
                                            in the app.
                                        </span>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <PlaceConcierge
                    isLoading={isLoading}
                    places={directoryPlaces}
                    users={directoryUsers}
                />
            </section>

            <section className="home-showcase">
                <div className="section-heading">
                    <span className="eyebrow">Places To Start With</span>
                    <h2>Popular places people are saving right now</h2>
                    <p>
                        Use these picks for inspiration, then open the full list to
                        explore more details, addresses, and similar places.
                    </p>
                </div>

                {isLoading ? (
                    <div className="center">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <Card className="empty-panel">
                        <h3>Could not load places right now</h3>
                        <p>{error}</p>
                    </Card>
                ) : featuredPlaces.length === 0 ? (
                    <Card className="empty-panel">
                        <h3>No featured places yet</h3>
                        <p>
                            This section will fill up as soon as people start saving
                            places with descriptions, images, and addresses.
                        </p>
                    </Card>
                ) : (
                    <div className="featured-place-grid">
                        {featuredPlaces.map((place) => (
                            <Card className="featured-place" key={place.id}>
                                <div className="featured-place__topline">
                                    <span>{inferPlaceCategory(place)}</span>
                                    <span>{extractCity(place.address)}</span>
                                </div>
                                <h3>{place.title}</h3>
                                <p>{place.description}</p>
                                <div className="featured-place__meta">
                                    <strong>{place.address}</strong>
                                    <Link to={`/${place.creator}/places`}>
                                        Open collection
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
