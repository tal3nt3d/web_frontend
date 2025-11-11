import './Header.css'
import logo from "../../assets/logo.svg"

export default function Header() {
    return (
        <header>
            <nav className = "navbar">
                <a href = "/web_frontend"><img src = {logo} alt = "logo" /></a>    
            </nav>
        </header>
    )
}