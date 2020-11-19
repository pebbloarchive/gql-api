import UsernamePasswordInput from '../resolvers/UsernamePasswordInput';
import * as consts from '../constants';
const zxcvbn = require('zxcvbn');

export const validateRegister = (options: UsernamePasswordInput) => {
    const { score } = zxcvbn(options.password);

    if(!options.email.match(consts.EMAIL_REGEX)) {
        return [
            {
                field: 'email',
                message: consts.INVALID_EMAIL
            }
        ]
    }

    if(!options.username.match(consts.USERNAME_REGEX)) {
        return [
            {
                field: 'username',
                message: consts.INVALID_USERNAME
            }
        ]
    }

    // if(!options.password.match(consts.PASSWORD_REGEX)) {
    //     return [
    //         {
    //             field: 'password',
    //             message: consts.INVALID_PASSWORD
    //         }
    //     ]
    // }

    if(score < 3) {
        return [
            {
                field: 'password',
                message: consts.WEAK_PASSWORD
            }
        ]
    }
    return null;
}