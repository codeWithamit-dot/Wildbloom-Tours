import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

export const jwtCallback = async ({ token, user }: { token: JWT; user?: User }): Promise<JWT> => {
  if (user) {
    token.id = user.id;
    token.email = user.email || '';
    token.role = (user).role || 'user';
  }
  return token;
};

export const sessionCallback = async ({ session, token }: { session: Session; token: JWT }): Promise<Session> => {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.email = token.email as string;
    (session.user).role = token.role || 'user';
  }
  return session;
};