QUnit.module('Field');

QUnit.test("'schema' option - can be a string representing the type", function() {
  var field = new Field({
    key: 'age',
    value: 30,
    schema: 'Number'
  }).render();

  assert.ok(field.editor instanceof editors.Number);
});

QUnit.test("'schema.type' option - Specifies editor to use", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { type: 'Text' }
    }).render();
    
    assert.ok(field.editor instanceof editors.Text);
    
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { type: 'Number' }
    }).render();
    
    assert.ok(field.editor instanceof editors.Number);
});

QUnit.test("'schema.type' option - Defaults to 'Text'", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: {}
    }).render();
    
    assert.ok(field.editor instanceof editors.Text);
});

QUnit.test("'schema.title' option - Populates the <label>", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { title: 'Post Title' }
    }).render();
    
    assert.equal($('label', field.el).html(), 'Post Title');
});

QUnit.test("'schema.title' option - Defaults to formatted version of 'key' option", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: {}
    }).render();
    
    assert.equal($('label', field.el).html(), 'Title');
    
    var field = new Field({
        value: 'test',
        key: 'camelCasedTitle',
        schema: {}
    }).render();
    
    assert.equal($('label', field.el).html(), 'Camel Cased Title');
});

QUnit.test("'schema.title' false option - does not render a <label>", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        schema: { title: false }
    }).render();

    assert.equal($('label', field.el).length, 0);
});

QUnit.test("'schema.help' option - Specifies help text", function() {
  var field = new Field({
    key: 'title',
    schema: { help: 'Some new help text' }
  }).render();
  
  assert.equal($('.bbf-help', field.el).html(), 'Some new help text');
});

QUnit.test("'schema.fieldClass' option - Adds class names to field", function() {
  var field = new Field({
    key: 'title',
    schema: { fieldClass: 'foo bar' }
  }).render();
  
  assert.ok(field.$el.hasClass('bbf-field'), 'Doesnt overwrite default classes');
  assert.ok(field.$el.hasClass('foo'), 'Adds first defined class');
  assert.ok(field.$el.hasClass('bar'), 'Adds other defined class');
})

QUnit.test("'schema.fieldAttrs' option - Adds custom attributes", function() {
  var field = new Field({
    key: 'title',
    schema: {
      fieldAttrs: {
        maxlength: 30,
        type: 'foo',
        custom: 'hello'
      }
    }
  }).render();
  
  var $el = field.$el;
  
  assert.equal($el.attr('maxlength'), 30);
  assert.equal($el.attr('type'), 'foo');
  assert.equal($el.attr('custom'), 'hello');
})

QUnit.test("'schema.template' option - Specifies template", function() {
  Form.templates.custom = Form.helpers.createTemplate('<div class="custom-field"></div>');
  
  var field = new Field({
    key: 'title',
    schema: { template: 'custom' }
  }).render();
  
  assert.ok(field.$el.hasClass('custom-field'));
})

QUnit.test("'model' option - Populates the field with the given 'key' option from the model", function() {
    var field = new Field({
        model: new Post,
        key: 'title',
        idPrefix: null
    }).render();
    
    assert.equal($('#title', field.el).val(), 'Danger Zone!');
});

QUnit.test("'value' option - Populates the field", function() {
    var field = new Field({
        value: 'test',
        key: 'title'
    }).render();
    
    assert.equal($('#title', field.el).val(), 'test');
});

QUnit.test("'idPrefix' option - Specifies editor's DOM element ID prefix", function() {
    var field = new Field({
        value: 'test',
        key: 'title',
        idPrefix: 'prefix_'
    }).render();
    
    assert.equal($('#prefix_title', field.el).length, 1);
});
