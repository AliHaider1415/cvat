# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.response import Response

from cvat.apps.engine.models import Task

from .permissions import AnnotationCountPermission
from .serializers import TaskAnnotationCountsSerializer
from .services import get_annotation_counts_per_label


@extend_schema(tags=["test"])
@extend_schema_view(
    retrieve=extend_schema(
        summary="Get annotation counts per class for a task",
        responses={"200": TaskAnnotationCountsSerializer},
    ),
)
class TaskAnnotationCountsViewSet(viewsets.GenericViewSet):
    queryset = Task.objects.select_related("organization", "project")
    serializer_class = TaskAnnotationCountsSerializer
    iam_permission_class = AnnotationCountPermission
    # Single-task retrieve; org scoping is enforced via TaskPermission.
    iam_supports_organization_params = False
    http_method_names = ["get"]
    search_fields = ()
    filter_fields = ("id",)
    simple_filters = ()
    ordering_fields = ("id",)
    ordering = "id"
    detail = True

    def retrieve(self, request, *args, **kwargs):
        task = self.get_object()
        data = get_annotation_counts_per_label(task)
        serializer = self.get_serializer(data)
        return Response(serializer.data)
