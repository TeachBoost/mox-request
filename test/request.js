/**
 * Tests for all request library interactions.
 * This uses Cheerio for DOM interaction in the lockscreen
 * library.
 */

var expect = chai.expect,
    should = chai.should;

describe( 'Request', function () {

    it( 'should be an object', function () {
        expect( Request )
            .to.be.an( 'object' );
    });

    it( 'should show 404 lockscreen on page not found', function ( done ) {
        Request.post(
            'serve/notfound',
            {},
            function () {},
            function ( res ) {
                expect( res.status )
                    .to.equal( 404 );
                done();
            });
    });

    it( 'should fire callback when page is found', function ( done ) {
        Request.get(
            'serve/test.html',
            function ( body, res ) {
                expect( res.status )
                    .to.equal( 200 );
                done();
            });
    });

});
