;(function(Form, Editor) {

QUnit.module('Editor#initialize');

QUnit.test('sets the value if using options.model', function(assert) {
  var model = new Backbone.Model({
    name: 'John'
  });

  var editor = new Editor({
    model: model,
    key: 'name'
  });

  assert.deepEqual(editor.value, 'John');
});

QUnit.test('uses options.value if options.model not specified', function(assert) {
  var editor = new Editor({
    value: 'Hello'
  });

  assert.deepEqual(editor.value, 'Hello');
});

QUnit.test('make sure value is not undefined if it is false', function(assert) {
  var editor = new Editor({
    value: false
  });

  assert.deepEqual(editor.value, false);
});

QUnit.test('sets to defaultValue if options.model and options.value are not set', function(assert) {
  var DefaultValueEditor = Editor.extend({
    defaultValue: 'defaultValue'
  });

  var editor = new DefaultValueEditor();

  assert.deepEqual(editor.value, 'defaultValue');
});

QUnit.test('base Editor defaultValue is null if nothing else is set', function(assert) {
  var editor = new Editor();

  assert.deepEqual(editor.value, null);
});

QUnit.test('stores important data', function(assert) {
  var form = new Form(),
      schema = { type: 'Text', validators: ['required'] };

  var editor = new Editor({
    form: form,
    key: 'name',
    schema: schema
  });

  assert.deepEqual(editor.key, 'name');
  assert.deepEqual(editor.form, form);
  assert.deepEqual(editor.schema, schema);
});

QUnit.test('stores validators from options or schema', function(assert) {
  var editor = new Editor({
    validators: ['required']
  });

  assert.deepEqual(editor.validators, ['required']);

  var editor2 = new Editor({
    schema: { validators: ['email'] }
  });

  assert.deepEqual(editor2.validators, ['email']);
});

QUnit.test('sets the "id" attribute on the element', function(assert) {
  var editor = new Editor({
    id: 'foo'
  });

  assert.deepEqual(editor.$el.attr('id'), 'foo');
});

QUnit.test('sets the "name" attribute on the element, if key is available', function(assert) {
  var editor = new Editor({
    key: 'title'
  });

  assert.deepEqual(editor.$el.attr('name'), 'title');
});

QUnit.test('options.schema.editorClass - Adds class names to editor', function(assert) {
  var editor = new Editor({
    schema: { editorClass: 'foo bar' }
  });

  var $el = editor.$el;

  assert.ok($el.hasClass('foo'), 'Adds first defined class');
  assert.ok($el.hasClass('bar'), 'Adds other defined class');
});

QUnit.test('options.schema.editorAttrs option - Adds custom attributes', function(assert) {
  var editor = new Editor({
    schema: {
      editorAttrs: {
        maxlength: 30,
        type: 'foo',
        custom: 'hello'
      }
    }
  });

  var $el = editor.$el;

  assert.deepEqual($el.attr('maxlength'), '30');
  assert.deepEqual($el.attr('type'), 'foo');
  assert.deepEqual($el.attr('custom'), 'hello');
});


  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: 'Hello'
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });


QUnit.module('Editor#getName');

QUnit.test('replaces periods with underscores', function(assert) {
  var editor = new Editor({
    key: 'user.name.first'
  });

  assert.deepEqual(editor.getName(), 'user_name_first');
});



QUnit.module('Editor#getValue');

QUnit.test('returns editor value', function(assert) {
  var editor = new Editor({
    value: 'foo'
  });

  assert.deepEqual(editor.getValue(), 'foo');
});



QUnit.module('Editor#setValue');

QUnit.test('sets editor value', function(assert) {
  var editor = new Editor({
    value: 'foo'
  });

  editor.setValue('bar');

  assert.deepEqual(editor.value, 'bar');
});



QUnit.module('Editor#commit', {
  beforeEach: function() {
    var self = this;

    this.sinon = sinon.sandbox.create();

    this.validationErr = null;
    this.sinon.stub(Editor.prototype, 'validate', function(assert) {
      return self.validationErr;
    });
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('returns validation errors', function(assert) {
  var editor = new Editor();

  this.validationErr = { type: 'required' };

  assert.deepEqual(editor.commit(), this.validationErr);
});

QUnit.test('returns model validation errors if options.validate is true', function(assert) {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var editor = new Editor({
    model: model,
    key: 'title'
  });

  assert.deepEqual(editor.commit({ validate: true }), 'ERROR');
});

QUnit.test('sets value to model', function(assert) {
  var model = new Backbone.Model();

  var editor = new Editor({
    model: model,
    key: 'title'
  });

  editor.setValue('New Title');

  editor.commit();

  assert.deepEqual(model.get('title'), 'New Title');
});



QUnit.module('Editor#validate');

QUnit.test('returns validation errors', function(assert) {
  var editor = new Editor({
    validators: ['required']
  });

  var err = editor.validate();

  assert.deepEqual(err.type, 'required');
  assert.deepEqual(err.message, 'Required');
});

QUnit.test('returns undefined if no errors', function(assert) {
  var editor = new Editor({
    validators: ['required'],
    value: 'ok'
  });

  var err = editor.validate();

  assert.deepEqual(err, undefined);
});



QUnit.module('Editor#trigger');

QUnit.test('sets hasFocus to true on focus event', function(assert) {
  var editor = new Editor();

  editor.hasFocus = false;

  editor.trigger('focus');

  assert.deepEqual(editor.hasFocus, true);
});

QUnit.test('sets hasFocus to false on blur event', function(assert) {
  var editor = new Editor();

  editor.hasFocus = true;

  editor.trigger('blur');

  assert.deepEqual(editor.hasFocus, false);
});



QUnit.module('Editor#getValidator');

QUnit.test('Given a string, a bundled validator is returned', function(assert) {
  var editor = new Editor();

  var required = editor.getValidator('required'),
      email = editor.getValidator('email');

  assert.equal(required(null).type, 'required');
  assert.equal(email('invalid').type, 'email');
});

QUnit.test('Given a string, throws if the bundled validator is not found', function(assert) {
  var editor = new Editor();

  try {
    editor.getValidator('unknown validator');
  } catch (e) {
    assert.equal(e.message, 'Validator "unknown validator" not found');
  }
});

QUnit.test('Given an object, a customised bundled validator is returned', function(assert) {
  var editor = new Editor();

  //Can customise error message
  var required = editor.getValidator({ type: 'required', message: 'Custom message' });

  var err = required('');
  assert.equal(err.type, 'required');
  assert.equal(err.message, 'Custom message');

  //Can customise options on certain validators
  var regexp = editor.getValidator({ type: 'regexp', regexp: /foobar/, message: 'Must include "foobar"' });

  var err = regexp('invalid');
  assert.equal(err.type, 'regexp');
  assert.equal(err.message, 'Must include "foobar"');
});

QUnit.test('Given a regular expression, returns a regexp validator', function(assert) {
  var editor = new Editor();

  var regexp = editor.getValidator(/hello/);

  assert.equal(regexp('invalid').type, 'regexp');
});

QUnit.test('Given a function, it is returned', function (assert) {
  var editor = new Editor();

  var myValidator = function () { return; };

  var validator = editor.getValidator(myValidator);

  assert.equal(validator, myValidator);
});

QUnit.test('Given an unknown type, an error is thrown', function (assert) {
  var editor = new Editor();

  try {
    editor.getValidator(['array']);
  } catch (e) {
    assert.equal(e.message, 'Invalid validator: array');
  }
});


})(Backbone.Form, Backbone.Form.Editor);
