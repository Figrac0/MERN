import { useEffect, useMemo, useState } from "react";

import UsersList from "../components/UsersList";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { buildApiUrl } from "../../shared/util/url";

import "./Users.css";

const Users = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [sortMode, setSortMode] = useState("activity");

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    buildApiUrl("/users"),
                );

                if (isMounted) {
                    setLoadedUsers(responseData.users || []);
                }
            } catch (err) {}
        };
        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, [sendRequest]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return [...loadedUsers]
            .filter((user) => {
                if (!normalizedSearch) {
                    return true;
                }

                return [user.name, user.email]
                    .filter(Boolean)
                    .some((value) =>
                        value.toLowerCase().includes(normalizedSearch),
                    );
            })
            .sort((firstUser, secondUser) => {
                if (sortMode === "name") {
                    return firstUser.name.localeCompare(secondUser.name);
                }

                return (
                    (secondUser.places?.length || 0) -
                    (firstUser.places?.length || 0)
                );
            });
    }, [loadedUsers, searchValue, sortMode]);

    const totalPlaces = useMemo(
        () =>
            loadedUsers.reduce(
                (total, user) => total + (user.places?.length || 0),
                0,
            ),
        [loadedUsers],
    );

    const activeCurators = useMemo(
        () => loadedUsers.filter((user) => (user.places?.length || 0) > 0).length,
        [loadedUsers],
    );

    const topCurator = useMemo(() => {
        return [...loadedUsers].sort((firstUser, secondUser) => {
            return (
                (secondUser.places?.length || 0) - (firstUser.places?.length || 0)
            );
        })[0];
    }, [loadedUsers]);

    return (
        <div className="page users-page">
            <ErrorModal error={error} onClear={clearError} />
            <section className="page-hero users-hero">
                <span className="eyebrow">Community</span>
                <h1>See who is sharing places.</h1>
                <p className="page-lead">
                    Browse profiles, open saved places, and discover new ideas from
                    people who are already building their own lists.
                </p>
                <div className="users-hero__stats">
                    <Card className="users-stat">
                        <strong>{loadedUsers.length}</strong>
                        <span>people joined</span>
                    </Card>
                    <Card className="users-stat">
                        <strong>{activeCurators}</strong>
                        <span>people with saved places</span>
                    </Card>
                    <Card className="users-stat">
                        <strong>{totalPlaces}</strong>
                        <span>places shared in total</span>
                    </Card>
                    <Card className="users-stat">
                        <strong>{topCurator?.name || "Waiting..."}</strong>
                        <span>most active profile right now</span>
                    </Card>
                </div>
            </section>

            <Card className="users-toolbar">
                <div className="users-toolbar__field">
                    <label htmlFor="user-search">Search people</label>
                    <input
                        id="user-search"
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search by name or email"
                        type="search"
                        value={searchValue}
                    />
                </div>

                <div className="users-toolbar__field">
                    <label htmlFor="user-sort">Sort view</label>
                    <select
                        id="user-sort"
                        onChange={(event) => setSortMode(event.target.value)}
                        value={sortMode}>
                        <option value="activity">Most active first</option>
                        <option value="name">Alphabetical</option>
                    </select>
                </div>

                <div className="users-toolbar__summary">
                    <strong>{filteredUsers.length}</strong>
                    <span>profiles shown in the current view</span>
                </div>
            </Card>

            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && (
                <UsersList
                    emptyText="Try a broader search or switch the sorting mode."
                    emptyTitle="No people match your current view."
                    items={filteredUsers}
                />
            )}
        </div>
    );
};

export default Users;
