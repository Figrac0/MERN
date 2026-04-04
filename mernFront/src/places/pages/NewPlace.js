import { useContext } from "react";
import { useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

import {
    VALIDATOR_REQUIRE,
    VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { buildApiUrl } from "../../shared/util/url";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

import "./PlaceForm.css";

const NewPlace = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler] = useForm(
        {
            title: {
                value: "",
                isValid: false,
            },
            description: {
                value: "",
                isValid: false,
            },
            address: {
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
    const history = useHistory();
    const readinessItems = [
        {
            label: "The title is clear and easy to remember",
            ready: formState.inputs.title.value.trim().length > 2,
        },
        {
            label: "The description explains why this place is worth saving",
            ready: formState.inputs.description.value.trim().length >= 10,
        },
        {
            label: "The address is clear enough to find in real life",
            ready: formState.inputs.address.value.trim().length >= 5,
        },
        {
            label: "An image has been added",
            ready: !!formState.inputs.image.value,
        },
    ];

    const placeSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", formState.inputs.title.value);
            formData.append("description", formState.inputs.description.value);
            formData.append("address", formState.inputs.address.value);
            formData.append("creator", auth.userId);
            formData.append("image", formState.inputs.image.value);

            await sendRequest(
                buildApiUrl("/places"),
                "POST",
                formData,
                {
                    Authorization: "Bearer " + auth.token,
                },
            );
            history.push("/" + auth.userId + "/places");
        } catch (err) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="page page--wide place-editor">
            <ErrorModal error={error} onClear={clearError} />
            <section className="page-hero place-editor__hero">
                <span className="eyebrow">Create a Place</span>
                <h1>Add a place people will actually want to visit.</h1>
                <p className="page-lead">
                    Give it a clear title, a helpful description, and a real
                    address so it is easy to understand and easy to find.
                </p>
            </section>

            <div className="place-editor__layout">
                <form className="place-form" onSubmit={placeSubmitHandler}>
                    {isLoading && <LoadingSpinner asOverlay />}
                    <Input
                        id="title"
                        element="input"
                        type="text"
                        label="Title"
                        placeholder="E.g. Marienplatz"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid title."
                        onInput={inputHandler}
                    />
                    <Input
                        id="description"
                        element="textarea"
                        label="Description"
                        placeholder="Why is this place worth saving or visiting?"
                        validators={[VALIDATOR_MINLENGTH(5)]}
                        errorText="Please enter a valid description (at least 5 characters)."
                        onInput={inputHandler}
                    />
                    <Input
                        id="address"
                        element="input"
                        label="Address"
                        placeholder="Street, district, city"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid address."
                        onInput={inputHandler}
                    />
                    <ImageUpload
                        center
                        id="image"
                        onInput={inputHandler}
                        errorText="Please provide an image."
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        Add Place
                    </Button>
                </form>

                <aside className="place-editor__sidebar">
                    <Card className="place-editor__preview">
                        <span className="eyebrow">Preview</span>
                        <h2>
                            {formState.inputs.title.value || "Your next saved place"}
                        </h2>
                        <strong>
                            {formState.inputs.address.value || "Street, district, city"}
                        </strong>
                        <p>
                            {formState.inputs.description.value ||
                                "Use this space to explain what makes the place useful, interesting, or easy to recommend."}
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
        </div>
    );
};

export default NewPlace;
