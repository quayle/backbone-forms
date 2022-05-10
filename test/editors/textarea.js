;(function(Form, Editor) {

  QUnit.module('TextArea');


  QUnit.module('TextArea#initialize');

  QUnit.test('sets tag type', function(assert) {
    var editor = new Editor();

    assert.ok(editor.$el.is('textarea'));
  });

  QUnit.test('does not set type attribute', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.$el.attr('type'), undefined);
  });


  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        value: 'Test'
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });


})(Backbone.Form, Backbone.Form.editors.TextArea);
