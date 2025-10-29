from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .serializers import MyTokenObtainPairSerializer, MyUserRegistrationSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny


class MyUserRegistrationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = MyUserRegistrationSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            # serializer.is_valid()
        except Exception as e:
            print(e)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data 
        
        # create response
        response = Response({
            "access_token": data["access_token"],
            "user": data["user"]
        }, status=status.HTTP_200_OK)

        # set refresh token as HttpOnly, Secure Cookie
        response.set_cookie(
            key='refresh_token',
            value=data['refresh_token'],
            httponly=True,
            secure=False, # when send to True, sent only over HTTPS
            samesite="Strict", # helps prevent CSRF (use 'Lax' if cross-domain)
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/",  # accessible throughout domain
        )
        print(response)

        return response


# custom refresh token view
class MyTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        
        # if no token return error
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # try to get new access token and send it
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            return Response({"access_token": access_token}, status=status.HTTP_200_OK)
            # getting error 
        except Exception as e:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        

# delete the cookie when the user logout
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie("refresh_token")
        return response