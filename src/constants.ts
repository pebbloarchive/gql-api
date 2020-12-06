export const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export const USERNAME_REGEX = /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
export const PASSWORD_REGEX = /^.*(?=.{8,})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;
export const BLACKLISTED_USERNAMES = /(pebblo|create|signup|register|login|create|home|404|501|help|support|settings|account)/;
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_DEV = !IS_PROD;
export const COOKIE_NAME = 'auth_token';
export const COOKIE_SECRET = 'replace.before.prod.pebblo.secret';

// MESSAGES
export const INVALID_PASSWORD = 'Unable to login, an invalid password was given.';
export const INVALID_INFO = 'Missing required information for request.';
export const INVALID_USERNAME = 'Your username has to be 2-25 characters long.';
export const UNSUPPORTED_USERNAME = 'Usernames can\'t include unicode.';
export const INVALID_EMAIL = 'An invalid email was provided.';
export const WEAK_PASSWORD = 'Your password is too weak, please choose a stronger password.';
export const INVALID_CONF_PASSWORD = 'Your passwords do not match each other.';
export const SAME_PASSWORD_AS_BEFORE = 'You can\'t use a previously used password.';
export const USERNAME_TAKEN = 'Sorry, that username is already in use.';
export const EMAIL_TAKEN = 'Sorry, that email is already in use.';
export const INVALID_USER = 'Unable to find that user.';
export const INVALID_EMAIL_CODE = 'The verification code entered was invalid.';
export const INVALID_TOTP_CODE = 'The totp code entered was invalid.';
