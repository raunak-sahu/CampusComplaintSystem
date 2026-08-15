from rest_framework import serializers
from .models import Complaint,Comment,ComplaintHistory
class CommentSerializer(serializers.ModelSerializer):
    user=serializers.StringRelatedField(read_only=True)
    class Meta:
        model=Comment
        fields=['id','user','message','attachment','created_at']
        read_only_fields=['user','created_at']
class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model=Complaint
        fields="__all__"
        read_only_fields=["student","status","created_at"]
from accounts.models import User

class ComplaintAdminSerializer(serializers.ModelSerializer):
    student = serializers.CharField(source='student.username', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(
    queryset=User.objects.filter(is_staff=True),
    required=False,
    allow_null=True,
    )
    class Meta:
      model = Complaint
      fields = '__all__'

class ComplaintHistorySerializer(serializers.ModelSerializer):
    performed_by=serializers.StringRelatedField()
    class Meta:
        model=ComplaintHistory
        fields=['id','action','performed_by','created_at']


