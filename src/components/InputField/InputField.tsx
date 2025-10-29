import type React from 'react';
import './InputField.css'

interface SearchProps{
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: () => void;
}

export default function Search({ query, onQueryChange, onSearch }: SearchProps){
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                className="Search-content-list-section" 
                placeholder="Найти устройство" 
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
            /> 
            <button type = "submit" className= "search-button">🔎</button>
        </form>    
    )
}