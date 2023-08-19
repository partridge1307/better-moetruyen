'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/AlertDialog';
import { FC } from 'react';

interface VerifyDialogProps {
  Verify: () => void;
  isVerifing: boolean;
}

const VerifyDialog: FC<VerifyDialogProps> = ({ Verify, isVerifing }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isVerifing}
        id="verify-button"
        className="hidden"
      >
        VerifyButton
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn đã chắc chắn muốn Verify hay chưa?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={() => Verify()}>
            Chắc chắn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VerifyDialog;
