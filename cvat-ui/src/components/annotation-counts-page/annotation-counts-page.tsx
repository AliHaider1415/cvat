// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import notification from 'antd/lib/notification';

import { getCore, Task } from 'cvat-core-wrapper';
import GoBackButton from 'components/common/go-back-button';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import ResourceLink from 'components/common/resource-link';
import AnnotationCountsChart, { LabelAnnotationCount } from './annotation-counts-chart';

const core = getCore();

interface AnnotationCountsResponse {
    task_id: number;
    counts: LabelAnnotationCount[];
}

function AnnotationCountsPage(): JSX.Element {
    const { tid } = useParams<{ tid: string }>();
    const taskId = Number.parseInt(tid, 10);

    const [task, setTask] = useState<Task | null>(null);
    const [counts, setCounts] = useState<LabelAnnotationCount[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!Number.isInteger(taskId)) {
            notification.error({
                message: 'Invalid task id',
            });
            setFetching(false);
            return;
        }

        let cancelled = false;
        setFetching(true);

        Promise.all([
            core.tasks.get({ id: taskId }),
            core.server.request(`/api/tasks/${taskId}/annotation-counts`, { method: 'GET' }),
        ])
            .then(([tasks, response]) => {
                if (cancelled) {
                    return;
                }

                const loadedTask = Array.isArray(tasks) ? tasks[0] : null;
                if (!loadedTask) {
                    throw new Error(`Task #${taskId} was not found`);
                }

                const payload = (response?.data ?? response) as AnnotationCountsResponse;
                setTask(loadedTask);
                setCounts(Array.isArray(payload?.counts) ? payload.counts : []);
            })
            .catch((error: unknown) => {
                if (cancelled) {
                    return;
                }

                notification.error({
                    message: 'Could not load annotation counts',
                    description: error instanceof Error ? error.message : '',
                });
                setTask(null);
                setCounts([]);
            })
            .finally(() => {
                if (!cancelled) {
                    setFetching(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [taskId]);

    const sortedCounts = useMemo(
        () => [...counts].sort((a, b) => b.count - a.count),
        [counts],
    );

    return (
        <div className='cvat-annotation-counts-page'>
            <div className='cvat-annotation-counts-wrapper'>
                <Row justify='center'>
                    <Col span={22} xl={20} xxl={18} className='cvat-task-top-bar'>
                        <GoBackButton />
                    </Col>
                </Row>
                <Row justify='center' className='cvat-annotation-counts-inner-wrapper'>
                    <Col span={22} xl={20} xxl={18} className='cvat-annotation-counts-inner'>
                        <Row justify='space-between' align='middle'>
                            <Col className='cvat-annotation-counts-header'>
                                <Title level={4} className='cvat-text-color'>
                                    {'Annotation counts for '}
                                    {task ? <ResourceLink resource={task} /> : (
                                        <Text>{`Task #${taskId}`}</Text>
                                    )}
                                </Title>
                            </Col>
                        </Row>
                        {fetching && <CVATLoadingSpinner />}
                        {!fetching && task && (
                            <AnnotationCountsChart counts={sortedCounts} />
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default React.memo(AnnotationCountsPage);
