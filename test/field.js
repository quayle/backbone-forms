;(function(Form, Field) {

QUnit.module('Field#initialize', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('overrides defaults', function(assert) {
  var options = {
    key: 'title',
    template: _.template('<b></b>'),
    errorClassName: 'ERR'
  };

  var field = new Field(options);

  assert.deepEqual(field.template, options.template);
  assert.deepEqual(field.errorClassName, 'ERR');
});

QUnit.test('stores important options', function(assert) {
  var options = {
    key: 'foo',
    form: new Form(),
    model: new Backbone.Model(),
    value: { foo: 1 },
    idPrefix: 'foo'
  }

  var field = new Field(options);

  assert.deepEqual(field.key, options.key);
  assert.deepEqual(field.form, options.form);
  assert.deepEqual(field.model, options.model);
  assert.deepEqual(field.value, options.value);
  assert.deepEqual(field.idPrefix, options.idPrefix);
});

QUnit.test('creates the schema', function(assert) {
  this.sinon.spy(Field.prototype, 'createSchema');

  var options = {
    key: 'title',
    schema: { type: 'Text', title: 'Title' }
  };

  var field = new Field(options);

  assert.deepEqual(field.createSchema.callCount, 1);
  assert.deepEqual(field.createSchema.args[0][0], options.schema);
  assert.deepEqual(field.schema.type, Form.editors.Text);
  assert.deepEqual(field.schema.title, 'Title');
});

QUnit.test('creates the editor', function(assert) {
  this.sinon.spy(Field.prototype, 'createEditor');

  var field = new Field({
    key: 'title',
    schema: { type: 'Text' }
  });

  assert.deepEqual(field.createEditor.callCount, 1);
  assert.deepEqual(field.editor instanceof Form.editors.Text, true);
});

QUnit.test('first, uses template defined in options', function(assert) {
  var optionsTemplate = _.template('<div class="options" data-editor></div>'),
      schemaTemplate = _.template('<div class="schema" data-editor></div>'),
      protoTemplate = _.template('<div class="prototype" data-editor></div>'),
      constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    template: optionsTemplate,
    schema: { type: 'Text', template: schemaTemplate }
  });

  assert.deepEqual(field.template, optionsTemplate);
});

QUnit.test('second, uses template defined in schema', function(assert) {
  var schemaTemplate = _.template('<div class="schema" data-editor></div>'),
      protoTemplate = _.template('<div class="prototype" data-editor></div>'),
      constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    schema: { type: 'Text', template: schemaTemplate }
  });

  assert.deepEqual(field.template, schemaTemplate);
});

QUnit.test('third, uses template defined on prototype', function(assert) {
  var protoTemplate = _.template('<div class="prototype" data-editor></div>'),
      constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    schema: { type: 'Text' }
  });

  assert.deepEqual(field.template, protoTemplate);
});

QUnit.test('fourth, uses template defined on constructor', function(assert) {
  var constructorTemplate = _.template('<div class="constructor" data-editor></div>');

  var CustomField = Field.extend({
  }, {
    template: constructorTemplate
  });

  var field = new CustomField({
    key: 'title',
    schema: { type: 'Text' },
  });

  assert.deepEqual(field.template, constructorTemplate);
});

QUnit.test('Uses Backbone.$ not global', function(assert) {
  var old$ = window.$,
    exceptionCaught = false;

  window.$ = null;

  try {
     var options = {
        key: 'title',
        schema: { type: 'Text', title: 'Title' }
      };

      var field = new Field(options).render();
  } catch(e) {
    exceptionCaught = true;
  }

  window.$ = old$;

  assert.ok(!exceptionCaught, ' using global \'$\' to render');
});

QUnit.module('Field#createSchema');

QUnit.test('converts strings to full schemas', function(assert) {
  var field = new Field({ key: 'title' });

  var schema = field.createSchema('Text');

  assert.deepEqual(schema.type, Form.editors.Text);
  assert.deepEqual(schema.title, 'Title');
});

QUnit.test('applies defaults', function(assert) {
  var field = new Field({ key: 'age' });

  var schema = field.createSchema({ type: 'Number' });

  assert.deepEqual(schema.type, Form.editors.Number);
  assert.deepEqual(schema.title, 'Age');
});



QUnit.module('Field#createEditor', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('creates a new instance of the Editor defined in the schema', function(assert) {
  var field = new Field({
    key: 'password',
    schema: { type: 'Password' },
    form: new Form(),
    idPrefix: 'foo',
    model: new Backbone.Model(),
    value: '123'
  });

  this.sinon.spy(Form.editors.Password.prototype, 'initialize');

  var editor = field.createEditor(field.schema);

  assert.deepEqual(editor instanceof Form.editors.Password, true);

  //Check correct options were passed
  var optionsArg = Form.editors.Password.prototype.initialize.args[0][0];

  assert.deepEqual(optionsArg.schema, field.schema);
  assert.deepEqual(optionsArg.key, field.key);
  assert.deepEqual(optionsArg.id, field.createEditorId());
  assert.deepEqual(optionsArg.form, field.form);
  assert.deepEqual(optionsArg.model, field.model);
  assert.deepEqual(optionsArg.value, field.value);
});



QUnit.module('Field#createEditorId');

QUnit.test('uses idPrefix if defined', function(assert) {
  var stringPrefixField = new Field({
    idPrefix: 'foo_',
    key: 'name'
  });

  var numberPrefixField = new Field({
    idPrefix: 123,
    key: 'name'
  });

  assert.deepEqual(numberPrefixField.createEditorId(), '123name');
});

QUnit.test('adds no prefix if idPrefix is null', function(assert) {
  var field = new Field({
    idPrefix: null,
    key: 'name'
  });

  assert.deepEqual(field.createEditorId(), 'name');
});

QUnit.test('uses model cid if no idPrefix is set', function(assert) {
  var model = new Backbone.Model();
  model.cid = 'foo';

  var field = new Field({
    key: 'name',
    model: model
  });

  assert.deepEqual(field.createEditorId(), 'foo_name');
});

QUnit.test('adds no prefix if idPrefix is null and there is no model', function(assert) {
  var field = new Field({
    key: 'name'
  });

  assert.deepEqual(field.createEditorId(), 'name');
});

QUnit.test('replaces periods with underscores', function(assert) {
  var field = new Field({
    key: 'user.name.first'
  });

  assert.deepEqual(field.createEditorId(), 'user_name_first');
});



QUnit.module('Field#createTitle');

QUnit.test('Transforms camelCased string to words', function(assert) {
  var field = new Field({ key: 'camelCasedString' });

  assert.deepEqual(field.createTitle(), 'Camel Cased String');
});



QUnit.module('Field#templateData');

QUnit.test('returns schema and template data', function(assert) {
  var field = new Field({
    key: 'author',
    schema: { type: 'Text', help: 'Help!' }
  });

  var data = field.templateData();

  assert.deepEqual(data.editorId, 'author');
  assert.deepEqual(data.help, 'Help!');
  assert.deepEqual(data.key, 'author');
  assert.deepEqual(data.title, 'Author');
});



QUnit.module('Field#render', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.stub(Form.editors.Text.prototype, 'render', function(assert) {
      this.setElement($('<input class="'+this.key+'" />'));
      return this;
    });
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('only renders the editor if noField property is true', function(assert) {
  var field = new Field({
    key: 'title',
    schema: { type: 'Hidden' }
  }).render();

  assert.deepEqual(field.$el.prop('tagName'), 'INPUT');
});

QUnit.test('returns self', function(assert) {
  var field = new Field({
    key: 'title',
    schema: { type: 'Text' },
    template: _.template('<div data-editor></div>')
  });

  var returnedValue = field.render();

  assert.deepEqual(returnedValue, field);
});

QUnit.test('with data-editor and data-error placeholders', function(assert) {
  var field = new Field({
    key: 'title',
    schema: { type: 'Text' },
    template: _.template('<div><%= title %><b data-editor></b><i data-error></i></div>', null, Form.templateSettings)
  }).render();

  assert.deepEqual(field.$el.html(), 'Title<b data-editor=""><input class="title"></b><i data-error=""></i>');
});



QUnit.module('Field#validate', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('calls setError if validation fails', function(assert) {
  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  });

  this.sinon.spy(field, 'setError');

  //Make validation fail
  field.setValue(null);
  var err = field.validate();

  //Test
  assert.deepEqual(field.setError.callCount, 1);
  assert.deepEqual(field.setError.args[0][0], 'Required');

  assert.deepEqual(err.type, 'required');
  assert.deepEqual(err.message, 'Required');
});

QUnit.test('calls clearError if validation passes', function(assert) {
  var field = new Field({
    key: 'title',
    schema: { validators: ['required'] }
  });

  this.sinon.spy(field, 'clearError');

  //Trigger error to appear
  field.setValue(null);
  field.validate();

  //Trigger validation to pass
  field.setValue('ok');
  field.validate();

  //Test
  assert.deepEqual(field.clearError.callCount, 1);
});



QUnit.module('Field#setError');

QUnit.test('exits if field hasNestedForm', function(assert) {
  var field = new Field({ key: 'title' });

  field.errorClassName = 'error';
  field.editor.hasNestedForm = true;

  field.render();
  field.setError('foo');

  assert.deepEqual(field.$el.hasClass('error'), false);
});

QUnit.test('adds error CSS class to field element', function(assert) {
  var field = new Field({ key: 'title' });

  field.errorClassName = 'ERR';

  field.render();
  field.setError('foo');

  assert.deepEqual(field.$el.hasClass('ERR'), true);
});

QUnit.test('adds error message to data-error placeholder', function(assert) {
  var field = new Field({ key: 'title' });

  field.render();
  field.setError('Some error');

  assert.deepEqual(field.$('[data-error]').html(), 'Some error');
});



QUnit.module('Field#clearError');

QUnit.test('removes the error CSS class from field element', function(assert) {
  var field = new Field({ key: 'title' });

  field.errorClassName = 'ERR';

  //Set error
  field.render();
  field.setError('foo');

  //Clear error
  field.clearError();

  //Test
  assert.deepEqual(field.$el.hasClass('ERR'), false);
});

QUnit.test('removes error message from data-error placeholder', function(assert) {
  var field = new Field({ key: 'title' });

  //Set error
  field.render();
  field.setError('Some error');

  //Clear error
  field.clearError();

  //Test
  assert.deepEqual(field.$('[data-error]').html(), '');
});



QUnit.module('Field#commit', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Calls editor commit', function(assert) {
  var field = new Field({
    key: 'title',
    model: new Backbone.Model()
  });

  this.sinon.spy(field.editor, 'commit');

  field.commit();

  assert.deepEqual(field.editor.commit.callCount, 1);
});

QUnit.test('Returns error from validation', function(assert) {
  var field = new Field({
    key: 'title',
    model: new Backbone.Model()
  });

  this.sinon.stub(field.editor, 'commit', function(assert) {
    return { type: 'required' }
  });

  var result = field.commit();

  assert.deepEqual(result, { type: 'required' });
});



QUnit.module('Field#getValue', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Returns the value from the editor', function(assert) {
    var field = new Field({
      value: 'The Title',
      key: 'title'
    }).render();

    this.sinon.spy(field.editor, 'getValue');

    var result = field.getValue();

    assert.deepEqual(field.editor.getValue.callCount, 1);
    assert.deepEqual(result, 'The Title');
});



QUnit.module('Field#setValue', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Passes the new value to the editor', function(assert) {
    var field = new Field({ key: 'title' });

    this.sinon.spy(field.editor, 'setValue');

    field.setValue('New Title');

    assert.deepEqual(field.editor.setValue.callCount, 1);
    assert.deepEqual(field.editor.setValue.args[0][0], 'New Title');
});



QUnit.module('Field#focus', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Calls focus on editor', function(assert) {
  var field = new Field({ key: 'title' });

  this.sinon.spy(field.editor, 'focus');

  field.focus();

  assert.deepEqual(field.editor.focus.callCount, 1);
});



QUnit.module('Field#blur', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Calls focus on editor', function(assert) {
  var field = new Field({ key: 'title' });

  this.sinon.spy(field.editor, 'blur');

  field.blur();

  assert.deepEqual(field.editor.blur.callCount, 1);
});


/*
QUnit.module('Field#disable', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Calls disable on editor if method exists', function(assert) {
  Form.editors.Disabler = Form.editors.Text.extend({
    disable: function(){}
  });
  var field = new Field({
    schema: { type: "Disabler" },
    key: 'title'
  });

  this.sinon.spy(field.editor, 'disable');

  field.disable();

  assert.deepEqual(field.editor.disable.callCount, 1);
});

QUnit.test('If disable method does not exist on editor, disable all inputs inside it', function(assert) {
  var field = new Field({ key: 'title' });

  field.render();

  field.disable();

  assert.deepEqual(field.$(":input").is(":disabled"),true);
});

QUnit.test('Will disable all inputs inside editor by default', function(assert) {
  var field = new Field({ key: 'title',
    schema: {
      type: 'DateTime',
      value: Date.now()
    }
  });

  field.render();

  field.disable();

  assert.deepEqual(field.$("select").is(":disabled"),true);
  assert.deepEqual(field.$("input").is(":disabled"),true);
});

QUnit.module('Field#enable', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Calls enable on editor if method exists', function(assert) {
  Form.editors.Enabler = Form.editors.Text.extend({
    enable: function(){}
  });
  var field = new Field({
    schema: { type: "Enabler" },
    key: 'title'
  });

  this.sinon.spy(field.editor, 'enable');

  field.enable();

  assert.deepEqual(field.editor.enable.callCount, 1);
});

QUnit.test('If enable method does not exist on editor, enable all inputs inside it', function(assert) {
  var field = new Field({ key: 'title' });

  field.$(":input").attr("disabled",true);

  field.render();

  field.enable();

  assert.deepEqual(field.$(":input").is(":disabled"),false);
});

QUnit.test('Will enable all inputs inside editor by default', function(assert) {
  var field = new Field({ key: 'title',
    schema: {
      type: 'DateTime',
      value: Date.now()
    }
  });

  field.$(":input").attr("disabled",true);

  field.render();

  field.enable();

  assert.deepEqual(field.$("select").is(":disabled"),false);
  assert.deepEqual(field.$("input").is(":disabled"),false);
});
*/



QUnit.module('Field#remove', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Removes the editor', function(assert) {
  var field = new Field({ key: 'title' });

  this.sinon.spy(field.editor, 'remove');

  field.remove();

  assert.deepEqual(field.editor.remove.callCount, 1);
});

QUnit.test('Removes self', function(assert) {
  var field = new Field({ key: 'title' });

  this.sinon.spy(Backbone.View.prototype, 'remove');

  field.remove();

  //Called once for editor and once for field:
  assert.deepEqual(Backbone.View.prototype.remove.callCount, 2);
});



QUnit.module('Field#escape title text');

QUnit.test('Title HTML gets escaped by default', function(assert) {
  var field = new Field({
    key: 'XSS',
    schema: {
      title: '      "/><script>throw("XSS Success");</script>      '
    }
  }).render();

  assert.deepEqual( field.$('label').text(), '              \"/><script>throw(\"XSS Success\");</script>            ');
  assert.deepEqual( field.$('label').html(), '              \"/&gt;&lt;script&gt;throw(\"XSS Success\");&lt;/script&gt;            ');
});

QUnit.test('TitleHTML property can be set to true to allow HTML through', function(assert) {
  var field = new Field({
    key: 'XSS',
    schema: {
      titleHTML: '<b>some HTML</b>',
      title: 'will be ignored'
    }
  }).render();

  assert.deepEqual(field.$('label').text(), '        some HTML              ');
  assert.deepEqual(field.$('label').html(), '        <b>some HTML</b>              ');
});

})(Backbone.Form, Backbone.Form.Field);
