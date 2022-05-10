;(function(Form, Editor) {

  QUnit.module('NestedModel');


  var same = deepEqual;

  var ChildModel = Backbone.Model.extend({
    schema: {
      id: { type: 'Number' },
      name: {}
    },
    defaults: {
      id: 8,
      name: 'Marklar'
    }
  });

  var schema = { model: ChildModel };



  QUnit.test('Default value', function(assert) {
    var editor = new Editor({
      form: new Form(),
      schema: schema
    }).render();

    assert.deepEqual(editor.getValue(), { id: 8, name: 'Marklar' });
  });

  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      form: new Form(),
      schema: schema,
      value: {
        id: 42,
        name: "Krieger"
      }
    }).render();

    assert.deepEqual(editor.getValue(), { id: 42, name: "Krieger" });
  });

  QUnit.test('Custom value overrides default value (issue #99)', function(assert) {
    var Person = Backbone.Model.extend({
      schema: { firstName: 'Text', lastName: 'Text' },
      defaults: { firstName: '', lastName: '' }
    });

    var Duo = Backbone.Model.extend({
      schema: {
        name: { type: 'Text' },
        hero: { type: 'NestedModel', model: Person },
        sidekick: { type: 'NestedModel', model: Person}
      }
    });

    var batman = new Person({ firstName: 'Bruce', lastName: 'Wayne' });
    var robin = new Person({ firstName: 'Dick', lastName: 'Grayson' });

    var duo = new Duo({
      name: "The Dynamic Duo",
      hero: batman,
      sidekick: robin
    });

    var duoForm = new Backbone.Form({ model: duo }).render();
    var batmanForm = new Backbone.Form({ model: batman }).render();

    same(duoForm.getValue().hero, {
      firstName: 'Bruce',
      lastName: 'Wayne'
    });
  });

  QUnit.test('Value from model', function(assert) {
    var agency = new Backbone.Model({
      spy: {
        id: 28,
        name: 'Pam'
      }
    });

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      model: agency,
      key: 'spy'
    }).render();

    assert.deepEqual(editor.getValue(), { id: 28, name: 'Pam' });
  });

  QUnit.test.todo("idPrefix is added to child form elements", function() {
    assert.ok(1);
  });

  QUnit.test.todo("Validation on nested model", function() {
    assert.ok(1);
  });

  QUnit.test.todo('uses the nestededitor template, unless overridden in editor schema', function(assert) {
    assert.ok(1);
  });

  QUnit.test.todo("remove() - Removes embedded form", function() {
    assert.ok(1);
  });

  QUnit.test("setValue() - updates the input value", function() {
    var agency = new Backbone.Model({
      spy: {
        id: 28,
        name: 'Pam'
      }
    });

    var editor = new Editor({
      form: new Form(),
      schema: schema,
      model: agency,
      key: 'spy'
    }).render();

    var newValue = {
      id: 89,
      name: "Sterling"
    };

    editor.setValue(newValue);

    assert.deepEqual(editor.getValue(), newValue);
  });

})(Backbone.Form, Backbone.Form.editors.NestedModel);
