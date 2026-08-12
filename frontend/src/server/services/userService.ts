import { db } from '../db';
import { User } from '@/types';

export const fetchAllUsers = async (): Promise<User[]> => {
  // Service logic goes here (database queries, external API calls)
  // return db.query.users.findMany();
  return [
    { id: '1', name: 'Admin User', email: 'admin@urbanchill.ai', role: 'admin' }
  ];
};
