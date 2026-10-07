 
import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';

// Created once, outside the component: the same reasoning as NAV_ITEMS
const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/game", element: <Game /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
