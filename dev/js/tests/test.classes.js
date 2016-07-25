var expect = chai.expect;

var classes = require('../lib/classes');

describe('classes', function () {
  var div = document.createElement('div');
  var svg = document.createElement('svg');
  describe('add', function () {
    it('adds a class', function () {
      classes.add(div, 'test1');
      expect(div.getAttribute('class')).to.equal('test1');
      classes.add(svg, 'test1');
      expect(svg.getAttribute('class')).to.equal('test1');
    });
    it('adds a list of classes', function () {
      classes.add(div, ['test1','test2']);
      expect(div.getAttribute('class')).to.equal('test1 test2');
      classes.add(svg, ['test1','test2']);
      expect(svg.getAttribute('class')).to.equal('test1 test2');
    });
  });
  describe('remove', function () {
    it('removes a class', function () {
      classes.remove(div, 'test1');
      expect(div.getAttribute('class')).to.equal('test2');
      classes.remove(svg, 'test1');
      expect(svg.getAttribute('class')).to.equal('test2');
    });
    it('removes a list of classes', function () {
      classes.remove(div, ['test1','test2']);
      expect(div.getAttribute('class')).to.equal('');
      classes.remove(svg, ['test1','test2']);
      expect(svg.getAttribute('class')).to.equal('');
    });
  });
  describe('toggle', function () {
    it('toggles a class', function () {
      classes.toggle(div, 'test1');
      expect(div.getAttribute('class')).to.equal('test1');
      classes.toggle(div, 'test1');
      expect(div.getAttribute('class')).to.equal('');
      classes.toggle(svg, 'test1');
      expect(svg.getAttribute('class')).to.equal('test1');
      classes.toggle(svg, 'test1');
      expect(svg.getAttribute('class')).to.equal('');
    });
    it('toggles a list of classes', function () {
      classes.toggle(div, ['test1','test2']);
      expect(div.getAttribute('class')).to.equal('test1 test2');
      classes.toggle(div, ['test1','test2']);
      expect(div.getAttribute('class')).to.equal('');
      classes.toggle(svg, ['test1','test2']);
      expect(svg.getAttribute('class')).to.equal('test1 test2');
      classes.toggle(svg, ['test1','test2']);
      expect(svg.getAttribute('class')).to.equal('');
    });
  });
  describe('has', function () {
    it('checks if an element has a class', function () {
      div.setAttribute('class','test1');
      expect(classes.has(div,'test1')).to.be.true;
      div.setAttribute('class','');
      expect(classes.has(div,'test1')).to.be.false;
      svg.setAttribute('class','test1');
      expect(classes.has(svg,'test1')).to.be.true;
      svg.setAttribute('class','');
      expect(classes.has(svg,'test1')).to.be.false;
    });
  })
});
