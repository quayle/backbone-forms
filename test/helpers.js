;(function(Form, Field, editors) {



QUnit.module('keyToTitle');

QUnit.test('Transforms camelCased string to words', function(assert) {
    var fn = Form.helpers.keyToTitle;
    
    assert.equal(fn('test'), 'Test');
    assert.equal(fn('camelCasedString'), 'Camel Cased String');
});



;(function() {
  
  QUnit.module('createTemplate', {
      beforeEach: function() {
        this._compileTemplate = Form.helpers.compileTemplate;
      },

      afterEach: function() {
        Form.setTemplateCompiler(this._compileTemplate);
      }
  });
  
  var createTemplate = Form.helpers.createTemplate;

  QUnit.test('returns a compiled template if just passed a string', function(assert) {
    var template = createTemplate('Hello {{firstName}} {{lastName}}.');
    
    var result = template({ firstName: 'John', lastName: 'Smith' });
    
    assert.equal(result, 'Hello John Smith.');
  });

  QUnit.test('returns a template compiled with a different templating program, when just passed a string - e.g. Handlebars', function(assert) {
    Form.setTemplateCompiler(Handlebars.compile);

    var template = createTemplate('Hello {{#with person}}{{firstName}} {{lastName}}{{/with}}.');

    var result = template({ person: { firstName: 'John', lastName: 'Smith' } });

    assert.equal(result, 'Hello John Smith.');
  });

  QUnit.test('works when underscore template settings are different and restores them when done', function(assert) {
    var originalSetting = /\[\[(.+?)\]\]/g;
    _.templateSettings.interpolate = originalSetting;
    
    var template = createTemplate('Bye {{firstName}} {{lastName}}!');
    
    var result = template({ firstName: 'John', lastName: 'Smith' });
    
    assert.equal(result, 'Bye John Smith!');
    
    assert.equal(_.templateSettings.interpolate, originalSetting);
  });

  QUnit.test('returns the supplanted string if a context is passed', function(assert) {
    var result = createTemplate('Hello {{firstName}} {{lastName}}.', {
      firstName: 'John',
      lastName: 'Smith'
    });
    
    assert.equal(result, 'Hello John Smith.');
  });
  
})();



;(function() {

  QUnit.module('setTemplates', {
    beforeEach: function() {
      this._templates = Form.templates;
      this._classNames = _.clone(Form.classNames);
      this._createTemplate = Form.helpers.createTemplate;
    },
    
    afterEach: function() {
      Form.templates = this._templates;
      Form.classNames = this._classNames;
      Form.helpers.createTemplate = this._createTemplate;
    }
  });
  
  var setTemplates = Form.helpers.setTemplates;
  
  QUnit.test('Compiles strings into templates', function(assert) {
    var self = this;
    
    var templates = {
      form: '<form class="customForm">{{fieldsets}}</form>'
    }
    
    var calledCreateTemplate = false,
        calledWith = null;
    Form.helpers.createTemplate = function(str) {
      calledCreateTemplate = true;
      calledWith = arguments;
      
      return self._createTemplate(str);
    }
    
    setTemplates(templates);
    
    assert.ok(calledCreateTemplate, 'Should call createTemplate');
    assert.equal(calledWith[0], templates.form);
  });
  
  QUnit.test('Takes already compiled templates', function(assert) {
    var templates = {
      customField: Form.helpers.createTemplate('<div class="customField">{{label}} {{editor}} {{help}}</div>')
    }
    
    setTemplates(templates);
    
    assert.equal(Form.templates.customField, templates.customField);
  });
  
  QUnit.test('Sets custom templates', function(assert) {
    var templates = {
      customField: Form.helpers.createTemplate('<field class="customField">{{editor}}</div>')
    }

    setTemplates(templates);

    assert.equal(Form.templates.customField, templates.customField);
  });
  
  QUnit.test('Sets class names', function(assert) {
    var classNames = {
      error: 'customError'
    };
    
    setTemplates(null, classNames);
    
    assert.equal(Form.classNames.error, 'customError');
  });
  
  QUnit.test('Can be called via Form.setTemplates shortcut', function(assert) {
    same(Form.setTemplates, Form.helpers.setTemplates);
  });
  
})();



QUnit.module('createEditor');

(function() {
    
    var create = Form.helpers.createEditor,
        editors = Form.editors;

    var options = {
        key: 'test',
        schema: {
            subSchema: {
                key: 'test'
            },
            model: 'test',
            options: []
        }
    };    
    
    QUnit.test('Accepts strings for included editors', function(assert) {
        assert.ok(create('Text', options) instanceof editors.Text);
        assert.ok(create('Number', options) instanceof editors.Number);
        assert.ok(create('TextArea', options) instanceof editors.TextArea);
        assert.ok(create('Password', options) instanceof editors.Password);
        assert.ok(create('Select', options) instanceof editors.Select);
        assert.ok(create('Object', options) instanceof editors.Object);
        assert.ok(create('NestedModel', options) instanceof editors.NestedModel);
    });

    QUnit.test('Accepts editor constructors', function(assert) {
        assert.ok(create(editors.Text, options) instanceof editors.Text);
        assert.ok(create(editors.Select, options) instanceof editors.Select);
    });
    
})();



(function() {
  
  QUnit.module('getValidator');
  
  var getValidator = Form.helpers.getValidator;

  QUnit.test('Given a string, a bundled validator is returned', function(assert) {
    var required = getValidator('required'),
        email = getValidator('email');
    
    assert.equal(required(null).type, 'required');
    assert.equal(email('invalid').type, 'email');
  });
  
  QUnit.test('Given a string, throws if the bundled validator is not found', function(assert) {
    expect(1);
    
    try {
      getValidator('unknown validator');
    } catch (e) {
      assert.equal(e.message, 'Validator "unknown validator" not found');
    }
  });
  
  QUnit.test('Given an object, a customised bundled validator is returned', function(assert) {
    //Can customise error message
    var required = getValidator({ type: 'required', message: 'Custom message' });
    
    var err = required('');
    assert.equal(err.type, 'required');
    assert.equal(err.message, 'Custom message');
    
    //Can customise options on certain validators
    var regexp = getValidator({ type: 'regexp', regexp: /foobar/, message: 'Must include "foobar"' });
    
    var err = regexp('invalid');
    assert.equal(err.type, 'regexp');
    assert.equal(err.message, 'Must include "foobar"');
  });

  QUnit.test('Given a regular expression, returns a regexp validator', function(assert) {
    var regexp = getValidator(/hello/);
    
    assert.equal(regexp('invalid').type, 'regexp');
  });

  QUnit.test('Given a function, it is returned', function () {
    var myValidator = function () { return; };

    var validator = getValidator(myValidator);

    assert.equal(validator, myValidator);
  });

  QUnit.test('Given an unknown type, an error is thrown', function () {
    expect(1);
    
    try {
      getValidator(['array']);
    } catch (e) {
      assert.equal(e.message, 'Invalid validator: array');
    }
  });

})();



})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
