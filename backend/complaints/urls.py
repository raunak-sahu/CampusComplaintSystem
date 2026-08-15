from django.urls import path
from .views import (ComplaintCreateView,ComplaintListView,ComplaintDetailView,ComplaintAdminListView,ComplaintAdminDetailView,ComplaintDashboardView,CommentCreateView, CommentListView,AssignedComplaintListView,ComplaintHistoryView)
urlpatterns=[path("",ComplaintCreateView.as_view(),name="create-complaint"),
             path("my/",ComplaintListView.as_view(),name="my-complaints"),
             path("<int:pk>/",ComplaintDetailView.as_view(),name="complaint-detail"),
             path("admin/",ComplaintAdminListView.as_view(),name="admin-list"),
             path("admin/<int:pk>/",ComplaintAdminDetailView.as_view(),name="admin-detail"),
             path("admin/dashboard/",ComplaintDashboardView.as_view(),name="dashboard"),
             path('<int:pk>/comments/',CommentListView.as_view(),name='comment-list'),
             path('<int:pk>/comments/add/',CommentCreateView.as_view(),name='comment-create'),
             path('assigned/',AssignedComplaintListView.as_view(),name='assigned-complaints' ),
             path('<int:pk>/history/',ComplaintHistoryView.as_view(),name='complaint-history'),
]