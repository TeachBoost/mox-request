/**
 * Tests for all request library interactions.
 * This uses Cheerio for DOM interaction in the lockscreen
 * library.
 */

var chai = require( 'chai' ),
    expect = chai.expect,
    assert = chai.assert,
    express = require( 'express' ),
    app = express();

// stub request dependencies
var Lockscreen = {
    isOffline: false,
    isError: false,
    hideLoading: function () {},
    showOffline: function () {
        this.isOffline = true;
    },
    setLock: function () {},
    showError: function () {
        this.isError = true;
    }
};
var Notify = {
    show: function () {}
};
var Request = require( '../' )(
    'http://localhost:3000/',
    Lockscreen,
    Notify );

// set up express routes
app.post( '/unauthorized', function( req, res ) {
    res.send( 401, 'you are not authorized' );
});

app.get( '/found', function( req, res ) {
    res.send( 200, 'OK' );
});

// listen on port 3000
app.listen( 3000 );

// run tests
describe( 'Request', function () {

    // basic object test
    it( 'should be an object', function () {
        expect( Request )
            .to.be.an( 'object' );
    });

    // 404
    it( 'should show 404 lockscreen on page not found', function ( done ) {
        Lockscreen.isError = false;
        Request.post(
            'notfound',
            {},
            function () {},
            function ( res ) {
                expect( res.status )
                    .to.equal( 404 );
                expect( Lockscreen.isError )
                    .to.equal( true );
                done();
            });
    });

    // 200
    it( 'should fire callback when page is found', function ( done ) {
        Lockscreen.isError = false;
        Request.get(
            'found',
            function ( body, res ) {
                expect( res.status )
                    .to.equal( 200 );
                expect( Lockscreen.isError )
                    .to.equal( false );
                done();
            });
    });

    // 401
    it( 'should show an unauthorized message', function ( done ) {
        Lockscreen.isError = false;
        Request.post(
            'unauthorized',
            {},
            function () {},
            function ( res ) {
                expect( res.status )
                    .to.equal( 401 );
                expect( Lockscreen.isError )
                    .to.equal( true );
                done();
            });
    });

    // 302 redirect


    // offline / network error
    it( 'should show an offline message', function ( done ) {
        Request.basePath = 'http://localhost:1000/';
        Lockscreen.isError = false;
        Lockscreen.isOffline = false;
        Request.get(
            'neterror',
            function () {},
            function ( err ) {
                expect( err )
                    .to.not.equal( null );
                expect( Lockscreen.isOffline )
                    .to.equal( true );
                done();
            });
    });

});
