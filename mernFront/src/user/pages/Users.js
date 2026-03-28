import { useEffect, useState } from "react";

import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const Users = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState();
    const [loadedUsers, setLoadedUsers] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const sendRequest = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/users");
                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData.message);
                }

                if (isMounted) {
                    setLoadedUsers(responseData.users || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        sendRequest();

        return () => {
            isMounted = false;
        };
    }, []);

    const errorHandler = () => {
        setError(null);
    };

    return (
        <>
            {isLoading && (
                <div className="center">
                    <LoadingSpinner asOverlay />
                </div>
            )}
            <ErrorModal error={error} onClear={errorHandler} />
            {!isLoading && <UsersList items={loadedUsers} />}
        </>
    );
};

export default Users;
