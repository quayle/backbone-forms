;(function(Form, Editor) {

  QUnit.module('Password');


  QUnit.module('Password#initialize');

  QUnit.test('Sets input type', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.$el.attr('type'), 'password');
  });


})(Backbone.Form, Backbone.Form.editors.Password);
