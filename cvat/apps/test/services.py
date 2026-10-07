# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from collections import defaultdict

from django.db.models import Count

from cvat.apps.engine.models import (
    Label,
    LabeledImage,
    LabeledInterval,
    LabeledShape,
    LabeledTrack,
    Task,
)


def _counts_by_label(queryset) -> dict[int, int]:
    rows = queryset.values("label_id").annotate(count=Count("id"))
    return {row["label_id"]: row["count"] for row in rows}


def get_annotation_counts_per_label(task: Task) -> dict:
    """
    Aggregate annotation counts per top-level label for a task.

    Includes root shapes, tracks, intervals, and tags. Labels with no
    annotations are returned with count 0.
    """
    task_id = task.id
    job_filter = {"job__segment__task_id": task_id}

    totals: dict[int, int] = defaultdict(int)

    for label_id, count in _counts_by_label(
        LabeledShape.objects.filter(parent__isnull=True, **job_filter)
    ).items():
        totals[label_id] += count

    for label_id, count in _counts_by_label(LabeledTrack.objects.filter(**job_filter)).items():
        totals[label_id] += count

    for label_id, count in _counts_by_label(LabeledInterval.objects.filter(**job_filter)).items():
        totals[label_id] += count

    for label_id, count in _counts_by_label(LabeledImage.objects.filter(**job_filter)).items():
        totals[label_id] += count

    labels: list[Label] = list(task.get_labels())
    counts = [
        {
            "label_id": label.id,
            "name": label.name,
            "count": totals.get(label.id, 0),
        }
        for label in labels
    ]

    return {
        "task_id": task_id,
        "counts": counts,
    }
