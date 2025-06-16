import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import DefautLayout from "./layouts/DefautLayout/DefautLayout";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dasshboard/Dasshboard";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Equipment from "./pages/Equipment/Equipment";
import MaintenanceTickets from "./pages/MaintenanceTickets/MaintenanceTickets";
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<DefautLayout />}>
          <Route index element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/maintenance-tickets" element={<MaintenanceTickets />} />
        </Route>
      </Route>
    )
  );

  return (
    <div className="App">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  );
};

export default App;
