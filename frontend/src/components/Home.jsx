import React from 'react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Import your new api wrapper

const Home = () => {
  // Home component now *assumes* it's rendered only if isAuthenticated is true
  // and `user` object is available, thanks to ProtectedRoutes.
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout); // Also need logout here
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect after successful logout
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, for security, assume user is logged out and redirect
      navigate('/login');
    }
  };


  const handleClick = async () => {
    try{

    const url = `/auth/temp/` // Use proxy path if configured
    const response = await api(url, {
      method: "GET",
      headers: {
        'Content-Type' : 'application/json',
        // api wrapper auto adds access token
        // 'Authorization' : `Bearer ${accessToken}`
      },
      // api wrapper auto adds cookies
      // credentials: "include" // 'include' is needed to send cookies
    })
    if(response.ok){
      const data = await response.json()
      console.log(data)
    } else {
      console.error("Authenticated call failed:", response.status);
      // Handle potential 401 if access token expired and refresh failed
      // For instance, you could trigger a re-authentication flow or simply redirect to login
      if (response.status === 401) {
          navigate('/login');
      }
    }
    }
    catch(error){
      console.error("Error making authenticated API call:", error);
    }

  }

  // Defensive check is still a good practice, even if ProtectedRoutes handles most cases
  // It protects against race conditions or unexpected state changes.
  if (!user) {
      return <div>Loading user data...</div>; // Or redirect, though ProtectedRoutes should prevent this usually
  }


  return (
    <div>
      {/* Access user properties directly after the defensive check */}
      <h1>Welcome Home : {user.user_name} {user.user_id}</h1>
      <button onClick={handleClick}>Click Me</button>
      <button onClick={handleLogout}>Logout</button> {/* Add a logout button */}
    </div>
  )
}

export default Home;