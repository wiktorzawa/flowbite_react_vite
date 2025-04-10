import { useState, useEffect } from 'react';
import { DarkThemeToggle, Navbar, Dropdown, NavbarBrand, DropdownItem } from "flowbite-react";
import Login from './components/Login';
import { authService, User } from './services/authService';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-800">
      <Navbar fluid rounded>
        <NavbarBrand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            System Zarządzania Dostawami
          </span>
        </NavbarBrand>
        <div className="flex md:order-2">
          <Dropdown
            label={
              <span className="text-white">
                {user.email} ({user.role})
              </span>
            }
            inline
          >
            <DropdownItem onClick={handleLogout}>
              Wyloguj się
            </DropdownItem>
          </Dropdown>
          <DarkThemeToggle />
        </div>
      </Navbar>

      <main className="container mx-auto p-4">
        {user.role === 'admin' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">
              Panel Administratora
            </h1>
            {/* Tutaj dodaj komponenty dla administratora */}
          </div>
        )}

        {user.role === 'staff' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">
              Panel Pracownika
            </h1>
            {/* Tutaj dodaj komponenty dla pracownika */}
          </div>
        )}

        {user.role === 'supplier' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">
              Panel Dostawcy
            </h1>
            {/* Tutaj dodaj komponenty dla dostawcy */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 