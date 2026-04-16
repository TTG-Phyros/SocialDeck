import type { AuthUser } from "./common";

export type AuthLoginResponse = {
  user: AuthUser;
};

export type AuthRegisterResponse = {
  user: AuthUser;
};

export type AuthMeResponse = {
  user: AuthUser;
};

export type AuthLogoutResponse = {
  loggedOut: boolean;
};

export type ProfileResponse = {
  user: AuthUser;
};