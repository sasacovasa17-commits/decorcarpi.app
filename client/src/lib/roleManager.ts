/**
 * Role Manager - Sistem de Roluri și Permisiuni
 * Roluri: Admin, Manager, Client
 * Permisiuni: Export, Import, Delete, View, Edit
 */

export type UserRole = 'admin' | 'manager' | 'client';

export interface Permission {
  export: boolean;
  import: boolean;
  delete: boolean;
  viewAuditLog: boolean;
  manageUsers: boolean;
  editSettings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  createdAt: number;
}

// Permisiuni per rol
const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    export: true,
    import: true,
    delete: true,
    viewAuditLog: true,
    manageUsers: true,
    editSettings: true,
  },
  manager: {
    export: true,
    import: true,
    delete: false,
    viewAuditLog: true,
    manageUsers: false,
    editSettings: false,
  },
  client: {
    export: false,
    import: false,
    delete: false,
    viewAuditLog: false,
    manageUsers: false,
    editSettings: false,
  },
};

// Gestiune utilizatori în localStorage
const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'current_user';

// Inizialeizare utilizatori default
export function initializeUsers() {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Administrator',
        email: 'admin@decorcarpi.it',
        role: 'admin',
        password: 'Alexandru.07',
        createdAt: Date.now(),
      },
      {
        id: 'manager-1',
        name: 'Manager',
        email: 'manager@decorcarpi.it',
        role: 'manager',
        password: 'Alexandru.07',
        createdAt: Date.now(),
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

// Obține utilizatorul curent
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// Imposta utilizatorul curent
export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Login utilizator
export function loginUser(email: string, password: string): User | null {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (!usersJson) return null;

  const users: User[] = JSON.parse(usersJson);
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

// Logout utilizator
export function logoutUser() {
  setCurrentUser(null);
}

// Verific permisiune
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

// Obține permisiuni pentru rol
export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

// Crea utilizator nou
export function createUser(name: string, email: string, role: UserRole, password: string): User {
  const usersJson = localStorage.getItem(USERS_KEY);
  const users: User[] = usersJson ? JSON.parse(usersJson) : [];

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    password,
    createdAt: Date.now(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return newUser;
}

// Rimuovi utilizator
export function deleteUser(userId: string) {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (!usersJson) return;

  const users: User[] = JSON.parse(usersJson);
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
}

// Obține toți utilizatorii
export function getAllUsers(): User[] {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

// Actualizează utilizator
export function updateUser(userId: string, updates: Partial<User>) {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (!usersJson) return;

  const users: User[] = JSON.parse(usersJson);
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}
