import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import FengShuiPage from './pages/FengShuiPage.tsx';
import PsychologyPage from './pages/PsychologyPage.tsx';
import EnergyPage from './pages/EnergyPage.tsx';
import LightingPage from './pages/LightingPage.tsx';
import PaymentSuccessPage from './pages/SuccessPage.tsx';
import CancelPage from './pages/CancelPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/fengshui',
    element: <FengShuiPage />,
  },
  {
    path: '/psychology',
    element: <PsychologyPage />,
  },
  {
    path: '/energy',
    element: <EnergyPage />,
  },
  {
    path: '/lighting',
    element: <LightingPage />,
  },
  {
    path: '/report',
    element: <App />,
  },
  {
    path: '/success',
    element: <PaymentSuccessPage />,
  },
  {
    path: '/cancel',
    element: <CancelPage />,
  },
]);

export default router;