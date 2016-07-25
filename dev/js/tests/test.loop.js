var expect = chai.expect;

var loop = require('lib/loop');

describe('loop', function () {
  var testFn = function testFn () {
    //console.log(new Date().getTime());
    return 1;
  }
  it('should call tick functions every frame', function (done) {
    var spy = sinon.spy(testFn);

    loop.addFunction(spy);
    var frames = -1;
    var start = new Date().getTime();
    (function incFrame () {
      frames++;
      if (new Date().getTime() > start + 1200) {
        loop.removeFunction(spy);
        //console.log(spy.callCount,frames);
        expect(spy.callCount).to.equal(frames);
        done();
      }
      else {
        requestAnimationFrame(incFrame);
      }
    })();
  });
  it('should only call scroll functions when the window scrolls', function (done) {
    window.scrollTo(0,0);
    var spy = sinon.spy(testFn);
    loop.addScrollFunction(spy);
    window.setTimeout(function () {
      window.scrollTo(0,10);
    },200);
    window.setTimeout(function () {
      loop.removeFunction(spy);
      expect(spy.callCount).to.equal(1);
      done();
    },500);
  });
})
