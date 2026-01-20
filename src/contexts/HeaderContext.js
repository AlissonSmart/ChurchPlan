import React, { createContext, useState } from 'react';

// Contexto para gerenciar o estado do cabeçalho
export const HeaderContext = createContext({
  showLargeTitle: true,
  setShowLargeTitle: () => {},
});
