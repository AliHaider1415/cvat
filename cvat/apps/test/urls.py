# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.urls import path

from .views import TaskAnnotationCountsViewSet

urlpatterns = [
    path(
        "tasks/<int:pk>/annotation-counts",
        TaskAnnotationCountsViewSet.as_view({"get": "retrieve"}, detail=True),
        name="task-annotation-counts",
    ),
]
