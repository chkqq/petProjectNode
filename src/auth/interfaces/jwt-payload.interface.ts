export interface JwtPayload {
  sub: string;
  login: string;
  email: string;
  jti: string;
  tokenVersion: number;
}
