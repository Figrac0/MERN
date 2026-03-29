import { useEffect, useState } from "react";

import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    "http://localhost:5000/api/users",
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

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && <UsersList items={loadedUsers} />}
        </>
    );
};

export default Users;
