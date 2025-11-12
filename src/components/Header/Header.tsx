import { type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/logo.svg'

export default function Header() {
    const handleBurgerClick = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.classList.toggle('active');
  };

  const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <header className="header">
      <div className="header__wrapper">
        <div className="header__logo">
          <NavLink to="/" className="header__logo-link">
            <img src = {logo}></img>
          </NavLink>
        </div>

        <nav className="header__nav">
          <NavLink to="/" className="header__link">
            Главная
          </NavLink>
          <NavLink to="/devices" className="header__link">
            Устройства
          </NavLink>
          {/* <NavLink to="/orders" className="header__link">
            Заказы
          </NavLink>
          <NavLink to="/about" className="header__link">
            О магазине
          </NavLink>
          <NavLink to="/cart" className="header__link header__link--cart">
            Корзина
          </NavLink> */}
        </nav>

        <div className="header__mobile-wrapper" onClick={handleBurgerClick}>
          <div className="header__mobile-target" />
          <div className="header__mobile-menu" onClick={handleMenuClick}>
            <NavLink to="/" className="header__link">
              Главная
            </NavLink>
            <NavLink to="/devices" className="header__link">
              Устройства
            </NavLink>
            {/* <NavLink to="/orders" className="header__link">
              Заказы
            </NavLink>
            <NavLink to="/about" className="header__link">
              О магазине
            </NavLink>
            <NavLink to="/cart" className="header__link header__link--cart">
              Корзина
            </NavLink> */}
          </div>
        </div>
      </div>
    </header>
  );
};