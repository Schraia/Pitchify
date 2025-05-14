import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MainPage from "./pages/MainPage"; 
import PitchResults from "./pages/PitchResults";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/main", element: <MainPage /> },
  { path: "/results", element: <PitchResults /> },
]);

export default router;
