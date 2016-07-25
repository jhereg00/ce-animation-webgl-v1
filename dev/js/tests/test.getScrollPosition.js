var expect = chai.expect;

var getScrollPos = require('lib/getScrollPosition');

describe('getScrollPosition', function () {
  it ('gets the window\'s scroll position Y', function (done) {
    window.scrollTo(0,0);
    document.body.style.minHeight = '10000px';
    requestAnimationFrame(function () {
      expect(getScrollPos()).to.equal(0);
      window.scrollTo(0,100);
      requestAnimationFrame(function () {
        expect(getScrollPos()).to.equal(100);
        done();
      });
    });
  });
  after(function () {
    window.scrollTo(0,0);
    document.body.style.minHeight = '';
  });
});
