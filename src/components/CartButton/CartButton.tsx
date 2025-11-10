import './CartButton.css';

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
        src="/src/assets/wrench.svg" 
        alt="Корзина" 
      />
    </button>
  );
}