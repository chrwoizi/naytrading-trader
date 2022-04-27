export * from './admin.service.client';
import { AdminServiceClient } from './admin.service.client';
export * from './auth.service.client';
import { AuthServiceClient } from './auth.service.client';
export * from './default.service.client';
import { DefaultServiceClient } from './default.service.client';
export * from './profile.service.client';
import { ProfileServiceClient } from './profile.service.client';
export const APIS = [AdminServiceClient, AuthServiceClient, DefaultServiceClient, ProfileServiceClient];
