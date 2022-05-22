;(function(Form) {

QUnit.module('Form#initialize', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('accepts an errorClassName in schema', function(assert) {
  var form = new Form({
    schema: {
      name: {type: 'Text', errorClassName: 'custom-error'}
    }
  });
  assert.deepEqual(form.fields.name.errorClassName, 'custom-error')
});

QUnit.test('prefers schema from options over model', function(assert) {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var schema = { fromOptions: 'Text' };

  var form = new Form({
    schema: schema,
    model: model
  });

  assert.deepEqual(form.schema, schema);
});

QUnit.test('prefers schema from options over model - when schema is a function', function(assert) {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var schema = function() {
    return { fromOptions: 'Text' };
  }

  var form = new Form({
    schema: schema,
    model: model
  });

  assert.deepEqual(form.schema, schema());
});

QUnit.test('uses schema from model if provided', function(assert) {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };

  var form = new Form({
    model: model
  });

  assert.deepEqual(form.schema, model.schema);
});
/*
QUnit.test.todo('uses fieldsets from model if provided', function(assert) {
  var model = new Backbone.Model();

  model.schema = { fromModel: 'Text' };
  model.fieldsets = [{legend: 'from model',
                      fields: ['fromModel']}];

  var form = new Form({
    model: model
  });

  assert.deepEqual(form.fieldsets[0].schema, model.fieldsets[0]);
});
*/
QUnit.test('uses from model if provided - when schema is a function', function(assert) {
  var model = new Backbone.Model();

  model.schema = function() {
    return { fromModel: 'Text' };
  }

  var form = new Form({
    model: model
  });

  assert.deepEqual(form.schema, model.schema());
});

QUnit.test('stores important options', function(assert) {
  var options = {
    model: new Backbone.Model(),
    data: { foo: 1 },
    idPrefix: 'foo',
    templateData: { bar: 2 }
  }

  var form = new Form(options);

  assert.deepEqual(form.model, options.model);
  assert.deepEqual(form.data, options.data);
  assert.deepEqual(form.idPrefix, options.idPrefix);
  assert.deepEqual(form.templateData, options.templateData);
});

QUnit.test('overrides defaults', function(assert) {
  var options = {
    template: _.template('<b></b>'),
    Fieldset: Form.Fieldset.extend(),
    Field: Form.Field.extend(),
    NestedField: Form.NestedField.extend()
  };

  var form = new Form(options);

  assert.deepEqual(form.template, options.template);
  assert.deepEqual(form.Fieldset, options.Fieldset);
  assert.deepEqual(form.Field, options.Field);
  assert.deepEqual(form.NestedField, options.NestedField);
});

QUnit.test('prefers template stored on form prototype over one stored on class', function(assert) {
  var oldTemplate = Form.template;

  var newTemplate = _.template('<form><b data-fieldsets></b></div>');

  Form.prototype.template = newTemplate;

  var form = new Form();

  assert.deepEqual(form.template, newTemplate);

  delete Form.prototype.template;
});

QUnit.test('uses template stored on form class', function(assert) {
  var oldTemplate = Form.template;

  var newTemplate = _.template('<form><b data-fieldsets></b></div>');

  Form.template = newTemplate;

  var form = new Form();

  assert.deepEqual(form.template, newTemplate);

  Form.template = oldTemplate;
});

QUnit.test('uses fieldset and field classes stored on prototype over those stored on form class', function(assert) {
  var DifferentField = function () {
    this.render = function() {}
    return this;
  };
  var DifferentFieldset = function () {
    this.render = function() {}
    return this;
  };
  var DifferentNestedField = function () {
    this.render = function() {}
    return this;
  };

  Form.prototype.Field = DifferentField;
  Form.prototype.Fieldset = DifferentFieldset;
  Form.prototype.NestedField = DifferentNestedField;

  var form = new Form();

  assert.deepEqual(form.Fieldset, DifferentFieldset);
  assert.deepEqual(form.Field, DifferentField);
  assert.deepEqual(form.NestedField, DifferentNestedField);

  delete Form.prototype.Field;
  delete Form.prototype.Fieldset;
  delete Form.prototype.NestedField;
});

QUnit.test('uses fieldset and field classes stored on form class', function(assert) {
  var form = new Form();

  assert.deepEqual(form.Fieldset, Form.Fieldset);
  assert.deepEqual(form.Field, Form.Field);
  assert.deepEqual(form.NestedField, Form.NestedField);
});

QUnit.test('sets selectedFields - with options.fields', function(assert) {
  var options = {
    fields: ['foo', 'bar']
  };

  var form = new Form(options);

  assert.deepEqual(form.selectedFields, options.fields);
});

QUnit.test('sets selectedFields - defaults to using all fields in schema', function(assert) {
  var form = new Form({
    schema: { name: 'Text', age: 'Number' }
  });

  assert.deepEqual(form.selectedFields, ['name', 'age']);
});

QUnit.test('creates fields', function(assert) {
  this.sinon.spy(Form.prototype, 'createField');

  var form = new Form({
    schema: { name: 'Text', age: { type: 'Number' } }
  });

  assert.deepEqual(form.createField.callCount, 2);
  assert.deepEqual(_.keys(form.fields), ['name', 'age']);

  //Check createField() was called correctly
  var args = form.createField.args[0],
      keyArg = args[0],
      schemaArg = args[1];

  assert.deepEqual(keyArg, 'name');
  assert.deepEqual(schemaArg, 'Text');

  var args = form.createField.args[1],
      keyArg = args[0],
      schemaArg = args[1];

  assert.deepEqual(keyArg, 'age');
  assert.deepEqual(schemaArg, { type: 'Number' });
});

QUnit.test('creates fieldsets - first with "fieldsets" option', function(assert) {
  this.sinon.spy(Form.prototype, 'createFieldset');

  var MyForm = Form.extend({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    },

    fieldsets: [
      ['age', 'name']
    ]
  });

  var form = new MyForm({
    fieldsets: [
      ['name', 'age'],
      ['password']
    ]
  });

  assert.deepEqual(form.createFieldset.callCount, 2);
  assert.deepEqual(form.fieldsets.length, 2);

  //Check createFieldset() was called correctly
  var args = form.createFieldset.args[0],
      schemaArg = args[0];

  assert.deepEqual(schemaArg, ['name', 'age']);

  var args = form.createFieldset.args[1],
      schemaArg = args[0];

  assert.deepEqual(schemaArg, ['password']);
});

QUnit.test('creates fieldsets - second with prototype.fieldsets', function(assert) {
  this.sinon.spy(Form.prototype, 'createFieldset');

  var MyForm = Form.extend({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    },

    fieldsets: [
      ['age', 'name']
    ]
  });

  var form = new MyForm();

  assert.deepEqual(form.createFieldset.callCount, 1);
  assert.deepEqual(form.fieldsets.length, 1);

  //Check createFieldset() was called correctly
  var args = form.createFieldset.args[0],
      schemaArg = args[0];

  assert.deepEqual(schemaArg, ['age', 'name']);
});

QUnit.test('creates fieldsets - defaults to all fields in one fieldset', function(assert) {
  this.sinon.spy(Form.prototype, 'createFieldset');

  var form = new Form({
    schema: {
      name: 'Text',
      age: { type: 'Number' },
      password: 'Password'
    }
  });

  assert.deepEqual(form.createFieldset.callCount, 1);
  assert.deepEqual(form.fieldsets.length, 1);

  //Check createFieldset() was called correctly
  var args = form.createFieldset.args[0],
      schemaArg = args[0];

  assert.deepEqual(schemaArg, ['name', 'age', 'password']);
});

QUnit.test('submitButton option: missing - does not create button', function(assert) {
  var form = new Form({
    schema: { name: 'Text' }
  }).render();

  var $btn = form.$('button');

  assert.deepEqual($btn.length, 0);
});

QUnit.test('submitButton option: false - does not create button', function(assert) {
  var form = new Form({
    schema: { name: 'Text' },
    submitButton: false
  }).render();

  var $btn = form.$('button');

  assert.deepEqual($btn.length, 0);
});

QUnit.test('submitButton option: string - creates button with given text', function(assert) {
  var form = new Form({
    schema: { name: 'Text' },
    submitButton: 'Next'
  }).render();

  var $btn = form.$('button[type="submit"]');

  assert.deepEqual($btn.length, 1);
  assert.deepEqual($btn.html(), 'Next');
});

QUnit.test('submitButton still rendered properly if _ templateSettings are changed', function(assert) {
    var oldSettings = _.templateSettings;

    _.templateSettings = {
        evaluate: /\{\{([\s\S]+?)\}\}/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
        escape: /\{\{-([\s\S]+?)\}\}/g
    };

  var form = new Form({
    schema: { name: 'Text' },
    submitButton: 'Next'
  }).render();

  var $btn = form.$('button[type="submit"]');

  assert.deepEqual($btn.length, 1);
  assert.deepEqual($btn.html(), 'Next');
  assert.notDeepEqual( _.templateSettings, Form.templateSettings, "Template settings should be different");

  _.templateSettings = oldSettings;
});

QUnit.test('Uses Backbone.$ not global', function(assert) {
  var old$ = window.$,
    exceptionCaught = false;

  window.$ = null;

  try {
     var form = new Form({
      schema: { name: 'Text' },
      submitButton: 'Next'
    }).render();
  } catch(e) {
    exceptionCaught = true;
  }

  window.$ = old$;

  assert.ok(!exceptionCaught, ' using global \'$\' to render');
});


QUnit.module('Form#EditorValues');

QUnit.test('Form with editor with basic schema should return defaultValues', function(assert) {
  var form = new Form({
    schema: {
      name: {
        type: 'Text'
      }
    }
  }).render();

  assert.deepEqual( form.fields.name.editor.value, "" );
  assert.deepEqual( form.getValue(), { name: "" } );
});

QUnit.test('Form with model with defaults should return defaults', function(assert) {
  var model = Backbone.Model.extend({
    defaults: { name: "Default Name" }
  });
  var form = new Form({
    schema: {
      name: {
        type: 'Text'
      }
    },
    model: new model()
  }).render();

  assert.deepEqual( form.fields.name.editor.value, "Default Name" );
  assert.deepEqual( form.getValue(), { name: "Default Name" } );
});

QUnit.test('Form with data passed in should return data', function(assert) {
  var form = new Form({
    schema: {
      name: {
        type: 'Text'
      }
    },
    data: { name: "Default Name" }
  }).render();

  assert.deepEqual( form.fields.name.editor.value, "Default Name" );
  assert.deepEqual( form.getValue(), { name: "Default Name" } );
});

QUnit.test('Form should not clobber defaultValue of Editors', function(assert) {
  Form.editors.DefaultText = Form.editors.Text.extend({
    defaultValue: "Default Name"
  });
  var form = new Form({
    schema: {
      name: {
        type: 'DefaultText'
      }
    }
  }).render();

  assert.deepEqual( form.fields.name.editor.value, "Default Name" );
  assert.deepEqual( form.getValue(), { name: "Default Name" } );
});


QUnit.module('Form#createFieldset', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('creates a new instance of the Fieldset defined on the form', function(assert) {
  var MockFieldset = Backbone.View.extend();

  var form = new Form({
    schema: { name: 'Text', age: 'Number' },
    Fieldset: MockFieldset
  });

  this.sinon.spy(MockFieldset.prototype, 'initialize');

  var fieldset = form.createFieldset(['name', 'age']);

  assert.deepEqual(fieldset instanceof MockFieldset, true);

  //Check correct options were passed
  var optionsArg = MockFieldset.prototype.initialize.args[0][0];

  assert.deepEqual(optionsArg.schema, ['name', 'age']);
  assert.deepEqual(optionsArg.fields, form.fields);
});



QUnit.module('Form#createField', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();

    this.MockField = Backbone.View.extend({
      editor: new Backbone.View()
    });
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('creates a new instance of the Field defined on the form - with model', function(assert) {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    model: new Backbone.Model()
  });

  this.sinon.spy(MockField.prototype, 'initialize');

  var field = form.createField('name', { type: 'Text' });

  assert.deepEqual(field instanceof MockField, true);

  //Check correct options were passed
  var optionsArg = MockField.prototype.initialize.args[0][0];

  assert.deepEqual(optionsArg.form, form);
  assert.deepEqual(optionsArg.key, 'name');
  assert.deepEqual(optionsArg.schema, { type: 'Text' });
  assert.deepEqual(optionsArg.idPrefix, 'foo');
  assert.deepEqual(optionsArg.model, form.model);
});

QUnit.test('creates a new instance of the Field defined on the form field schema - with model', function(assert) {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    model: new Backbone.Model()
  });

  this.sinon.spy(MockField.prototype, 'initialize');

  var field = form.createField('name', {
    type: 'Text',
    Field: MockField
  });

  assert.deepEqual(field instanceof MockField, true);

  //Check correct options were passed
  var optionsArg = MockField.prototype.initialize.args[0][0];

  assert.deepEqual(optionsArg.form, form);
  assert.deepEqual(optionsArg.key, 'name');
  assert.deepEqual(optionsArg.schema, {
    type: 'Text',
    Field: MockField
  });
  assert.deepEqual(optionsArg.idPrefix, 'foo');
  assert.deepEqual(optionsArg.model, form.model);
});

QUnit.test('creates a new instance of the Field defined on the form - without model', function(assert) {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    data: { name: 'John' }
  });

  this.sinon.spy(MockField.prototype, 'initialize');

  var field = form.createField('name', { type: 'Text' });

  assert.deepEqual(field instanceof MockField, true);

  //Check correct options were passed
  var optionsArg = MockField.prototype.initialize.args[0][0];

  assert.deepEqual(optionsArg.value, 'John');
});

QUnit.test('creates a new instance of the Field defined on the form field schema - without model', function(assert) {
  var MockField = this.MockField;

  var form = new Form({
    idPrefix: 'foo',
    data: {
      name: 'John'
    }
  });

  this.sinon.spy(MockField.prototype, 'initialize');

  var field = form.createField('name', {
    type: 'Text',
    Field: MockField
  });

  assert.deepEqual(field instanceof MockField, true);

  //Check correct options were passed
  var optionsArg = MockField.prototype.initialize.args[0][0];

  assert.deepEqual(optionsArg.value, 'John');
});

QUnit.test('adds listener to all editor events', function(assert) {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    data: { name: 'John' }
  });

  this.sinon.stub(form, 'handleEditorEvent', function(assert) {});

  var field = form.createField('name', { type: 'Text' });

  //Trigger events on editor to check they call the handleEditorEvent callback
  field.editor.trigger('focus');
  field.editor.trigger('blur');
  field.editor.trigger('change');
  field.editor.trigger('foo');

  assert.deepEqual(form.handleEditorEvent.callCount, 4);
});

QUnit.test('editor events can be triggered with any number of arguments', function(assert) {
  var MockField = this.MockField;

  var form = new Form({
    Field: MockField,
    idPrefix: 'foo',
    data: { name: 'John' }
  });

  this.sinon.stub(form, 'trigger', function(assert) { console.log(arguments)});

  var field = form.createField('name', { type: 'Text' });

  //Trigger events on editor to check they call the handleEditorEvent callback
  form.handleEditorEvent('focus', field.editor, 'arg1', 'arg2');

  assert.deepEqual(form.trigger.calledWith('undefined:focus', form, field.editor, ['arg1', 'arg2']), true);
});

QUnit.module('Form#handleEditorEvent', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('triggers editor events on the form, prefixed with the key name', function(assert) {
  var form = new Form(),
      editor = new Form.Editor({ key: 'title' });

  var spy = this.sinon.spy();

  form.on('all', spy);

  form.handleEditorEvent('foo', editor);

  assert.deepEqual(spy.callCount, 1);

  var args = spy.args[0],
      eventArg = args[0],
      formArg = args[1],
      editorArg = args[2];

  assert.deepEqual(eventArg, 'title:foo');
  assert.deepEqual(formArg, form);
  assert.deepEqual(editorArg, editor);
});

QUnit.test('triggers general form events', function(assert) {
  const done = assert.async();

  var form = new Form(),
      editor = new Form.Editor({ key: 'title' });

  //Change
  var changeSpy = this.sinon.spy()

  form.on('change', changeSpy);
  form.handleEditorEvent('change', editor);

  assert.deepEqual(changeSpy.callCount, 1);
  assert.deepEqual(changeSpy.args[0][0], form);

  //Focus
  var focusSpy = this.sinon.spy()

  form.on('focus', focusSpy);
  form.handleEditorEvent('focus', editor);

  assert.deepEqual(focusSpy.callCount, 1);
  assert.deepEqual(focusSpy.args[0][0], form);

  //Blur
  var blurSpy = this.sinon.spy()

  form.hasFocus = true;

  form.on('blur', blurSpy);
  form.handleEditorEvent('blur', editor);

  setTimeout(function() {
    assert.deepEqual(blurSpy.callCount, 1);
    assert.deepEqual(blurSpy.args[0][0], form);

    done();
  }, 0);
});

QUnit.test('triggers the submit event', function(assert) {
  var form = new Form();

  var spy = sinon.spy(),
      submitEvent;

  form.on('submit', function(event) {
    submitEvent = event;
    spy(event);
  });

  form.$el.submit();

  assert.deepEqual(spy.callCount, 1);
  assert.deepEqual(spy.args[0][0], submitEvent);
});



QUnit.module('Form#render', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.stub(Form.editors.Text.prototype, 'render', function(assert) {
      this.setElement($('<input class="'+this.key+'" />'));
      return this;
    });

    this.sinon.stub(Form.Field.prototype, 'render', function(assert) {
      this.setElement($('<field class="'+this.key+'" />'));
      return this;
    });

    this.sinon.stub(Form.Fieldset.prototype, 'render', function(assert) {
      this.setElement($('<fieldset></fieldset>'));
      return this;
    });
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('returns self', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div data-fieldsets></div>')
  });

  var returnedValue = form.render();

  assert.deepEqual(returnedValue, form);
});

QUnit.test('with data-editors="*" placeholder, on inner element', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div><b data-editors="*"></b></div>')
  }).render();

  assert.deepEqual(form.$el.html(), '<b data-editors="*"><input class="name"><input class="password"></b>');
});

QUnit.test('with data-editors="x,y" placeholder, on outermost element', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<b data-editors="name,password"></b>')
  }).render();

  assert.deepEqual(form.$el.html(), '<input class="name"><input class="password">');
});

QUnit.test('with data-fields="*" placeholder, on inner element', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div><b data-fields="*"></b></div>')
  }).render();

  assert.deepEqual(form.$el.html(), '<b data-fields="*"><field class="name"></field><field class="password"></field></b>');
});

QUnit.test('with data-fields="x,y" placeholder, on outermost element', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<b data-fields="name,password"></b>')
  }).render();

  assert.deepEqual(form.$el.html(), '<field class="name"></field><field class="password"></field>');
});

QUnit.test('with data-fieldsets placeholder, on inner element', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<div><b data-fieldsets></b></div>')
  }).render();

  assert.deepEqual(form.$el.html(), '<b data-fieldsets=""><fieldset></fieldset></b>');
});

QUnit.test('with data-fieldsets placeholder, on outermost element', function(assert) {
  var form = new Form({
    schema: { name: 'Text', password: 'Password' },
    template: _.template('<b data-fieldsets></b>')
  }).render();

  assert.deepEqual(form.$el.html(), '<fieldset></fieldset>');
});

QUnit.test('with attributes on form element', function(assert) {
  var form = new Form({
    attributes: {
      autocomplete: "off"
    },
    schema: { name: 'Text', password: 'Password' }
  }).render();
  assert.deepEqual(form.$el.attr("autocomplete"), "off");
});



QUnit.module('Form#validate');

QUnit.test('validates the form and returns an errors object', function (assert) {
  var form = new Form({
    schema: {
      title: {validators: ['required']}
    }
  });

  var err = form.validate();

  assert.deepEqual(err.title.type, 'required');
  assert.deepEqual(err.title.message, 'Required');

  form.setValue({title: 'A valid title'});
  assert.deepEqual(form.validate(), null);
});

QUnit.test('returns model validation errors by default', function(assert) {
  var model = new Backbone.Model;

  model.validate = function() {
    return 'FOO';
  };

  var form = new Form({
    model: model,
    schema: {
      title: {validators: ['required']}
    }
  });

  var err = form.validate();

  assert.deepEqual(err._others, ['FOO']);
});

QUnit.test('skips model validation if { skipModelValidate: true } is passed', function(assert) {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var form = new Form({
    model: model
  });

  var err = form.validate({ skipModelValidate: true });

  assert.deepEqual(err, null);
});



QUnit.module('Form#commit');

QUnit.test('returns validation errors', function(assert) {
  var form = new Form({
    model: new Backbone.Model()
  });

  //Mock
  form.validate = function() {
    return { foo: 'bar' }
  };

  var err = form.commit();

  assert.deepEqual(err.foo, 'bar');
});

QUnit.test('does not return  model validation errors by default', function(assert) {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var form = new Form({
    model: model
  });

  var err = form.commit();

  assert.deepEqual(err, undefined);
});

QUnit.test('returns model validation errors when { validate: true } is passed', function(assert) {
  var model = new Backbone.Model();

  model.validate = function() {
    return 'ERROR';
  };

  var form = new Form({
    model: model
  });

  var err = form.commit({ validate: true });

  assert.deepEqual(err._others, ['ERROR']);
});

QUnit.test('updates the model with form values', function(assert) {
  var model = new Backbone.Model();

  var form = new Form({
    model: model,
    idPrefix: null,
    schema: { title: 'Text' }
  });

  //Change the title in the form and save
  form.setValue('title', 'New title');
  form.commit();

  assert.deepEqual(model.get('title'), 'New title');
});

QUnit.test('triggers model change once', function(assert) {
  var model = new Backbone.Model();

  var form = new Form({
    model: model,
    schema: { title: 'Text', author: 'Text' }
  });

  //Count change events
  var timesCalled = 0;
  model.on('change', function(assert) {
    timesCalled ++;
  });

  form.setValue('title', 'New title');
  form.setValue('author', 'New author');
  form.commit();

  assert.deepEqual(timesCalled, 1);
});

QUnit.test('can silence change event with options', function(assert) {
  var model = new Backbone.Model();

  var form = new Form({
    model: model,
    schema: { title: 'Text', author: 'Text' }
  });

  //Count change events
  var timesCalled = 0;
  model.on('change', function(assert) {
    timesCalled ++;
  });

  form.setValue('title', 'New title');

  form.commit({ silent: true });

  assert.deepEqual(timesCalled, 0);
});



QUnit.module('Form#getValue');

QUnit.test('returns form value as an object', function(assert) {
  var data = {
    title: 'Nooope',
    author: 'Lana Kang'
  };

  var form = new Form({
    data: data,
    schema: {
      title: {},
      author: {}
    }
  }).render();

  var result = form.getValue();

  assert.deepEqual(result.title, 'Nooope');
  assert.deepEqual(result.author, 'Lana Kang');
});

QUnit.test('returns specific field value', function(assert) {
  var data = {
    title: 'Danger Zone!',
    author: 'Sterling Archer'
  };

  var form = new Form({
    data: data,
    schema: {
      title: {},
      author: {}
    }
  }).render();

  assert.deepEqual(form.getValue('title'), 'Danger Zone!');
});



QUnit.module('Form#getEditor');

QUnit.test('returns the editor for a given key', function(assert) {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' }
  });

  assert.deepEqual(form.getEditor('author'), form.fields.author.editor);
});



QUnit.module('Form#focus', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Sets focus on the first editor in the form', function(assert) {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' },
    fieldsets: [
      ['title'], ['author']
    ]
  });

  this.sinon.spy(form.fields.title.editor, 'focus');

  form.focus();

  assert.deepEqual(form.fields.title.editor.focus.callCount, 1);
});



QUnit.module('Form#blur', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Removes focus from the currently focused editor', function(assert) {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' }
  });

  form.hasFocus = true;

  form.fields.author.editor.hasFocus = true;

  this.sinon.spy(form.fields.author.editor, 'blur');

  form.blur();

  assert.deepEqual(form.fields.author.editor.blur.callCount, 1);
});



QUnit.module('Form#trigger');

QUnit.test('Sets hasFocus to true on focus event', function(assert) {
  var form = new Form();

  form.hasFocus = false;

  form.trigger('focus');

  assert.deepEqual(form.hasFocus, true);
});

QUnit.test('Sets hasFocus to false on blur event', function(assert) {
  var form = new Form();

  form.hasFocus = true;

  form.trigger('blur');

  assert.deepEqual(form.hasFocus, false);
});



QUnit.module('Form#remove', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.spy(Form.Fieldset.prototype, 'remove');
    this.sinon.spy(Form.Field.prototype, 'remove');
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('removes fieldsets, fields and self', function(assert) {
  var form = new Form({
    schema: { title: 'Text', author: 'Text' },
    fieldsets: [
      ['title', 'author']
    ]
  });

  form.remove();

  assert.deepEqual(Form.Fieldset.prototype.remove.callCount, 1);

  //Field.remove is called twice each because is called directly and through fieldset
  //This is done in case fieldsets are not used, e.g. fields are included directly through template
  assert.deepEqual(Form.Field.prototype.remove.callCount, 4);
});

})(Backbone.Form);
