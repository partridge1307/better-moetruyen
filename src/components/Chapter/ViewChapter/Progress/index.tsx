import { FC, useContext } from 'react';
import { ProgressBarContext } from '..';
import ProgressShow from './Show';
import ProgressHide from './Hide';
import ProgressLightbar from './LightBar';

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
