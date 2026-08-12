import { fetchAllUsers } from '../services/userService';

export const getUsers = async () => {
  // Controller logic goes here (validation, auth checks, etc.)
  const users = await fetchAllUsers();
  return users;
};
