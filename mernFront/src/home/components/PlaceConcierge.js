import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import { buildApiUrl } from "../../shared/util/url";
import {
    createAssistantReply,
    getDefaultAssistantPrompts,
    inferPlaceCategory,
} from "../../shared/util/place-insights";

import "./PlaceConcierge.css";

const toAssistantDataset = (users, places) => {
    return {
        users: (users || []).slice(0, 20).map((user) => ({
            id: user.id,
            name: user.name,
            placeCount: user.places?.length || 0,
        })),
        places: (places || []).slice(0, 40).map((place) => ({
            id: place.id,
            title: place.title,
            description: place.description,
            address: place.address,
            creator: place.creator,
            creatorName: place.creatorName,
        })),
    };
};

const requestLiveReply = async (promptText, users, places) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 12000);

    try {
        const response = await fetch(buildApiUrl("/assistant/chat"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: promptText,
                ...toAssistantDataset(users, places),
            }),
            signal: abortController.signal,
        });

        const responseText = await response.text();
        const responseData = responseText ? JSON.parse(responseText) : null;

        if (!response.ok || !responseData?.reply) {
            throw new Error("Live assistant is unavailable.");
        }

        return responseData.reply;
    } finally {
        clearTimeout(timeoutId);
    }
};

const requestAssistantStatus = async () => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 5000);

    try {
        const response = await fetch(buildApiUrl("/assistant/status"), {
            signal: abortController.signal,
        });
        const responseText = await response.text();
        const responseData = responseText ? JSON.parse(responseText) : null;

        return responseData?.available ? "live" : "static";
    } catch (err) {
        return "static";
    } finally {
        clearTimeout(timeoutId);
    }
};

const PlaceConcierge = ({ users, places, isLoading }) => {
    const [draft, setDraft] = useState("");
    const [assistantMode, setAssistantMode] = useState("auto");
    const [isReplying, setIsReplying] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            text: "Hi! Ask me where to go first, which places match a city, or what kind of place would be a great next addition.",
            suggestions: getDefaultAssistantPrompts(),
        },
    ]);

    const quickPrompts = useMemo(() => getDefaultAssistantPrompts(), []);

    useEffect(() => {
        let isMounted = true;

        const loadAssistantStatus = async () => {
            const nextMode = await requestAssistantStatus();

            if (isMounted) {
                setAssistantMode(nextMode);
            }
        };

        loadAssistantStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isLoading && places.length > 0) {
            setMessages((currentMessages) => {
                if (currentMessages.some((message) => message.id === "ready")) {
                    return currentMessages;
                }

                return [
                    ...currentMessages,
                    {
                        id: "ready",
                        role: "assistant",
                        text: `I can already see ${places.length} saved places from ${users.length} people, so I can help with ideas, routes, and what to save next.`,
                        matches: places.slice(0, 2),
                    },
                ];
            });
        }
    }, [isLoading, places, users.length]);

    const submitPrompt = async (promptText) => {
        const cleanedPrompt = promptText.trim();

        if (!cleanedPrompt || isReplying) {
            return;
        }

        const fallbackReply = createAssistantReply(cleanedPrompt, users, places);
        const userMessageId = `user-${Date.now()}`;
        const assistantMessageId = `assistant-${Date.now() + 1}`;

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: userMessageId,
                role: "user",
                text: cleanedPrompt,
            },
        ]);
        setDraft("");
        setIsReplying(true);

        let finalReply = fallbackReply;

        try {
            const liveReplyText = await requestLiveReply(
                cleanedPrompt,
                users,
                places,
            );

            finalReply = {
                ...fallbackReply,
                text: liveReplyText,
            };
            setAssistantMode("live");
        } catch (err) {
            setAssistantMode("static");
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: assistantMessageId,
                role: "assistant",
                ...finalReply,
            },
        ]);
        setIsReplying(false);
    };

    const submitHandler = (event) => {
        event.preventDefault();
        submitPrompt(draft);
    };

    return (
        <Card className="concierge">
            <div className="concierge__header">
                <div>
                    <span className="eyebrow">Trip Helper</span>
                    <h3>Ask for ideas</h3>
                    <p>
                        Ask where to go first, which places fit a city, or what
                        kind of place would make your list more useful.
                    </p>
                    {assistantMode === "static" && (
                        <small className="concierge__mode-note">
                            Live AI replies are currently available only when you run
                            the app locally with Ollama. Right now you are using the
                            built-in place helper.
                        </small>
                    )}
                </div>
                <div className="concierge__badge">
                    <span className="concierge__status"></span>
                    {assistantMode === "live"
                        ? "Live AI replies"
                        : "Smart place suggestions"}
                </div>
            </div>

            <div className="concierge__prompts">
                {quickPrompts.map((prompt) => (
                    <button
                        key={prompt}
                        className="concierge__prompt"
                        onClick={() => submitPrompt(prompt)}
                        type="button">
                        {prompt}
                    </button>
                ))}
            </div>

            <div className="concierge__messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`concierge__message concierge__message--${message.role}`}>
                        <p>{message.text}</p>

                        {message.bullets && (
                            <ul>
                                {message.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        )}

                        {message.matches && message.matches.length > 0 && (
                            <div className="concierge__matches">
                                {message.matches.map((place) => (
                                    <Link
                                        key={`${message.id}-${place.id}`}
                                        className="concierge__match"
                                        to={`/${place.creator}/places`}>
                                        <span className="concierge__match-tag">
                                            {inferPlaceCategory(place)}
                                        </span>
                                        <strong>{place.title}</strong>
                                        <span>{place.address}</span>
                                        <small>
                                            Added by {place.creatorName || "the community"}
                                        </small>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {message.suggestions && (
                            <div className="concierge__follow-up">
                                {message.suggestions.map((suggestion) => (
                                    <button
                                        key={`${message.id}-${suggestion}`}
                                        className="concierge__suggestion"
                                        onClick={() => submitPrompt(suggestion)}
                                        type="button">
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <form className="concierge__composer" onSubmit={submitHandler}>
                <textarea
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Try asking: Where should I go first? Show me places in Munich. What should I add next?"
                    rows="3"
                    value={draft}
                />
                <div className="concierge__actions">
                    <p>
                        Answers are based on the places already saved in this app.
                    </p>
                    <Button type="submit" disabled={isReplying}>
                        {isReplying ? "Thinking..." : "Ask now"}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default PlaceConcierge;
