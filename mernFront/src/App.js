import { useState, useCallback, useEffect } from "react";
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

const getStoredAuthData = () => {
    try {
        const storedData = JSON.parse(localStorage.getItem("userData"));

        if (
            !storedData ||
            !storedData.token ||
            new Date(storedData.expiration) <= new Date()
        ) {
            return {
                token: null,
                userId: null,
                tokenExpirationDate: null,
            };
        }

        return {
            token: storedData.token,
            userId: storedData.userId,
            tokenExpirationDate: new Date(storedData.expiration),
        };
    } catch (err) {
        return {
            token: null,
            userId: null,
            tokenExpirationDate: null,
        };
    }
};

const App = () => {
    const [storedAuthData] = useState(getStoredAuthData);
    const [token, setToken] = useState(storedAuthData.token);
    const [tokenExpirationDate, setTokenExpirationDate] = useState(
        storedAuthData.tokenExpirationDate,
    );
    const [userId, setUserId] = useState(storedAuthData.userId);

    const login = useCallback((uid, token, expirationDate) => {
        const tokenExpirationDate =
            expirationDate || new Date(new Date().getTime() + 60 * 60 * 1000);

        setToken(token);
        setUserId(uid);
        setTokenExpirationDate(tokenExpirationDate);
        localStorage.setItem(
            "userData",
            JSON.stringify({
                userId: uid,
                token: token,
                expiration: tokenExpirationDate.toISOString(),
            }),
        );
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        setTokenExpirationDate(null);
        localStorage.removeItem("userData");
    }, []);

    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime =
                tokenExpirationDate.getTime() - new Date().getTime();

            const logoutTimer = setTimeout(logout, remainingTime);

            return () => clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExpirationDate]);

    let routes;

    if (token) {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/places/new" exact>
                    <NewPlace />
                </Route>
                <Route path="/places/:placeId">
                    <UpdatePlace />
                </Route>
                <Redirect to="/" />
            </Switch>
        );
    } else {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/auth">
                    <Auth />
                </Route>
                <Redirect to="/auth" />
            </Switch>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token,
                token: token,
                userId: userId,
                login: login,
                logout: logout,
            }}>
            <Router>
                <MainNavigation />
                <main>{routes}</main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
