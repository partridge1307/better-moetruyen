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

// Menu context
export const MenuToggleValueContext = createContext<boolean>(false);
export const MenuToggleDispatchContext = createContext<
  Dispatch<SetStateAction<boolean>>
>(() => {});
// Comment context
export const CommentToggleValueContext = createContext<boolean>(false);
export const CommentToggleDispatchContext = createContext<
  Dispatch<SetStateAction<boolean>>
>(() => {});
// Info context
export const InfoToggleValueContext = createContext<boolean>(false);
export const InfoToggleDispatchContext = createContext<
  Dispatch<SetStateAction<boolean>>
>(() => {});
// Layout context
export const LayoutValueContext = createContext<LayoutType>('VERTICAL');
export const LayoutDispatchContext = createContext<(type: LayoutType) => void>(
  () => {}
);
// Direction context
export const DirectionValueContext = createContext<DirectionType>('ltr');
export const DirectionDispatchContext = createContext<
  (type: DirectionType) => void
>(() => {});
// Continuous context
export const ContinuousValueContext = createContext<ContinuousType>('true');
export const ContinuousDispatchContext = createContext<
  (state: ContinuousType) => void
>(() => {});

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
    // Menu Provider
    <MenuToggleValueContext.Provider value={menuConfig[0]}>
      <MenuToggleDispatchContext.Provider value={menuConfig[1]}>
        {/* Comment Provider */}
        <CommentToggleValueContext.Provider value={commentConfig[0]}>
          <CommentToggleDispatchContext.Provider value={commentConfig[1]}>
            {/* Info Provider */}
            <InfoToggleValueContext.Provider value={infoConfig[0]}>
              <InfoToggleDispatchContext.Provider value={infoConfig[1]}>
                {/* Layout Provider */}
                <LayoutValueContext.Provider value={layoutConfig.layout}>
                  <LayoutDispatchContext.Provider
                    value={layoutConfig.setLayout}
                  >
                    {/* Direction Provider */}
                    <DirectionValueContext.Provider
                      value={directionConfig.direction}
                    >
                      <DirectionDispatchContext.Provider
                        value={directionConfig.setDirection}
                      >
                        {/* Continuous Provider */}
                        <ContinuousValueContext.Provider
                          value={continuousConfig.isEnabled}
                        >
                          <ContinuousDispatchContext.Provider
                            value={continuousConfig.setContinuous}
                          >
                            {children}
                          </ContinuousDispatchContext.Provider>
                        </ContinuousValueContext.Provider>
                      </DirectionDispatchContext.Provider>
                    </DirectionValueContext.Provider>
                  </LayoutDispatchContext.Provider>
                </LayoutValueContext.Provider>
              </InfoToggleDispatchContext.Provider>
            </InfoToggleValueContext.Provider>
          </CommentToggleDispatchContext.Provider>
        </CommentToggleValueContext.Provider>
      </MenuToggleDispatchContext.Provider>
    </MenuToggleValueContext.Provider>
  );
};

export default Context;
