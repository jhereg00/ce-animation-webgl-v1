var expect = chai.expect;

var ScrollController = require('lib/ScrollController');
var windowSize = require('lib/windowSize');

describe('ScrollController', function () {
  var el, sc;
  var windowHeight = windowSize.height();
  before(function (done) {
    el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.top = windowHeight + 20 + 'px';
    el.style.height = windowHeight / 2 + 'px';
    document.body.style.minHeight = '100000px';
    document.body.appendChild(el);
    window.scrollTo(0,0);
    requestAnimationFrame(function () { done(); });
  });
  after(function () {
    el.remove();
    document.body.style.minHeight = '';
  })
  describe('constructor', function () {
    it('measures and initializes the function', function (done) {
      sc = new ScrollController(el, function (percentage, pixels) {
        if (percentage > .01)
          done();
      });
      expect(sc.top).to.equal(20);
      window.scrollTo(0, 100);
    });
  });
  describe('methods', function () {
    it('gets the current scroll percentage', function (done) {
      window.scrollTo(0,20);
      requestAnimationFrame(function () {
        expect(sc.getPercentage()).to.equal(0);
        window.scrollTo(0,20 + windowHeight / 2 + el.offsetHeight / 2);
        requestAnimationFrame(function () {
          expect(sc.getPercentage()).to.be.above(.495);
          expect(sc.getPercentage()).to.be.below(.505);
          window.scrollTo(0,20 + windowHeight + el.offsetHeight);
          requestAnimationFrame(function () {
            expect(sc.getPercentage()).to.equal(1);
            done();
          });
        });
      });
    });
    it('gets the number of pixels past 0 point', function (done) {
      window.scrollTo(0,20);
      requestAnimationFrame(function () {
        expect(sc.getPixels()).to.equal(0);
        window.scrollTo(0,120);
        requestAnimationFrame(function () {
          expect(sc.getPixels()).to.equal(100);
          done();
        });
      });
    });
  });
})
