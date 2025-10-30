// interceptor to auto get new access token when old expires
// and when refresh token expires - redirect to login

import useAuthStore from "../../store/authStore";

const api = async (url, options = {}) => {
    const authStore = useAuthStore.getState(); // Get current state outside React component

    // Add authorization header if access token exists
    if (authStore.accessToken && !options.headers?.Authorization) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${authStore.accessToken}`,
        };
    }

    // Default to include cookies
    options.credentials = options.credentials || "include"; 


    let response = await fetch(url, options);

    // If response is 401 Unauthorized and not a login/refresh request itself
    // and if the original request was NOT already a retry request
    if (response.status === 401 && !url.includes('/token/') && !options._isRetry) {
        try {
            console.log("Access token expired. Attempting to refresh...");
            const newAccessToken = await authStore.getNewAccessToken(); // Try to get new token
            console.log("Access token refreshed. Retrying original request...");

            // Retry the original request with the new access token
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${newAccessToken}`,
            };
            // also adding a new isRetry property to the options to keep track of whether this is a retry request to get new token
            // to prevent infinite looping
            options._isRetry = true; // Mark as retry to prevent infinite loops
            response = await fetch(url, options); // Retry the original request

        } catch (error) {
            console.error("Refresh token failed, redirecting to login:", error);
            // If refresh fails, clear state and redirect
            authStore.logout(); // This will clear state and also attempt to delete the refresh cookie
            // We can't navigate directly from here as it's outside a React component.
            // The `ProtectedRoutes` will handle the redirect based on `isAuthenticated: false`.
            throw new Error("Authentication session expired. Please log in again."); // Propagate error
        }
    }

    return response;
};

export default api;