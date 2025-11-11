import './CartButton.css';
import wrench from "../../assets/wrench.svg"

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  return (
    <button 
      className="cart-button"
      onClick={onClick}
    >
      <img 
        src={wrench} 
        alt="Корзина" 
      />
    </button>
  );
}