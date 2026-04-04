import { useState, useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

import {
    VALIDATOR_EMAIL,
    VALIDATOR_MINLENGTH,
    VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { buildApiUrl } from "../../shared/util/url";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Auth.css";

const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm(
        {
            email: {
                value: "",
                isValid: false,
            },
            password: {
                value: "",
                isValid: false,
            },
        },
        false,
    );

    const switchModeHandler = () => {
        if (!isLoginMode) {
            setFormData(
                {
                    ...formState.inputs,
                    name: undefined,
                    image: undefined,
                },
                formState.inputs.email.isValid &&
                    formState.inputs.password.isValid,
            );
        } else {
            setFormData(
                {
                    ...formState.inputs,
                    name: {
                        value: "",
                        isValid: false,
                    },
                    image: {
                        value: null,
                        isValid: false,
                    },
                },
                false,
            );
        }
        setIsLoginMode((prevMode) => !prevMode);
    };

    const authSubmitHandler = async (event) => {
        event.preventDefault();

        if (isLoginMode) {
            try {
                const responseData = await sendRequest(
                    buildApiUrl("/users/login"),
                    "POST",
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value,
                    }),
                    {
                        "Content-Type": "application/json",
                    },
                );
                auth.login(
                    responseData.userId,
                    responseData.token,
                    undefined,
                    responseData.image,
                );
            } catch (err) {}
        } else {
            try {
                const formData = new FormData();
                formData.append("name", formState.inputs.name.value);
                formData.append("email", formState.inputs.email.value);
                formData.append("password", formState.inputs.password.value);
                formData.append("image", formState.inputs.image.value);

                const responseData = await sendRequest(
                    buildApiUrl("/users/signup"),
                    "POST",
                    formData,
                );

                auth.login(
                    responseData.userId,
                    responseData.token,
                    undefined,
                    responseData.image,
                );
            } catch (err) {}
        }
    };

    return (
        <div className="page page--wide auth-page">
            <ErrorModal error={error} onClear={clearError} />
            <section className="auth-page__intro">
                <span className="eyebrow">Your Account</span>
                <h1>
                    Save favorite places and keep them in one beautiful list.
                </h1>
                <p className="page-lead">
                    Create an account to add places, upload photos, and keep your
                    own collection ready for the next trip, walk, or weekend plan.
                </p>
                <div className="auth-page__benefits">
                    <Card className="auth-page__benefit">
                        <strong>Save places you love</strong>
                        <span>Keep titles, addresses, notes, and photos together.</span>
                    </Card>
                    <Card className="auth-page__benefit">
                        <strong>Get ideas from others</strong>
                        <span>Browse shared places and discover new spots faster.</span>
                    </Card>
                    <Card className="auth-page__benefit">
                        <strong>Ask for suggestions</strong>
                        <span>Get help deciding where to go and what to add next.</span>
                    </Card>
                </div>
            </section>

            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                <div className="authentication__heading">
                    <span className="eyebrow">
                        {isLoginMode ? "Welcome back" : "Create profile"}
                    </span>
                    <h2>{isLoginMode ? "Sign in to your account" : "Create your account"}</h2>
                    <p>
                        {isLoginMode
                            ? "Open your saved places and keep exploring."
                            : "Add a photo so people can recognize your profile."}
                    </p>
                </div>
                <form onSubmit={authSubmitHandler}>
                    {!isLoginMode && (
                        <Input
                            element="input"
                            id="name"
                            type="text"
                            label="Your name"
                            placeholder="How should people see your name?"
                            validators={[VALIDATOR_REQUIRE()]}
                            errorText="Please enter a name."
                            onInput={inputHandler}
                        />
                    )}
                    {!isLoginMode && (
                        <ImageUpload
                            center
                            id="image"
                            onInput={inputHandler}
                            errorText="Please provide an image."
                        />
                    )}
                    <Input
                        autoComplete="email"
                        element="input"
                        id="email"
                        type="email"
                        label="E-Mail"
                        placeholder="you@example.com"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid email address."
                        onInput={inputHandler}
                    />
                    <Input
                        autoComplete={isLoginMode ? "current-password" : "new-password"}
                        element="input"
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="At least 6 characters"
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText="Please enter a valid password, at least 6 characters."
                        onInput={inputHandler}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ? "Log In" : "Create Account"}
                    </Button>
                </form>
                <Button className="authentication__switch" inverse onClick={switchModeHandler}>
                    {isLoginMode ? "Need a new profile? Switch to signup" : "Already have an account? Switch to login"}
                </Button>
            </Card>
        </div>
    );
};

export default Auth;
