import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { StockItem, User } from '../types';

interface HeaderProps {
    user: User | null;
    stockItems: StockItem[];
    onUpdateAvatar: (file: File) => Promise<void>;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, stockItems, onUpdateAvatar, onToggleSidebar }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const itemsAbaixoMinimoCount = stockItems.filter(i => i.system_stock <= i.min_stock).length;

    const handleAvatarClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };
    
    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                await onUpdateAvatar(file);
            } catch (error) {
                console.error("Failed to upload avatar:", error);
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };
    
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="flex items-center justify-between h-16 bg-white px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
                 <button onClick={onToggleSidebar} className="text-gray-500 mr-4 focus:outline-none md:hidden">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* Search or other elements can be placed here if needed */}
            </div>

            <div className="flex items-center space-x-6">
                <Link to="/estoque/atual?filtro=abaixo-minimo" className="relative text-gray-500 hover:text-gray-700 transition-colors duration-200" title="Itens com estoque baixo">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {itemsAbaixoMinimoCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                            {itemsAbaixoMinimoCount}
                        </span>
                    )}
                </Link>

                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                        <div className="relative">
                            <img 
                                src={user?.avatar_url || ''} 
                                alt={user?.name || 'Avatar do usuário'} 
                                className="w-9 h-9 rounded-full cursor-pointer hover:opacity-80 transition-opacity" 
                                onClick={handleAvatarClick}
                                title="Clique para alterar a foto"
                            />
                             {isUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/png, image/jpeg" />
                        
                        <div className="hidden md:block text-left">
                           <span className="text-sm font-medium text-gray-800">{user?.name}</span>
                           <p className="text-xs text-gray-500">{user?.profile}</p>
                        </div>

                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 hidden md:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                         <div
                            className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                         >
                            <div className="py-1" role="none">
                                <div className="px-4 py-2 border-b">
                                    <p className="text-sm font-semibold text-gray-900" role="none">{user?.name}</p>
                                    <p className="text-sm text-gray-500 truncate" role="none">{user?.email}</p>
                                </div>
                                <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">
                                    Meu Perfil
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

// Fix: Add default export to make the component available for import in other modules.
export default Header;