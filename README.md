# Auth Setup
- Here this contains the entire setup for auth using JWT
- The auth store also contains functions for generating new access token when old one expires (for auto generating new token)
- Also contains an api wrapper which it used as interceptor - if valid access token present, makes request, else uses the generate new access token from store to get new access token seamlessly
- Also CORS are setted up in django.
- As CORS are already setted up but vite also contains a forward proxy for making cross site request
- The access token is stored in the store / in-memory and the refresh token as an http only cookie