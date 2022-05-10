;(function(Form, Editor) {

  QUnit.module('Password');

  var same = deepEqual;


  QUnit.module('Password#initialize');

  QUnit.test('Sets input type', function(assert) {
    var editor = new Editor();

    same(editor.$el.attr('type'), 'password');
  });


})(Backbone.Form, Backbone.Form.editors.Password);
