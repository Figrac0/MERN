import { Link } from "react-router-dom";
import { useContext, useMemo, useState } from "react";

import MainHeader from "./MainHeader";
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import Backdrop from "../UIElements/Backdrop";
import Avatar from "../UIElements/Avatar";
import { AuthContext } from "../../context/auth-context";
import { buildAssetUrl } from "../../util/url";

import "./MainNavigation.css";

const MainNavigation = (props) => {
    const auth = useContext(AuthContext);
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const initials = useMemo(() => {
        return auth.userId ? String(auth.userId).slice(-2).toUpperCase() : "G";
    }, [auth.userId]);

    const openDrawerHandler = () => {
        setDrawerIsOpen(true);
    };
    const closeDrawerHandler = () => {
        setDrawerIsOpen(false);
    };

    return (
        <>
            {drawerIsOpen ? <Backdrop onClick={closeDrawerHandler} /> : null}
            <SideDrawer show={drawerIsOpen} onClick={closeDrawerHandler}>
                <nav className="main-navigation__drawer-nav">
                    <NavLinks />
                </nav>
            </SideDrawer>
            <MainHeader>
                <div className="main-navigation__left">
                    <button
                        className="main-navigation__menu-btn"
                        onClick={openDrawerHandler}
                        type="button">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <Link className="main-navigation__brand" to="/">
                        <span className="main-navigation__brand-mark">YP</span>
                        <span className="main-navigation__brand-copy">
                            <strong>Your Places</strong>
                            <small>Find and save great places</small>
                        </span>
                    </Link>
                </div>

                <nav className="main-navigation__header-nav">
                    <NavLinks />
                </nav>

                <div className="main-navigation__status">
                    {auth.isLoggedIn ? (
                        <>
                            {auth.userImage ? (
                                <Avatar
                                    alt="Signed in user"
                                    className="main-navigation__status-avatar"
                                    image={buildAssetUrl(auth.userImage)}
                                />
                            ) : (
                                <span className="main-navigation__status-fallback">
                                    {initials}
                                </span>
                            )}
                            <span>Signed in</span>
                        </>
                    ) : (
                        <span>Browsing as guest</span>
                    )}
                </div>
            </MainHeader>
        </>
    );
};

export default MainNavigation;
