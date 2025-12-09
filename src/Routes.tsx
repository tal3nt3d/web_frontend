export const ROUTES = {
  Home: "/",
  Devices: "/devices",
  Device: "/device/:id",
  SignIn: "/signin",
  SignUp: "/signup",
  Profile: "/users/:login/info",
  Application: "/amperage_application/:id",
  Applications: "/amperage_applications",
  Moderator: "/moderator"
}
export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  Home: "Главная",
  Devices: "Устройства",
  Device: "Устройство",
  SignIn: "Вход",
  SignUp: "Регистрация",
  Profile: "Профиль",
  Application: "Заявка",
  Applications: "Мои заявки",
  Moderator: "Модератор" 
};