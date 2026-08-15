from django.db.models.signals import pre_save,post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import Complaint,ComplaintHistory
from django.utils import timezone
@receiver(pre_save,sender=Complaint)
def set_resolved_time(sender,instance,**kwargs):
    if not instance.pk:
        return
    old=Complaint.objects.get(pk=instance.pk)
    if old.status!='Resolved' and instance.status=='Resolved':
        instance.resolved_at=timezone.now()
    if old.status=='Resolved' and instance.status!='Resolved':
        instance.resolved_at=None
@receiver(post_save,sender=Complaint)
def complaint_status_notification(sender,instance,created,**kwargs):
    if created:
        return
    subject=f'Complaint Update:{instance.title}'
    message=(f'Hello {instance.student.username},\n\n'
             f'Your complaint "{instance.title}" has been updated.\n'
             f'Current status:{instance.status}\n\n'
             'Thank you.')
    if instance.student.email:
        send_mail(subject,message,None,[instance.student.email],fail_silently=True,)
@receiver(post_save,sender=Complaint)
def create_history(sender,instance,created,**kwargs):
    ComplaintHistory.objects.create(complaint=instance,
                                    action='Complaint created' if created else f'Complaint updated to{instance.status}',
                              performed_by=instance.student,)