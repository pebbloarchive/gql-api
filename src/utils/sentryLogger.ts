import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN
});

export const captureException = Sentry.captureException;

export const Logger = async (err) => {
    console.error({ err });
    Sentry.captureException(err);
    return await Sentry.flush(2000);
}

export default Logger;
