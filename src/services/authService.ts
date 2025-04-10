import { rdsService } from './awsService';

export interface User {
  id_login: string;
  related_id: string;
  email: string;
  role: 'admin' | 'staff' | 'supplier';
  last_login: string | null;
}

class AuthService {
  private currentUser: User | null = null;

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      console.log('Weryfikacja hasła - otrzymany hash:', hash);
      
      // Rozdzielenie części hasha
      const parts = hash.split(':');
      if (parts.length !== 3) {
        throw new Error('Nieprawidłowy format hasha');
      }

      const [algorithm, hashType, rest] = parts;
      const [iterations, salt, hashValue] = rest.split('$');
      
      // Sprawdzenie czy algorytm jest PBKDF2
      if (algorithm !== 'pbkdf2' || hashType !== 'sha256') {
        throw new Error('Nieobsługiwany algorytm haszowania');
      }

      // Konwersja iteracji na liczbę
      const numIterations = parseInt(iterations, 10);

      // Konwersja soli na ArrayBuffer
      const encoder = new TextEncoder();
      const saltBuffer = encoder.encode(salt);
      const passwordBuffer = encoder.encode(password);

      // Importowanie klucza
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      // Generowanie klucza
      const derivedBits = await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: numIterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );

      // Konwersja na hex
      const derivedKey = Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      console.log('Wygenerowany hash:', derivedKey);
      console.log('Oczekiwany hash:', hashValue);

      return derivedKey === hashValue;
    } catch (error) {
      console.error('Błąd weryfikacji hasła:', error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      console.log('Próba logowania dla email:', email);
      
      const result = await rdsService.executeQuery(
        'SELECT id_login, related_id, email, role, password_hash, failed_login_attempts, locked_until FROM login_auth_data WHERE email = ?',
        [email]
      );

      console.log('Wynik zapytania:', result);

      if (result.length === 0) {
        throw new Error('Nieprawidłowy email lub hasło');
      }

      const user = result[0];
      console.log('Pełne dane użytkownika:', JSON.stringify(user, null, 2));
      console.log('Typ password_hash:', typeof user.password_hash);
      console.log('Długość password_hash:', user.password_hash?.length);
      console.log('Pierwsze 50 znaków password_hash:', user.password_hash?.substring(0, 50));

      // Sprawdzenie czy konto jest zablokowane
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new Error('Konto jest tymczasowo zablokowane. Spróbuj ponownie później.');
      }

      // Sprawdzenie hasła
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        // Zwiększenie licznika nieudanych prób
        await rdsService.executeQuery(
          'UPDATE login_auth_data SET failed_login_attempts = failed_login_attempts + 1 WHERE id_login = ?',
          [user.id_login]
        );

        // Sprawdzenie czy konto powinno być zablokowane
        if (user.failed_login_attempts + 1 >= 5) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Blokada na 30 minut
          await rdsService.executeQuery(
            'UPDATE login_auth_data SET locked_until = ? WHERE id_login = ?',
            [lockUntil, user.id_login]
          );
          throw new Error('Zbyt wiele nieudanych prób logowania. Konto zostało zablokowane na 30 minut.');
        }

        throw new Error('Nieprawidłowy email lub hasło');
      }

      // Resetowanie licznika nieudanych prób i aktualizacja ostatniego logowania
      await rdsService.executeQuery(
        'UPDATE login_auth_data SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id_login = ?',
        [user.id_login]
      );

      // Usunięcie wrażliwych danych przed zapisaniem w stanie
      const { password_hash, failed_login_attempts, locked_until, ...safeUser } = user;
      this.currentUser = safeUser;
      return this.currentUser as User;
    } catch (error) {
      console.error('Błąd logowania:', error);
      throw error;
    }
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: User['role']): boolean {
    return this.currentUser?.role === role;
  }
}

export const authService = new AuthService(); 