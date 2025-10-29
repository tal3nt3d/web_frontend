import './HomePage.css'; 
import { type FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { Button } from "react-bootstrap";

export const HomePage: FC = () => {
  return (
    <>
      <Header />
      <BreadCrumbs
        crumbs={[]}
      />
      <div className="home-banner">
        <div className="banner-content">
          <h1>EleCalc</h1>
          <p>
            Добро пожаловать в EleCalc! Здесь вы можете посчитать нагрузку устройств на сеть.
          </p>
          <Link to={ROUTES.Devices}>
            <Button variant="primary">Просмотреть устройства</Button>
          </Link>
        </div>
      </div>
    </>
  );
};