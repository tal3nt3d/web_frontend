import { type Device } from "./devicesApi";
import huaweiImage from '../assets/huawei.jpg';
import phoneImage from '../assets/phone.jpg';
import tefalImage from '../assets/tefal.jpg';
import krupsImage from '../assets/krups.jpg';

export const DEVICES_MOCK: Device[] = [
  {
    device_id: 1,
    photo: huaweiImage,
    title: "Наушники True Wireless HUAWEI",
    description: "Бюджетные наушники с отличным звуком, хит продаж!",
    dev_power: 0.015,
    is_delete: false
  },
  {
    device_id: 2,
    photo: phoneImage,
    title: "Смартфон Xiaomi Redmi Note 14",
    description: "Бюджетная новинка от всеми любимого китайского бренда",
    dev_power: 0.033,
    is_delete: false
  },
  {
    device_id: 3,
    photo: tefalImage,
    title: "Аэрогриль Tefal Easy Fry & Grill Digital",
    description: "Мощный аэрогриль, подойдёт для дачи и дома",
    dev_power: 1.55,
    is_delete: false
  },
  {
    device_id: 4,
    photo: krupsImage,
    title: "Кофемашина автоматическая Krups",
    description: "Кофемашина с интеграцией в умный дом и Алису",
    dev_power: 1.45,
    is_delete: false
  }
]
