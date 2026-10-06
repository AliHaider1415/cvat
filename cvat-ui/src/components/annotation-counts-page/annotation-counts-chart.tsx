// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Empty from 'antd/lib/empty';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface LabelAnnotationCount {
    label_id: number;
    name: string;
    count: number;
}

interface Props {
    counts: LabelAnnotationCount[];
}

function AnnotationCountsChart(props: Readonly<Props>): JSX.Element {
    const { counts } = props;

    const chartData = useMemo(() => ({
        labels: counts.map((item) => item.name),
        datasets: [
            {
                label: 'Annotations',
                data: counts.map((item) => item.count),
                backgroundColor: 'rgba(24, 144, 255, 0.65)',
                borderColor: 'rgba(24, 144, 255, 1)',
                borderWidth: 1,
            },
        ],
    }), [counts]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Annotations per class',
            },
            tooltip: {
                callbacks: {
                    afterLabel(context: { dataIndex: number }): string {
                        const item = counts[context.dataIndex];
                        return item ? `label_id: ${item.label_id}` : '';
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 90,
                    minRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 40,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    }), [counts]);

    if (!counts.length) {
        return (
            <div className='cvat-annotation-counts-chart-empty'>
                <Empty description='No labels found for this task' />
            </div>
        );
    }

    return (
        <div className='cvat-annotation-counts-chart'>
            <Bar data={chartData} options={options as any} />
        </div>
    );
}

export default React.memo(AnnotationCountsChart);
