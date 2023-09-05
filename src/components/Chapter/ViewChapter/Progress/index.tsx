import { FC, useContext } from 'react';
import { ProgressBarContext } from '..';
import ProgressHide from './Hide';
import ProgressLightbar from './LightBar';
import ProgressShow from './Show';

interface ProgressProps {}

const Progress: FC<ProgressProps> = ({}) => {
  const { progressBar } = useContext(ProgressBarContext);

  return progressBar === 'SHOW' ? (
    <ProgressShow />
  ) : progressBar === 'HIDE' ? (
    <ProgressHide />
  ) : progressBar === 'LIGHTBAR' ? (
    <ProgressLightbar />
  ) : null;
};

export default Progress;
