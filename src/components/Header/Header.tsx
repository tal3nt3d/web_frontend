import { Link } from 'react-router-dom';
import './Header.css'
import logo from "../../assets/logo.svg"

export default function Header() {
    return (
        <header>
            <nav className = "navbar">
                <Link to = "/"><img src = {logo} alt = "logo" /></Link>    
            </nav>
        </header>
    )
}