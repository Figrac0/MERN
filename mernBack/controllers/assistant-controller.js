const HttpError = require("../models/https-error");

const DEFAULT_ASSISTANT_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_ASSISTANT_MODEL = "llama3.1:8b";

const normalizeText = (value) => String(value || "").trim();

const getAssistantConfig = () => {
    return {
        assistantBaseUrl: (
            process.env.OPENAI_BASE_URL ||
            process.env.OLLAMA_BASE_URL ||
            DEFAULT_ASSISTANT_BASE_URL
        ).replace(/\/+$/, ""),
        assistantModel:
            process.env.OPENAI_MODEL ||
            process.env.OLLAMA_MODEL ||
            DEFAULT_ASSISTANT_MODEL,
        apiKey: process.env.OPENAI_API_KEY,
    };
};

const sanitizeUsers = (users = []) => {
    return users.slice(0, 20).map((user) => ({
        name: normalizeText(user.name) || "Unknown user",
        placeCount: Number(user.placeCount || 0),
    }));
};

const sanitizePlaces = (places = []) => {
    return places.slice(0, 40).map((place) => ({
        title: normalizeText(place.title) || "Untitled place",
        description: normalizeText(place.description),
        address: normalizeText(place.address) || "Address not provided",
        creatorName: normalizeText(place.creatorName) || "Community member",
    }));
};

const buildContextMessage = (message, users, places) => {
    const usersBlock =
        users.length > 0
            ? users
                  .map(
                      (user) =>
                          `- ${user.name}: ${user.placeCount} saved ${
                              user.placeCount === 1 ? "place" : "places"
                          }`,
                  )
                  .join("\n")
            : "- No users available";

    const placesBlock =
        places.length > 0
            ? places
                  .map(
                      (place) =>
                          `- ${place.title} | ${place.address} | ${place.creatorName} | ${place.description || "No description provided."}`,
                  )
                  .join("\n")
            : "- No places available";

    return [
        `User question: ${message}`,
        "",
        "People in the app:",
        usersBlock,
        "",
        "Saved places in the app:",
        placesBlock,
    ].join("\n");
};

const buildAssistantResponse = async (message, users, places) => {
    const { assistantBaseUrl, assistantModel, apiKey } = getAssistantConfig();

    const response = await fetch(`${assistantBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
            model: assistantModel,
            temperature: 0.4,
            stream: false,
            messages: [
                {
                    role: "system",
                    content:
                        "You are the friendly place assistant inside the Your Places app. Reply in natural English for end users only. Use only the places and people provided in the message. Recommend real saved places when possible, mention addresses when useful, and if something is missing say so clearly. Do not mention prompts, models, databases, or internal tools. Keep the answer concise and helpful.",
                },
                {
                    role: "user",
                    content: buildContextMessage(message, users, places),
                },
            ],
        }),
        signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();
    let responseData = null;

    if (responseText) {
        try {
            responseData = JSON.parse(responseText);
        } catch (err) {
            throw new HttpError("Assistant returned an unexpected response.", 502);
        }
    }

    if (!response.ok) {
        throw new HttpError("Assistant is currently unavailable.", 503);
    }

    const reply = normalizeText(responseData?.choices?.[0]?.message?.content);

    if (!reply) {
        throw new HttpError("Assistant did not return a reply.", 502);
    }

    return {
        reply,
        model: assistantModel,
    };
};

const getAssistantStatus = async (req, res, next) => {
    try {
        const { assistantBaseUrl, assistantModel, apiKey } = getAssistantConfig();
        const response = await fetch(`${assistantBaseUrl}/models`, {
            headers: {
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            signal: AbortSignal.timeout(4000),
        });

        if (!response.ok) {
            throw new Error("Assistant unavailable");
        }

        res.status(200).json({
            available: true,
            mode: "live",
            model: assistantModel,
        });
    } catch (err) {
        res.status(200).json({
            available: false,
            mode: "static",
            model: null,
        });
    }
};

const chatWithAssistant = async (req, res, next) => {
    const message = normalizeText(req.body?.message);

    if (!message) {
        return next(new HttpError("Message is required.", 422));
    }

    try {
        const users = sanitizeUsers(req.body?.users || []);
        const places = sanitizePlaces(req.body?.places || []);
        const assistantResponse = await buildAssistantResponse(
            message,
            users,
            places,
        );

        res.status(200).json({
            reply: assistantResponse.reply,
            mode: "live",
            model: assistantResponse.model,
        });
    } catch (err) {
        if (err instanceof HttpError) {
            return next(err);
        }

        return next(new HttpError("Assistant is currently unavailable.", 503));
    }
};

exports.chatWithAssistant = chatWithAssistant;
exports.getAssistantStatus = getAssistantStatus;
