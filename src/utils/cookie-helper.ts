import { Response, CookieOptions } from 'express';

export const getCookieOptions = (maxAge?: number): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    ...(maxAge !== undefined && { maxAge }),
  };
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  refreshTokenName: string = 'refreshToken',
) => {
  res.cookie(refreshTokenName, refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
};

export const setAuthCookies = (
  res: Response,
  _accessToken: string,
  refreshToken: string,
  _accessTokenName: string = 'accessToken',
  refreshTokenName: string = 'refreshToken',
) => {
  setRefreshTokenCookie(res, refreshToken, refreshTokenName);
};

export const clearAuthCookies = (
  res: Response,
  accessTokenName: string = 'accessToken',
  refreshTokenName: string = 'refreshToken',
) => {
  const options = getCookieOptions();
  res.clearCookie(accessTokenName, options);
  res.clearCookie(refreshTokenName, options);
};