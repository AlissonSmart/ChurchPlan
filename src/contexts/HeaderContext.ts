import React from 'react';

export type HeaderContextType = {
  showLargeTitle: boolean;
  setShowLargeTitle: (value: boolean) => void;
};

export const HeaderContext = React.createContext<HeaderContextType>({
  showLargeTitle: true,
  setShowLargeTitle: () => {},
});
