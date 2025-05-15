import { User } from '../../users/entities/user.entity';

export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}
