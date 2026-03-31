import { useState, useCallback } from "react";
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from "react-router-dom";

import Users from "./user/pages/Users";
import NewPlace from "./places/pages/NewPlace";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./user/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";

const AUTH_STORAGE_KEY = "userData";

const App = () => {
    const [storedAuthData] = useState(() => {
        const storedData = localStorage.getItem(AUTH_STORAGE_KEY);

        if (!storedData) {
            return { isLoggedIn: false, userId: null };
        }

        try {
            const parsedData = JSON.parse(storedData);
            return {
                isLoggedIn: !!parsedData?.isLoggedIn,
                userId: parsedData?.userId || null,
            };
        } catch (err) {
            return { isLoggedIn: false, userId: null };
        }
    });
    const [isLoggedIn, setIsLoggedIn] = useState(storedAuthData.isLoggedIn);
    const [userId, setUserId] = useState(storedAuthData.userId);

    const login = useCallback((uid) => {
        setIsLoggedIn(true);
        setUserId(uid);
        localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ isLoggedIn: true, userId: uid }),
        );
    }, []);

    const logout = useCallback(() => {
        setIsLoggedIn(false);
        setUserId(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: isLoggedIn,
                userId: userId,
                login: login,
                logout: logout,
            }}>
            <Router>
                <MainNavigation />
                <main>
                    <Switch>
                        <Route path="/" exact>
                            <Users />
                        </Route>
                        <Route path="/:userId/places" exact>
                            <UserPlaces />
                        </Route>
                        {isLoggedIn && (
                            <Route path="/places/new" exact>
                                <NewPlace />
                            </Route>
                        )}
                        {isLoggedIn && (
                            <Route path="/places/:placeId" exact>
                                <UpdatePlace />
                            </Route>
                        )}
                        {!isLoggedIn && (
                            <Route path="/auth" exact>
                                <Auth />
                            </Route>
                        )}
                        <Redirect to={isLoggedIn ? "/" : "/auth"} />
                    </Switch>
                </main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
