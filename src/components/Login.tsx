import React, { useState } from 'react';
import { Card, Label, TextInput, Button, Alert } from 'flowbite-react';
import { HiMail, HiLockClosed } from 'react-icons/hi';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Logowanie
            </h2>
            {error && (
              <Alert color="failure" className="mb-4">
                {error}
              </Alert>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" value="Email" />
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiMail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" value="Hasło" />
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiLockClosed className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          
          <Button type="submit" isProcessing={loading}>
            Zaloguj się
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login; 