// runs the mocha tests
describe('Classes', function () {
  require('tests/test.AjaxRequest');
  require('tests/test.ScrollController');
  require('tests/test.DynamicStylesheet');
});

describe('Functions', function () {
  require('tests/test.extendObject');
  require('tests/test.classes');
  require('tests/test.removeElement');
  require('tests/test.getPageOffset');
  require('tests/test.getScrollPosition');
  require('tests/test.formData');
});

describe('Features', function () {
  require('tests/test.loop');
})
