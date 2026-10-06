# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from rest_framework import serializers


class LabelAnnotationCountSerializer(serializers.Serializer):
    label_id = serializers.IntegerField()
    name = serializers.CharField()
    count = serializers.IntegerField()


class TaskAnnotationCountsSerializer(serializers.Serializer):
    task_id = serializers.IntegerField()
    counts = LabelAnnotationCountSerializer(many=True)
