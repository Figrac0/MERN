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

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = useCallback(() => {
        setIsLoggedIn(true);
    }, []);

    const logout = useCallback(() => {
        setIsLoggedIn(false);
    }, []);

    let routes;

    if (isLoggedIn) {
        routes = (
            <>
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/places/new" exact>
                    <NewPlace />
                </Route>

                <Route path="/places/:placeId" exact>
                    <UpdatePlace />
                </Route>
                <Redirect to="/" />
            </>
        );
    } else {
        routes = (
            <>
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
            </>
        );
    }

    return (
        <AuthContext.Provider
            value={{ isLoggedIn: isLoggedIn, login: login, logout: logout }}>
            <Router>
                <MainNavigation />
                <main>
                    <Switch>{routes}</Switch>
                </main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
