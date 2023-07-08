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

const opts = {
  responsive: true,
};
const labels = ['0h', '1h', '3h', '6h', '12h', '22h'];

interface DailyViewMangaProps {
  filteredView: number[];
}
const DailyViewManga: FC<DailyViewMangaProps> = ({ filteredView }) => {
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
      <p className="text-sm font-medium">Thống kê View trong ngày</p>
      <Line
        options={opts}
        data={data}
        fallbackContent={<p>Thống kê View trong ngày không thể hiển thị</p>}
      />
    </div>
  );
};

export default memo(DailyViewManga);
