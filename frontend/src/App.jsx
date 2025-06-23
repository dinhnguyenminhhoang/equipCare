import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DefautLayout from "./layouts/DefautLayout/DefautLayout";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Dashboard from "./pages/Dasshboard/Dasshboard";
import Equipment from "./pages/Equipment/Equipment";
import MaintenanceLevels from "./pages/MaintenanceLevels/MaintenanceLevels";
import MaintenanceTickets from "./pages/MaintenanceTickets/MaintenanceTickets";
import Materials from "./pages/Materials/Materials";
import RepairTickets from "./pages/RepairTickets/RepairTickets";
import Users from "./pages/Users/Users";
import Profile from "./pages/Auth/Profile/Profile";
import ConfiirmAccount from "./pages/Auth/ConfiirmAccount/ConfiirmAccount";
import Home from "./pages/Home/Home";
import History from "./pages/History/History";
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route index element={<Home />} />
        <Route path="/confirm-account/:token" element={<ConfiirmAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history" element={<History />} />
        <Route element={<DefautLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/maintenance-tickets" element={<MaintenanceTickets />} />
          <Route path="/maintenance-levels" element={<MaintenanceLevels />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/repair-tickets" element={<RepairTickets />} />
          <Route path="/users" element={<Users />} />
          <Route path="/Profile" element={<Profile />} />
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
