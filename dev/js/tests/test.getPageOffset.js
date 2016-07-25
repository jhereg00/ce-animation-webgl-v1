var expect = chai.expect;

var getPageOffset = require('../lib/getPageOffset');

describe('getPageOffset', function () {
  //setup
  var container = document.createElement('div');
  container.style.position = "absolute";
  container.style.top = "400px";
  container.style.left = "200px";
  container.style.paddingTop = "150px";
  container.style.paddingLeft = "300px";
  var div = document.createElement('div');
  div.style.marginTop = "50px";
  container.appendChild(div);
  document.body.appendChild(container);

  it('gets an element\'s offset', function (done) {
    requestAnimationFrame(function () {
      var offset = getPageOffset(div);
      expect(offset).to.eql({ left: 500, top: 600 });
      done();
    });
  });
  after(function () {
    container.remove();
  });
});
