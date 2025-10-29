export const ROUTES = {
  HOME: "/",
  Devices: "/devices",
  Device: "/device/:id",
}
export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  Devices: "Устройства",
  Device: "Устройство"
};