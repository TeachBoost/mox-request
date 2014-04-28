/**
 * Load files for testing
 */

// stub dependencies
Lockscreen = {
    hideLoading: function () {},
    showOffline: function () {},
    setLock: function () {},
    showError: function () {}
};
Notify = {
    show: function () {}
};

// instantiate test libraries
Request = require( './index.js' )(
    'http://localhost:3000/',
    Lockscreen,
    Notify );
chai = require( 'chai' );