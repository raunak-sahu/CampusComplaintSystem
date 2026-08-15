from django.db import models
from django.conf import settings
class Complaint(models.Model):
    class Category(models.TextChoices):
        ELECTRICAL="Electrical","Electrical"
        WATER="Water","Water"
        HOSTEL="Hostel","Hostel"
        INTERNET="Internet","Internet"
        MESS="Mess","Mess"
        CLEANING="Cleaning","Cleaning"
        OTHER="Other","Other"
    class Status(models.TextChoices):
        PENDING="Pending","Pending"
        IN_PROGRESS="In Progress","In Progress"
        RESOLVED="Resolved","Resolved"
    title=models.CharField(max_length=200)
    description=models.TextField()
    category=models.CharField(max_length=100)
    image=models.ImageField(upload_to="complaints/",blank=True,null=True)
    status=models.CharField(max_length=20,choices=Status.choices,default=Status.PENDING,)
    class Priority(models.TextChoices):
      LOW='Low','Low'
      MEDIUM='Medium','Medium'
      HIGH='High','High'
      URGENT='Urgent','Urgent'
    priority=models.CharField(max_length=20,choices=Priority.choices,default=Priority.MEDIUM,)
    created_at=models.DateTimeField(auto_now_add=True)
    resolved_at=models.DateTimeField(blank=True,null=True)
    student=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="complaints",)
    assigned_to=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='assigned_complaints')
    def __str__(self):
        return self.title
class Comment(models.Model):
        complaint=models.ForeignKey(Complaint,on_delete=models.CASCADE,related_name='comments')
        user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
        message=models.TextField()
        attachment=models.FileField(upload_to='comment_attachments/',blank=True,null=True)
        created_at=models.DateTimeField(auto_now_add=True)
        def __str__(self):
            return f'{self.user.username}-{self.complaint.title}'
class ComplaintHistory(models.Model):
     complaint=models.ForeignKey(Complaint,on_delete=models.CASCADE,related_name='history')
     action=models.CharField(max_length=200)
     performed_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
     created_at=models.DateTimeField(auto_now_add=True)
     def __str__(self):
          return f'{self.complaint.title}-{self.action}'
# Create your models here.
