from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser

from .models import User
from .serializers import RegisterSerializer,UserSerializer
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
       return Response({
         'id': request.user.id,
         'username': request.user.username,
         'is_staff': request.user.is_staff,
          'is_superuser': request.user.is_superuser,
        })
class StaffListView(generics.ListAPIView):
     serializer_class = UserSerializer
     permission_classes = [IsAdminUser]

     def get_queryset(self):
         return User.objects.filter(is_staff=True)
