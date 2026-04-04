import { useParams, useHistory } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

import {
    VALIDATOR_MINLENGTH,
    VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { buildApiUrl } from "../../shared/util/url";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

import "./PlaceForm.css";

const UpdatePlace = (props) => {
    const auth = useContext(AuthContext);

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [loadedPlace, setLoadedPlace] = useState();

    const placeId = useParams().placeId;

    const history = useHistory();

    const [formState, inputHandler, setFromData] = useForm(
        {
            title: {
                value: "",
                isValid: true,
            },
            description: {
                value: "",
                isValid: true,
            },
        },
        false,
    );

    const readinessItems = [
        {
            label: "The title is still clear and easy to remember",
            ready: formState.inputs.title.value.trim().length > 2,
        },
        {
            label: "The description still explains why the place matters",
            ready: formState.inputs.description.value.trim().length >= 10,
        },
        {
            label: "The updated details still fit this place",
            ready: !!loadedPlace,
        },
    ];

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(
                    buildApiUrl(`/places/${placeId}`),
                );
                setLoadedPlace(responseData.place);

                setFromData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true,
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true,
                        },
                    },
                    true,
                );
            } catch (err) {}
        };
        fetchPlace();
    }, [sendRequest, placeId, setFromData]);

    const placeUpdateSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            await sendRequest(
                buildApiUrl(`/places/${placeId}`),
                "PATCH",
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                }),
                {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            );
            history.push("/" + auth.userId + "/places");
        } catch (err) {}
    };

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!loadedPlace && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Place not found.</h2>
                </Card>
            </div>
        );
    }

    return (
        <div className="page page--wide place-editor">
            <ErrorModal error={error} onClear={clearError} />
            <section className="page-hero place-editor__hero">
                <span className="eyebrow">Edit a Place</span>
                <h1>Update the details and keep this place easy to understand.</h1>
                <p className="page-lead">
                    Refresh the title or description so the place still feels clear,
                    useful, and ready to share.
                </p>
            </section>
            {!isLoading && loadedPlace && (
                <div className="place-editor__layout">
                    <form
                        className="place-form"
                        onSubmit={placeUpdateSubmitHandler}>
                        <Input
                            id="title"
                            element="input"
                            type="text"
                            label="Title"
                            placeholder="Keep it clear and memorable"
                            validators={[VALIDATOR_REQUIRE]}
                            errorText="Please enter a valid title!"
                            onInput={inputHandler}
                            initialValue={loadedPlace.title}
                            initialValid={true}
                        />
                        <Input
                            id="description"
                            element="textarea"
                            label="Description"
                            placeholder="Update what makes this place worth saving"
                            validators={[VALIDATOR_MINLENGTH(5)]}
                            errorText="Please enter a valid description (min. 5 characters)"
                            onInput={inputHandler}
                            initialValue={loadedPlace.description}
                            initialValid={true}
                        />
                        <Button type="submit" disabled={!formState.isValid}>
                            Update Place
                        </Button>
                    </form>

                    <aside className="place-editor__sidebar">
                        <Card className="place-editor__preview">
                            <span className="eyebrow">Preview</span>
                            <h2>{formState.inputs.title.value || loadedPlace.title}</h2>
                            <strong>{loadedPlace.address}</strong>
                            <p>
                                {formState.inputs.description.value ||
                                    loadedPlace.description}
                            </p>
                        </Card>

                        <Card className="place-editor__preview place-editor__preview--checklist">
                            <span className="eyebrow">Before You Save</span>
                            <ul className="place-editor__checklist">
                                {readinessItems.map((item) => (
                                    <li key={item.label}>
                                        <span
                                            className={
                                                item.ready
                                                    ? "place-editor__indicator place-editor__indicator--ready"
                                                    : "place-editor__indicator"
                                            }></span>
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default UpdatePlace;
