;(function(Form, NestedField) {

var same = deepEqual;

QUnit.module('NestedField#initialize', {
  beforeEach: function() {
    this.sinon = sinon.sandbox.create();
  },

  afterEach: function() {
    this.sinon.restore();
  }
});

QUnit.test('Can override NestedField template', function(assert) {
  var template = _.template('<div class="nested-template"><%= title %></div>');
  var key = 'testing123';

  Form.NestedField.template = template;

  var field = new NestedField({
    key: key,
  }).render();

  same(field.el.outerHTML.toLowerCase(), template({ title: key }));
});


})(Backbone.Form, Backbone.Form.NestedField);
