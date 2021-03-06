/**
 * Request wrapper library
 * Uses superagent to make API calls to the server. This wraps
 * logic to show notifications, show the lock screen, redirect,
 * etc.
 *
 * @dependency Notify
 * @dependency Lockscreen
 */

// ajax library
var Superagent = require( 'superagent' );
// helpers
var _ = require( 'underscore' );
// dependencies
var Notify = null
  , Lockscreen = null;

// library
var Request = {
    // base path
    basePath: null,
    // post requests
    post: function ( url, data, cb, errCb ) {
        var self = this,
            data = ( arguments.length > 1 ) ? arguments[ 1 ] : {},
            cb = ( arguments.length > 2 ) ? arguments[ 2 ] : function () {},
            errCb = ( arguments.length > 3 ) ? arguments[ 3 ] : function () {};
        return Superagent
            .post( this.basePath + url )
            .send( data )
            .set( 'Accept', 'application/json' )
            .type( 'form' )
            .end( function ( err, res ) {
                if ( err ) {
                    return self.handleNetworkError( err );
                }
                return self.handleResponse( res, cb, errCb );
            });
    },
    // get requests
    get: function ( url, cb, errCb ) {
        var self = this,
            cb = ( arguments.length > 1 ) ? arguments[ 1 ] : function () {},
            errCb = ( arguments.length > 2 ) ? arguments[ 2 ] : function () {};
        return Superagent
            .get( this.basePath + url )
            .end( function ( err, res ) {
                if ( err ) {
                    return self.handleNetworkError( err, errCb );
                }
                return self.handleResponse( res, cb, errCb );
            });
    },
    // response handler
    handleResponse: function ( res, cb, errCb ) {
        // handle 404s, 401s
        if ( ! this.handle404( res )
            || ! this.handle401( res ) )
        {
            Lockscreen.hideLoading();
            return errCb( res );
        }

        // check if res.ok exists; we may be offline
        if ( ! _.has( res, 'ok' ) || ! res.ok ) {
            if ( res.xhr.readyState == 4 ) {
                Lockscreen.showOffline();
            }
        }

        // check for a global errors and display the lock
        // screen with any messages.
        var lockUserOut = ! res.ok;
        // for post requests, look for a "code" property in the response
        if ( ! lockUserOut && res.req.method == "POST" ) {
            lockUserOut = ( ! _.has( res, 'body' )
                || ! res.body
                || ! _.has( res.body, 'code' )
                || parseInt( res.body.code ) >= 400 );
        }
        var notifOptions = {
            clickToHide: ( lockUserOut ) ? false : true,
            autoHide: ( lockUserOut ) ? false : true
        };
        // add body class if we're locking them out
        if ( lockUserOut ) {
            Lockscreen.setLock();
        }

        // check for any messages and render them
        if ( _.has( res, 'body' )
            && res.body
            && _.has( res.body, 'messages' )
            && res.body.messages.length )
        {
            for ( i in res.body.messages ) {
                var pairs = _.pairs( res.body.messages[ i ] );
                Notify.show( pairs[ 0 ][ 0 ], pairs[ 0 ][ 1 ], notifOptions );
            }
        }

        // apply response to callback
        if ( ! lockUserOut ) {
            return cb( res.body, res );
        }
    },
    // handle 404s
    handle404: function ( res ) {
        // show the error lockscreen
        if ( res.status == 404 ) {
            Lockscreen.showError(
                "There was a problem connecting to TeachBoost.",
                [{
                    url: this.basePath + '/dashboard',
                    text: "Back to Dashboard"
                }],
                404 );
            return false;
        }
        return true;
    },
    // handle 401s
    handle401: function ( res ) {
        // show the error lockscreen
        if ( res.status == 401 ) {
            Lockscreen.showError(
                "You're not authorized to view that resource.",
                [{
                    url: this.basePath + '/dashboard',
                    text: "Back to Dashboard"
                }],
                401 );
            return false;
        }
        return true;
    },
    handleNetworkError: function ( err, errCb ) {
        Lockscreen.showOffline();
        return errCb( err );
    }
};

// return
// basePath is the stem for all URLs
// _Lockscreen and _Notify are module dependencies
module.exports = function( basePath, _Lockscreen, _Notify ) {
    // set the basepath
    Request.basePath = basePath;
    // load any dependencies
    Lockscreen = _Lockscreen;
    Notify = _Notify;
    // return library
    return Request;
};