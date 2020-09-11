export const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export const USERNAME_REGEX = /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
export const PASSWORD_REGEX = /^.*(?=.{8,})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;
export const BLACKLISTED_USERNAMES = /(pebblo|create|signup|register|login|create|home|404|501|help|support|settings|account)/;
export const SPOTIFY_URL = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_API = 'https://api.spotify.com/v1/me';
export const SPOTIFY_REDIRECT = 'http://localhost:3000/1.0/auth/spotify/callback';
export const RANDOM_STRING = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// MESSAGES

export const COMMON_ERROR = 'It seems something went wrong, please try again.';
export const INVALID_PASSWORD = 'Unable to login, an invalid password was given.';
export const INVALID_INFO = 'Missing required information for request.';
export const INVALID_USERNAME = 'Usernames can\'t be shorter than one character, or longer than 25 characters.';
export const UNSUPPORTED_USERNAME = 'Usernames can\'t include unicode.';
export const INVALID_EMAIL = 'An invalid email was provided.';
export const WEAK_PASSWORD = 'Your password was too weak, please choose a stronger password.';
export const INVALID_CONF_PASSWORD = 'Your passwords do not match each other.';
export const SAME_PASSWORD_AS_BEFORE = 'You can\'t use a previously used password.';
export const USERNAME_TAKEN = 'Sorry, that username is already in use.';
export const EMAIL_TAKEN = 'Sorry, that email is already in use.';
export const INVALID_USER = 'Unable to find that user.';
export const INVALID_EMAIL_CODE = 'The verification code entered was invalid.';
export const INVALID_MFA_CODE = 'The mfa code entered was invalid.';
export const INVALID_JWT = 'Invalid authorization data was passed.';
export const EXPIRED_JWT = 'Expired authorization token was passed.';

// FUNCTIONS

export function genToken(length: number) {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}