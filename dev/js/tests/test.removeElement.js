var expect = chai.expect;

var removeElement = require('../lib/removeElement');

describe('removeElement', function () {
  var div = document.createElement('div');
  div.id = "foo";
  document.body.appendChild(div);
  it('removes an element from the DOM', function () {
    removeElement(div);
    expect(document.getElementById("foo")).to.be.null;
  });
})
