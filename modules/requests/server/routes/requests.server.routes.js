'use strict';

/**
 * Module dependencies.
 */
var requestsPolicy = require('../policies/requests.server.policy');
var requests = require('../controllers/requests.server.controller');

module.exports = function (app) {
    // Requests collection routes
    app.route('/api/records').all(requestsPolicy.isAllowed)
        .get(requests.listOrderByDate);
};
