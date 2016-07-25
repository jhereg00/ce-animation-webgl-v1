var expect = chai.expect;

var DCSS = require('lib/DynamicStylesheet');
var removeElement = require('lib/removeElement');

describe('DynamicStylesheet', function () {
  var testEl, dcss;
  before(function (done) {
    testEl = document.createElement('div');
    testEl.setAttribute('class','dcss-test');
    testEl.setAttribute('id','dcss');
    document.body.appendChild(testEl);
    requestAnimationFrame(function () {
      done();
    });
  });
  after(function () {
    removeElement(testEl);
  });

  describe('constructor', function () {
    it('adds a style element', function () {
      dcss = new DCSS ();
      expect(dcss.sheet).to.be.defined;
      expect(dcss.sheet).to.equal(document.styleSheets[(document.styleSheets.length - 1)]);
      expect(dcss.sheet.ownerNode.parentNode).to.equal(document.head);
    });
  });
  describe('setStyle', function () {
    it('adds rules for ids', function () {
      dcss.setStyle('#' + testEl.id, {
        'font-size' : '17px'
      });
      expect(getComputedStyle(testEl).fontSize).to.equal('17px');
    });
    it('adds rules for classes', function () {
      dcss.setStyle('.' + testEl.getAttribute('class').split(' ').join('.'), {
        'padding' : '10px',
        'padding-bottom' : '14px'
      });
      var compStyle = getComputedStyle(testEl);
      expect(compStyle.paddingTop).to.equal('10px');
      expect(compStyle.paddingBottom).to.equal('14px');
    });
  });
  describe('removeStyle', function () {
    it('selectively removes styles one property at a time', function () {
      dcss.removeStyle('.' + testEl.getAttribute('class').split(' ').join('.'), 'padding-bottom');
      expect(getComputedStyle(testEl).paddingBottom).to.equal('10px');
    });
  });
  describe('clearRules', function () {
    it('wipes all rules', function () {
      dcss.clearRules();
      var compStyle = getComputedStyle(testEl);
      expect(compStyle.fontSize).to.equal(getComputedStyle(document.body).fontSize);
      expect(compStyle.paddingTop).to.equal('0px');
    })
  })
})
