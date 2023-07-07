'use client';

import { View } from '@/lib/query';
import { FC } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { filterView } from '@/lib/utils';

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
const labels = ['1h', '3h', '6h', '12h', '22h'];

interface DailyViewMangaProps {
  dailyView: View;
}
const DailyViewManga: FC<DailyViewMangaProps> = ({ dailyView }) => {
  const filteredView = filterView({
    target: dailyView,
    timeRange: [1, 3, 6, 12, 22],
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
      <p className="text-sm font-medium">Thống kê View trong ngày</p>
      <Line
        options={opts}
        data={data}
        fallbackContent={<p>Thống kê View trong ngày không thể hiển thị</p>}
      />
    </div>
  );
};

export default DailyViewManga;
