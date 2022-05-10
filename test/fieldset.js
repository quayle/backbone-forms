;(function(Form, Fieldset) {

QUnit.module('Fieldset#initialize', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('creates the schema', function(assert) {
  this.sinon.spy(Fieldset.prototype, 'createSchema');

  var fields = {
    title: new Form.Field({ key: 'title' }),
    author: new Form.Field({ key: 'author' })
  };

  var options = {
    fields: fields,
    schema: { legend: 'Test', fields: ['title', 'author'] }
  };

  var fs = new Fieldset(options);

  assert.deepEqual(fs.createSchema.callCount, 1);
  assert.deepEqual(fs.createSchema.args[0][0], options.schema);
  assert.deepEqual(fs.schema, options.schema);
});

QUnit.test('stores fields defined in the schema', function(assert) {
  var fields = {
    title: new Form.Field({ key: 'title' }),
    author: new Form.Field({ key: 'author' })
  };

  var options = {
    fields: fields,
    schema: ['title', 'author']
  };

  var fs = new Fieldset(options);

  assert.deepEqual(_.keys(fs.fields), ['title', 'author']);
});

QUnit.test('overrides defaults', function(assert) {
  var options = {
    fields: { title: new Form.Field({ key: 'title' }) },
    schema: ['title'],
    template: _.template('<b></b>')
  };

  var fs = new Fieldset(options);

  assert.deepEqual(fs.template, options.template);
});




QUnit.test('first, uses template defined in options', function(assert) {
  var optionsTemplate = _.template('<div class="options" data-fields></div>'),
      schemaTemplate = _.template('<div class="schema" data-fields></div>'),
      protoTemplate = _.template('<div class="prototype" data-fields></div>'),
      constructorTemplate = _.template('<div class="constructor" data-fields></div>');

  var CustomFieldset = Fieldset.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var fieldset = new CustomFieldset({
    template: optionsTemplate,
    schema: { fields: [], template: schemaTemplate }
  });

  assert.deepEqual(fieldset.template, optionsTemplate);
});

QUnit.test('second, uses template defined in schema', function(assert) {
  var schemaTemplate = _.template('<div class="schema" data-fields></div>'),
      protoTemplate = _.template('<div class="prototype" data-fields></div>'),
      constructorTemplate = _.template('<div class="constructor" data-fields></div>');

  var CustomFieldset = Fieldset.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var fieldset = new CustomFieldset({
    schema: { fields: [], template: schemaTemplate }
  });

  assert.deepEqual(fieldset.template, schemaTemplate);
});

QUnit.test('third, uses template defined on prototype', function(assert) {
  var protoTemplate = _.template('<div class="prototype" data-fields></div>'),
      constructorTemplate = _.template('<div class="constructor" data-fields></div>');

  var CustomFieldset = Fieldset.extend({
    template: protoTemplate
  }, {
    template: constructorTemplate
  });

  var fieldset = new CustomFieldset({
    schema: { fields: [] }
  });

  assert.deepEqual(fieldset.template, protoTemplate);
});

QUnit.test('fourth, uses template defined on constructor', function(assert) {
  var constructorTemplate = _.template('<div class="constructor" data-fields></div>');

  var CustomFieldset = Fieldset.extend({
  }, {
    template: constructorTemplate
  });

  var fieldset = new CustomFieldset({
    schema: { fields: [] },
  });

  assert.deepEqual(fieldset.template, constructorTemplate);
});

QUnit.test('Uses Backbone.$ not global', function(assert) {
  var old$ = window.$,
    exceptionCaught = false;

  window.$ = null;

  try {
     var fields = {
        title: new Form.Field({ key: 'title' }),
        author: new Form.Field({ key: 'author' })
      };

      var options = {
        fields: fields,
        schema: { legend: 'Test', fields: ['title', 'author'] }
      };

      var fs = new Fieldset(options).render();
  } catch(e) {
    exceptionCaught = true;
  }

  window.$ = old$;

  assert.ok(!exceptionCaught, ' using global \'$\' to render');
});

QUnit.module('Fieldset#createSchema', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('converts an array schema into an object with legend', function(assert) {
  var options = {
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: ['title', 'author']
  };

  var fs = new Fieldset(options);

  var schema = fs.createSchema(options.schema);

  assert.deepEqual(schema, { legend:null, fields: ['title', 'author'] });
});

QUnit.test('returns fully formed schema as is', function(assert) {
  var options = {
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  }

  var fs = new Fieldset(options);

  var schema = fs.createSchema(options.schema);

  assert.deepEqual(schema, options.schema);
});



QUnit.module('Fieldset#getFieldAt');

QUnit.test('returns field at a given index', function(assert) {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  assert.deepEqual(fs.getFieldAt(0), fs.fields.title);
  assert.deepEqual(fs.getFieldAt(1), fs.fields.author);
});



QUnit.module('Fieldset#templateData');

QUnit.test('returns schema', function(assert) {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  assert.deepEqual(fs.templateData(), fs.schema);
});



QUnit.module('Fieldset#render', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.stub(Form.Field.prototype, 'render', function(assert) {
      this.setElement($('<field class="'+this.key+'" />'));
      return this;
    });
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('returns self', function(assert) {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  var returnedValue = fs.render();

  assert.deepEqual(returnedValue, fs);
});

QUnit.test('with data-fields placeholder, on inner element', function(assert) {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] },
    template: _.template('<div><%= legend %><b data-fields></b></div>')
  });

  fs.render();

  assert.deepEqual(fs.$el.html(), 'Main<b data-fields=""><field class="title"></field><field class="author"></field></b>');
});

QUnit.test('with data-fields placeholder, on outermost element', function(assert) {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] },
    template: _.template('<b data-fields><%= legend %></b>')
  });

  fs.render();

  assert.deepEqual(fs.$el.html(), 'Main<field class="title"></field><field class="author"></field>');
});



QUnit.module('Form#remove', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();

    this.sinon.spy(Form.Field.prototype, 'remove');
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('removes fieldsets, fields and self', function(assert) {
  var fs = new Fieldset({
    fields: {
      title: new Form.Field({ key: 'title' }),
      author: new Form.Field({ key: 'author' })
    },
    schema: { legend: 'Main', fields: ['title', 'author'] }
  });

  fs.remove();

  assert.deepEqual(Form.Field.prototype.remove.callCount, 2);
});

})(Backbone.Form, Backbone.Form.Fieldset);
