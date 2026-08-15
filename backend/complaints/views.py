from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Complaint,ComplaintHistory
from .serializers import ComplaintSerializer, ComplaintAdminSerializer,CommentSerializer,ComplaintHistorySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg,F,ExpressionWrapper,DurationField
# Student - Create Complaint
class ComplaintCreateView(generics.CreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


# Student - View Own Complaints
class ComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(student=self.request.user)


# Student - View / Update / Delete Own Complaint
class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(student=self.request.user)


# Admin - View All Complaints
class ComplaintAdminListView(generics.ListAPIView):
    serializer_class = ComplaintAdminSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
       queryset = Complaint.objects.all().order_by('-created_at')

       status = self.request.query_params.get('status')
       category = self.request.query_params.get('category')
       priority=self.request.query_params.get('priority')
       search = self.request.query_params.get('search')
       ordering = self.request.query_params.get('ordering')

       if status:
           queryset = queryset.filter(status=status)

       if category:
           queryset = queryset.filter(category=category)

       if priority:
           queryset=queryset.filter(priority=priority)
       if search:
           queryset = queryset.filter(title__icontains=search)

       if ordering in ['created_at', '-created_at']:
           queryset = queryset.order_by(ordering)

       return queryset



# Admin - Update Complaint Status
class ComplaintAdminDetailView(generics.RetrieveUpdateAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintAdminSerializer
    permission_classes = [IsAdminUser]

class ComplaintDashboardView(APIView):
    permission_classes=[IsAdminUser]
    def get(self,request):
        today=timezone.now().date()
        resolved_qs=Complaint.objects.filter(
            status='Resolved',resolved_at__isnull=False
        )
        avg_resolution=resolved_qs.annotate(resolution_time=ExpressionWrapper(F('resolved_at')-F('created_at'), output_field=DurationField())).aggregate(avg=Avg('resolution_time'))['avg']
        if avg_resolution:
            avg_resolution_hours=round(avg_resolution.total_seconds()/3600,2)
        else:
            avg_resolution_hours=0
        data = {
        'total': Complaint.objects.count(),
        'pending': Complaint.objects.filter(status='Pending').count(),
        'in_progress': Complaint.objects.filter(status='In Progress').count(),
        'resolved': Complaint.objects.filter(status='Resolved').count(),
        'resolved_today': Complaint.objects.filter(resolved_at__date=today).count(),
        'electrical': Complaint.objects.filter(category='Electrical').count(),
        'water': Complaint.objects.filter(category='Water').count(),
        'hostel': Complaint.objects.filter(category='Hostel').count(),
        'today': Complaint.objects.filter(created_at__date=today).count(),
}

        return Response(data)

class CommentCreateView(generics.CreateAPIView):
    serializer_class=CommentSerializer
    permission_classes=[IsAuthenticated]
    def perform_create(self,serializer):
       complaint=Complaint.objects.get(pk=self.kwargs['pk'])
       serializer.save(user=self.request.user,complaint=complaint)
class CommentListView(generics.ListAPIView):
    serializer_class=CommentSerializer
    permission_classes=[IsAuthenticated]
    def get_queryset(self):
        complaint=Complaint.objects.get(pk=self.kwargs['pk'])
        return complaint.comments.all().order_by('created_at')
class AssignedComplaintListView(generics.ListAPIView):
    serializer_class=ComplaintAdminSerializer
    permission_classes=[IsAuthenticated]
    def get_queryset(self):
        return Complaint.objects.filter(assigned_to=self.request.user).order_by('-created_at')
class ComplaintHistoryView(generics.ListAPIView):
    serializer_class=ComplaintHistorySerializer
    permission_classes=[IsAuthenticated]
    def get_queryset(self):
        complaint=Complaint.objects.get(pk=self.kwargs['pk'])
        return complaint.history.all().order_by('-created_at')

