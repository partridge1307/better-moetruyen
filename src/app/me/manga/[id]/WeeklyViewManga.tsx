'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { FC, memo } from 'react';
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

const labels = ['0d', '1d', '3d', '5d', '7d'];

interface WeeklyViewMangaProps {
  filteredView: number[];
}
const WeeklyViewManga: FC<WeeklyViewMangaProps> = ({ filteredView }) => {
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

export default memo(WeeklyViewManga);
