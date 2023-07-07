'use client';

import { View } from '@/lib/query';
import { filterView } from '@/lib/utils';
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { FC } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

export const opts = {
  responsive: true,
};

const labels = ['1d', '3d', '5d', '7d'];

interface WeeklyViewMangaProps {
  weeklyView: View;
}
const WeeklyViewManga: FC<WeeklyViewMangaProps> = ({ weeklyView }) => {
  const filteredView = filterView({
    target: weeklyView,
    timeRange: [1, 3, 5, 7],
    currentTime: new Date(Date.now()).getHours(),
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Lượt xem',
        data: filteredView,
        pointRadius: 5,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-2 md:space-y-4">
      <p className="text-sm font-medium">Thống kê View trong tuần</p>
      <Line
        options={opts}
        data={data}
        fallbackContent={<p>Thống kê View trong tuần không thể hiển thị</p>}
      />
    </div>
  );
};

export default WeeklyViewManga;
