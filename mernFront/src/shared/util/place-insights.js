const CATEGORY_RULES = [
    {
        label: "Culture",
        keywords: [
            "museum",
            "gallery",
            "art",
            "historic",
            "history",
            "theatre",
            "cathedral",
            "church",
            "castle",
            "monument",
            "square",
            "plaza",
        ],
    },
    {
        label: "Food",
        keywords: [
            "cafe",
            "coffee",
            "restaurant",
            "bistro",
            "bakery",
            "bar",
            "market",
            "food",
            "brunch",
            "dinner",
        ],
    },
    {
        label: "Nature",
        keywords: [
            "park",
            "garden",
            "lake",
            "river",
            "forest",
            "trail",
            "beach",
            "viewpoint",
            "hill",
            "mountain",
        ],
    },
    {
        label: "Nightlife",
        keywords: [
            "club",
            "cocktail",
            "rooftop",
            "night",
            "music",
            "live",
            "party",
            "late",
        ],
    },
    {
        label: "Local Gem",
        keywords: [
            "district",
            "street",
            "boutique",
            "studio",
            "library",
            "bookshop",
            "design",
            "workshop",
        ],
    },
];

const DEFAULT_PROMPTS = [
    "Which places are best to visit first?",
    "Show me places in Munich",
    "Which addresses are already saved?",
    "What should I add next?",
];

const normalize = (value = "") => value.toLowerCase().trim();

export const extractCity = (address = "") => {
    const segments = address
        .split(",")
        .map((segment) => segment.trim())
        .filter(Boolean);

    return segments[segments.length - 1] || "Unknown city";
};

export const inferPlaceCategory = (place = {}) => {
    const haystack = normalize(
        `${place.title || ""} ${place.description || ""} ${place.address || ""}`,
    );

    const matchedRule = CATEGORY_RULES.find((rule) =>
        rule.keywords.some((keyword) => haystack.includes(keyword)),
    );

    return matchedRule ? matchedRule.label : "Signature Spot";
};

export const scorePlace = (place = {}) => {
    const descriptionWeight = Math.min(
        (place.description || "").trim().length / 24,
        4,
    );
    const addressWeight = Math.min(
        (place.address || "").split(",").filter(Boolean).length,
        3,
    );
    const titleWeight = (place.title || "").trim().length > 10 ? 1.4 : 0.7;

    return descriptionWeight + addressWeight + titleWeight;
};

export const getTopPlaces = (places = [], limit = 4) => {
    return [...places]
        .sort((firstPlace, secondPlace) => {
            return scorePlace(secondPlace) - scorePlace(firstPlace);
        })
        .slice(0, limit);
};

export const getTopCities = (places = [], limit = 4) => {
    const cityMap = places.reduce((accumulator, place) => {
        const city = extractCity(place.address);
        accumulator[city] = (accumulator[city] || 0) + 1;
        return accumulator;
    }, {});

    return Object.entries(cityMap)
        .sort((firstCity, secondCity) => secondCity[1] - firstCity[1])
        .slice(0, limit)
        .map(([city, count]) => ({ city, count }));
};

export const buildCoverageSuggestions = (places = []) => {
    const categories = new Set(places.map(inferPlaceCategory));
    const cities = getTopCities(places, 2);
    const suggestions = [];

    if (!categories.has("Food")) {
        suggestions.push(
            "Add one great food spot with a clear address and a simple reason why it is worth visiting.",
        );
    }

    if (!categories.has("Nature")) {
        suggestions.push(
            "Balance the list with an outdoor place such as a park, river walk, garden, or viewpoint.",
        );
    }

    if (!categories.has("Culture")) {
        suggestions.push(
            "Add a cultural stop like a museum, gallery, theatre, or historic square.",
        );
    }

    if (cities[0] && cities[0].count >= Math.max(3, places.length - 1)) {
        suggestions.push(
            `Most saved places are in ${cities[0].city}. Add another city or neighborhood to make the list feel more varied.`,
        );
    }

    if (places.length < 4) {
        suggestions.push(
            "The list is still small. Try adding a daytime place, a food stop, and an evening option for a fuller set of ideas.",
        );
    }

    return suggestions.length > 0
        ? suggestions.slice(0, 3)
        : [
              "The list already feels balanced. The next step is better descriptions, stronger photos, and more variety between neighborhoods.",
          ];
};

export const buildCollectionMetrics = (places = []) => {
    const topCities = getTopCities(places, 3);
    const categoryCounts = places.reduce((accumulator, place) => {
        const category = inferPlaceCategory(place);
        accumulator[category] = (accumulator[category] || 0) + 1;
        return accumulator;
    }, {});

    const leadingCategory = Object.entries(categoryCounts).sort(
        (firstEntry, secondEntry) => secondEntry[1] - firstEntry[1],
    )[0];

    return {
        totalPlaces: places.length,
        uniqueCities: new Set(places.map((place) => extractCity(place.address))).size,
        primaryCity: topCities[0]?.city || "Not enough data yet",
        leadingCategory: leadingCategory ? leadingCategory[0] : "Open mix",
        nextSuggestion: buildCoverageSuggestions(places)[0],
    };
};

const placeMatchesQuery = (place, query) => {
    const normalizedQuery = normalize(query);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const haystack = normalize(
        [
            place.title,
            place.description,
            place.address,
            place.creatorName,
            inferPlaceCategory(place),
            extractCity(place.address),
        ].join(" "),
    );

    return (
        haystack.includes(normalizedQuery) ||
        queryTokens.every((token) => haystack.includes(token))
    );
};

const createRecommendationReply = (places) => {
    const recommendations = getTopPlaces(places, 3);

    return {
        text: "These are the best places to start with based on how clear, complete, and useful they feel.",
        bullets: recommendations.map(
            (place) =>
                `${place.title} in ${extractCity(place.address)} stands out because ${place.description}.`,
        ),
        matches: recommendations,
    };
};

const createAddressReply = (places, query) => {
    const matches = query
        ? places.filter((place) => placeMatchesQuery(place, query)).slice(0, 4)
        : getTopPlaces(places, 4);

    if (matches.length === 0) {
        return {
            text: "I could not find that address yet. Try asking about a city, a place name, or the strongest saved addresses.",
            suggestions: DEFAULT_PROMPTS,
        };
    }

    return {
        text: "Here are the saved addresses that match best.",
        bullets: matches.map((place) => `${place.title} - ${place.address}`),
        matches,
    };
};

const createCreationReply = (places) => {
    const suggestions = buildCoverageSuggestions(places);
    const strongestCities = getTopCities(places, 2);

    return {
        text:
            strongestCities.length > 0
                ? `Right now the list is strongest in ${strongestCities
                      .map((city) => city.city)
                      .join(" and ")}. These additions would make it even better.`
                : "The list is still growing. These additions would make it much more useful right away.",
        bullets: suggestions,
        matches: getTopPlaces(places, 2),
    };
};

const createMatchedReply = (places, query) => {
    const matches = places.filter((place) => placeMatchesQuery(place, query));

    if (matches.length === 0) {
        return null;
    }

    const rankedMatches = getTopPlaces(matches, 4);

    return {
        text: `I found ${matches.length} matching ${
            matches.length > 1 ? "places" : "place"
        } for "${query}". These are the closest matches.`,
        bullets: rankedMatches.map(
            (place) =>
                `${place.title} - ${place.address} - ${inferPlaceCategory(place)}`,
        ),
        matches: rankedMatches,
    };
};

export const createAssistantReply = (query, users = [], places = []) => {
    const normalizedQuery = normalize(query);

    if (places.length === 0) {
        return {
            text: "There are not enough saved places yet for recommendations. Add a few places with clear titles, descriptions, and addresses, and I will be able to help much more.",
            suggestions: DEFAULT_PROMPTS,
        };
    }

    if (!normalizedQuery || /best|recommend|visit|first|trip|weekend/.test(normalizedQuery)) {
        return createRecommendationReply(places);
    }

    if (/address|where|located/.test(normalizedQuery)) {
        return createAddressReply(places, query);
    }

    if (/add|create|new place|next/.test(normalizedQuery)) {
        return createCreationReply(places);
    }

    const matchedReply = createMatchedReply(places, query);

    if (matchedReply) {
        return matchedReply;
    }

    return {
        text: `I could not match "${query}" to a specific place yet. Try asking about a city, a place name, saved addresses, or what to add next.`,
        bullets: [
            `People in the app: ${users.length}`,
            `Saved places: ${places.length}`,
            `Top city right now: ${getTopCities(places, 1)[0]?.city || "Not enough data yet"}`,
        ],
        suggestions: DEFAULT_PROMPTS,
    };
};

export const getDefaultAssistantPrompts = () => DEFAULT_PROMPTS;
