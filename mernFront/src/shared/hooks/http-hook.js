import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequests = useRef([]);
    const isMounted = useRef(true);

    const sendRequest = useCallback(
        async (url, method = "GET", body = null, headers = {}) => {
            if (isMounted.current) {
                setIsLoading(true);
            }
            const httpAbortCtrl = new AbortController();
            activeHttpRequests.current.push(httpAbortCtrl);

            try {
                const response = await fetch(url, {
                    method,
                    body,
                    headers,
                    signal: httpAbortCtrl.signal,
                });

                const responseData = await response.json();

                activeHttpRequests.current = activeHttpRequests.current.filter(
                    (reqCtrl) => reqCtrl !== httpAbortCtrl,
                );

                if (!response.ok) {
                    throw new Error(responseData.message);
                }

                if (isMounted.current) {
                    setIsLoading(false);
                }
                return responseData;
            } catch (err) {
                activeHttpRequests.current = activeHttpRequests.current.filter(
                    (reqCtrl) => reqCtrl !== httpAbortCtrl,
                );

                if (isMounted.current) {
                    if (err.name !== "AbortError") {
                        setError(err.message);
                    }
                    setIsLoading(false);
                }

                throw err;
            }
        },
        [],
    );

    const clearError = useCallback(() => {
        if (isMounted.current) {
            setError(null);
        }
    }, []);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            activeHttpRequests.current.forEach((abortCtrl) =>
                abortCtrl.abort(),
            );
        };
    }, []);

    return { isLoading, error, sendRequest, clearError };
};
