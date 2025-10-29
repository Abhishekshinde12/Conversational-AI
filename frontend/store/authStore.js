import {create} from 'zustand'


const useAuthStore = create((set) => ({

    // auth details
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,


    register: async ({first_name, last_name, email, password}) => {
        try{

            const url = `http://localhost:8000/auth/user_register/`
            const response = await fetch(url, {
                method: "POST",
                headers: {'Content-type':'application/json'},
                body: JSON.stringify({first_name, last_name, email, password})
            })
            if(!response.ok) throw new Error("Registration Failed")
            return response
        }
        catch(error){
            console.log(error)
            throw error
        }
    },

    login: async({email, password}) => {
        try{
            const url = `http://localhost:8000/auth/token/`
            const response = await fetch(url, {
                method: "POST",
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({email, password})
                // credentials: "include"
            })

            if(!response.ok){
                const errorData = await response.json(); // Attempt to parse error message
                throw new Error(errorData.detail || "Login Failed")
            } 
            
            const data = await response.json()
            set({
                user: data.user,
                accessToken: data.access_token,
                isAuthenticated: true
            })

            // return true
            return response
        }
        catch(error){
            console.log(error)
            throw error 
        }
    },

    getNewAccessToken: async () => {
        try{
            const url = `http://localhost:8000/auth/token/refresh/`
            const response = await fetch(url, {
                method: "POST",
                headers: {'Content-Type' : 'application/json'},
                credentials: "include", // tells browser to include cookies, auth headers, etc.
            });
            
            const data = await response.json()
            if(!response.ok){
                throw new Error("Failed refreshing token")
            }

            set({accessToken: data.access_token});
            return response 
        }
        catch(error){
            console.error("Error refreshing token:", error);
                        // Clear auth state on refresh failure
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            });
            throw error
        }
    },

    logout: async () => {
        try{

            const url = `http://localhost:8000/auth/logout/`
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: "include",
            })

            if(!response.ok){
                throw new Error("")
            }
            
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            });
            
            return response
        }
        catch(error){
            console.error("Error in loggint out : ", error);
            // Clear state anyway on error
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            });
            throw error
        }
    },
}))


export default useAuthStore