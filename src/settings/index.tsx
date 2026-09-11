import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Settings } from './Settings';

const root = document.getElementById('root');
if (root) createRoot(root).render(<FluentProvider theme={webLightTheme}><Settings /></FluentProvider>);
