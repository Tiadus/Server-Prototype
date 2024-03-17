const errorIdentify = (errorCode) => {
    let error = new Error();
    if (isNaN(errorCode) === true) {
        console.log(errorCode);
        errorCode = 500;
    }

    switch(errorCode) {
        case 401:
            error.message = "Unauthorized Access";
            error.status = 401;
            break;
        case 403:
            error.message = "Forbidden";
            error.status = 403;
            break;
        case 404:
            error.message = "Unavailable";
            error.status = 404;
            break;
        case 409:
            error.message = "Duplicate Entry";
            error.status = 409;
            break;
        case 500:
            error.message = "Internal Server Error";
            error.status = 500;
            break;
        case 690:
            error.message = "Only 1 Cart Allowed";
            error.status = 690;
            break;
        case 23000:
            error.message = "Duplicate Entry";
            error.status = 409;
            break;
        default:
            error.message = "Unregistered Error";
            error.status = 400;
            break;
    }

    return error;
}

module.exports = errorIdentify;