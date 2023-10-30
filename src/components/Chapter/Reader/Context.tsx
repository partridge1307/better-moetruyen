import type { DirectionType } from '@/hooks/use-direction-reader';
import type { LayoutType } from '@/hooks/use-layout-reader';
import { ContinuousType } from '@/hooks/use-nav-chapter';
import { Dispatch, FC, SetStateAction, createContext } from 'react';

interface ContextProps {
  children: React.ReactNode;
  menuConfig: [boolean, Dispatch<SetStateAction<boolean>>];
  commentConfig: [boolean, Dispatch<SetStateAction<boolean>>];
  infoConfig: [boolean, Dispatch<SetStateAction<boolean>>];
  layoutConfig: { layout: LayoutType; setLayout: (type: LayoutType) => void };
  directionConfig: {
    direction: DirectionType;
    setDirection: (type: DirectionType) => void;
  };
  continuousConfig: {
    isEnabled: ContinuousType;
    setContinuous: (state: ContinuousType) => void;
  };
}

export const MenuToggleContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => {}]);
export const CommentToggleContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => {}]);
export const InfoToggleContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => {}]);
export const LayoutContext = createContext<{
  layout: LayoutType;
  setLayout: (type: LayoutType) => void;
}>({ layout: 'VERTICAL', setLayout: () => {} });
export const DirectionContext = createContext<{
  direction: DirectionType;
  setDirection: (type: DirectionType) => void;
}>({ direction: 'ltr', setDirection: () => {} });
export const ContinuousContext = createContext<{
  isEnabled: ContinuousType;
  setContinuous: (state: ContinuousType) => void;
}>({ isEnabled: 'true', setContinuous: () => {} });

const Context: FC<ContextProps> = ({
  children,
  menuConfig,
  commentConfig,
  infoConfig,
  layoutConfig,
  directionConfig,
  continuousConfig,
}) => {
  return (
    <MenuToggleContext.Provider value={menuConfig}>
      <CommentToggleContext.Provider value={commentConfig}>
        <InfoToggleContext.Provider value={infoConfig}>
          <LayoutContext.Provider value={layoutConfig}>
            <DirectionContext.Provider value={directionConfig}>
              <ContinuousContext.Provider value={continuousConfig}>
                {children}
              </ContinuousContext.Provider>
            </DirectionContext.Provider>
          </LayoutContext.Provider>
        </InfoToggleContext.Provider>
      </CommentToggleContext.Provider>
    </MenuToggleContext.Provider>
  );
};

export default Context;
