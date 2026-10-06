# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from enum import StrEnum
from typing import Any

from cvat.apps.engine.models import Task
from cvat.apps.engine.permissions import TaskPermission
from cvat.apps.engine.types import ExtendedRequest
from cvat.apps.iam.permissions import OpenPolicyAgentPermission, get_iam_context


class AnnotationCountPermission(OpenPolicyAgentPermission):
    """Delegates authorization to TaskPermission.VIEW_ANNOTATIONS."""

    class Scopes(StrEnum):
        VIEW = "view"

    @classmethod
    def create(
        cls,
        request: ExtendedRequest,
        view,
        obj: Task | None,
        iam_context: dict[str, Any] | None,
    ) -> list[OpenPolicyAgentPermission]:
        permissions: list[OpenPolicyAgentPermission] = []
        for scope in cls.get_scopes(request, view, obj):
            if scope == cls.Scopes.VIEW and obj is not None:
                if not iam_context and request:
                    iam_context = get_iam_context(request, obj)
                permissions.append(
                    TaskPermission.create_base_perm(
                        request,
                        view,
                        TaskPermission.Scopes.VIEW_ANNOTATIONS,
                        iam_context,
                        obj=obj,
                    )
                )
        return permissions

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Never used for OPA calls; create() only returns TaskPermission instances.
        self.url = ""

    @classmethod
    def _get_scopes(cls, request: ExtendedRequest, view, obj):
        return {
            ("retrieve", "GET"): [cls.Scopes.VIEW],
        }[(view.action, request.method)]

    def get_resource(self):
        return None
