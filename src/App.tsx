import { BrowserRouter, Route, Routes } from "react-router-dom";
import DevicesPage from "./pages/DevicesPage/DevicesPage";
import { ROUTES } from "./Routes";
import { HomePage } from "./pages/HomePage/HomePage";
import DevicePage from './pages/DevicePage/DevicePage';
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import 'bootstrap/dist/css/bootstrap.min.css'
import AccountPage from "./pages/AccountPage/AccountPage";
import AmperageApplicationPage from "./pages/AmperageApplicationPage/AmperageApplicationPage";
import AmperageApplicationsPage from "./pages/AmperageApplicationsPage/AmperageApplicationsPage";

function App() {
  return (
    <BrowserRouter basename="/web_frontend">
      <Routes>
        <Route path={ROUTES.Home} element={<HomePage />} />
        <Route path={ROUTES.Devices} element={<DevicesPage />} />
        <Route path={ROUTES.Device} element={<DevicePage />} />  
        <Route path={ROUTES.SignIn} element={<SignInPage />} /> 
        <Route path={ROUTES.SignUp} element={<SignUpPage />} />
        <Route path={ROUTES.Profile} element={<AccountPage />} />
        <Route path={ROUTES.Application} element={<AmperageApplicationPage />} />
        <Route path={ROUTES.Applications} element={<AmperageApplicationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;