import './CartButton.css';
import wrench from "../../assets/wrench.svg"
import type { ReactNode } from 'react';

interface CartButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children?: ReactNode; 
}

export default function CartButton({ onClick, children }: CartButtonProps) {
  return (
    <button 
      className="cart-button"
      onClick={onClick}
    >
      <img 
        src={wrench} 
        alt="Корзина" 
      />
      {children}
    </button>
  );
}