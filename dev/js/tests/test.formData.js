var expect = chai.expect;

var formData = require('lib/formData');
var removeElement = require('lib/removeElement');

describe('formData', function () {
  var form,
      testData = {
        'text' : 'testText',
        'textarea' : 'testTextarea',
        'radio' : '2',
        'select' : 'option 2',
        'checkbox1' : 1,
        'checkbox2' : 0
      };
  before(function () {
    form = document.createElement('form');

    // text
    var inp = document.createElement('input');
    inp.name = 'text';
    inp.value = testData.text;
    form.appendChild(inp);

    // textarea
    inp = document.createElement('textarea');
    inp.name = 'textarea';
    inp.value = testData.textarea;
    form.appendChild(inp);

    // radios
    inp = document.createElement('input');
    inp.name = 'radio';
    inp.type = 'radio';
    inp.value = 1;
    form.appendChild(inp);

    inp = document.createElement('input');
    inp.name = 'radio';
    inp.type = 'radio';
    inp.value = 2;
    inp.checked = true;
    form.appendChild(inp);

    inp = document.createElement('input');
    inp.name = 'radio';
    inp.type = 'radio';
    inp.value = 3;
    form.appendChild(inp);

    // select
    inp = document.createElement('select');
    inp.name = 'select';
    for (var i = 0; i < 4; i++) {
      var opt = document.createElement('option');
      opt.value = 'option ' + i;
      opt.innerText = 'option ' + i;
      inp.appendChild(opt);
      if (i === 2)
        opt.selected = true;
    }
    form.appendChild(inp);

    // checkboxes
    inp = document.createElement('input');
    inp.name = 'checkbox1';
    inp.type = 'checkbox';
    inp.checked = true;
    form.appendChild(inp);

    inp = document.createElement('input');
    inp.name = 'checkbox2';
    inp.type = 'checkbox';
    inp.checked = false;
    form.appendChild(inp);

    document.body.appendChild(form);
  });
  after(function () {
    removeElement(form);
  })
  it('gets an object with the values of all the fields', function () {
    console.log(formData(form), testData);
    expect(formData(form)).to.eql(testData);
  })
})
