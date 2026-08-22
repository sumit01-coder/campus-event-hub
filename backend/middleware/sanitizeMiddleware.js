const xss = require('xss');

const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        if (typeof obj === 'string') {
            return xss(obj); // Sanitize strings for XSS
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitizedObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Strip out keys that start with $ or . to prevent NoSQL injection
            if (key.startsWith('$') || key.includes('.')) {
                continue;
            }
            sanitizedObj[key] = sanitizeObject(obj[key]);
        }
    }
    return sanitizedObj;
};

const sanitize = (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
};

module.exports = sanitize;
