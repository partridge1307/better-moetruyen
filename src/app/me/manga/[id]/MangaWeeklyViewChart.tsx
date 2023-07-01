'use client';

import { View } from '@prisma/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
} from 'chart.js';
import { FC } from 'react';
import { Line } from 'react-chartjs-2';

interface MangaDailyViewChartProps {
  view: View;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

const labels = ['7d', '5d', '3d', '1d'];

const MangaWeeklyViewChart: FC<MangaDailyViewChartProps> = ({ view }) => {
  // const data = {
  //   labels,
  //   datasets: [
  //     {
  //       label: 'View ngày',
  //       data: view.viewHistory,
  //       borderColor: 'rgb(255, 99, 132)',
  //       backgroundColor: 'rgba(255, 99, 132, 1)',
  //     },
  //   ],
  // };

  // <Line options={options} data={} />
  return <div></div>;
};

export default MangaWeeklyViewChart;
