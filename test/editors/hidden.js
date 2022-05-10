;(function(Form, Editor) {

  QUnit.module('Hidden');

  QUnit.module('Hidden#initialize');

  QUnit.test('sets input type', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.$el.attr('type'), 'hidden');
  });

  QUnit.test('Default value', function(assert) {
    var editor = new Editor().render();

    assert.equal(editor.getValue(), '');
  });
/*
  QUnit.test('sets noField property so that the wrapping field is not rendered', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.noField, true);
  });
*/
  QUnit.test('Uses Backbone.$ not global', function(assert) {
      var old$ = window.$,
        exceptionCaught = false;

      window.$ = null;

      try {
        var editor = new Editor({
          value: 'test'
        }).render();
      } catch(e) {
        exceptionCaught = true;
      }

      window.$ = old$;

      assert.ok(!exceptionCaught, ' using global \'$\' to render');
    });

})(Backbone.Form, Backbone.Form.editors.Hidden);
