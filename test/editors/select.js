;(function(Form, Editor) {

  QUnit.module('Select', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
        this.sinon.restore();
    }
  });

  var OptionModel = Backbone.Model.extend({
    toString: function() {
      return this.get('name');
    }
  });

  var OptionCollection = Backbone.Collection.extend({
    model: OptionModel
  });

  var schema = {
    options: ['Sterling', 'Lana', 'Cyril', 'Cheryl', 'Pam']
  };

  var optGroupSchema = {
    options: [
      {
        group: 'Cities',
        options: [ 'Paris', 'Beijing', 'San Francisco']
      },
      {
        group: 'Countries',
        options: [{val: 'fr', label: 'France'}, {val: 'cn', label: 'China'}]
      }
    ]
  };

/*
  QUnit.test('Default value', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    assert.equal(editor.getValue(), 'Sterling');
  });
*/
  QUnit.test('Custom value', function(assert) {
    var editor = new Editor({
      value: 'Cyril',
      schema: schema
    }).render();

    assert.equal(editor.getValue(), 'Cyril');
  });

  QUnit.test('Value from model', function(assert) {
    var editor = new Editor({
      model: new Backbone.Model({ name: 'Lana' }),
      key: 'name',
      schema: schema
    }).render();

    assert.equal(editor.getValue(), 'Lana');
  });

  QUnit.test('Correct type', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    assert.equal($(editor.el).get(0).tagName, 'SELECT');
  });

  QUnit.test('Uses Backbone.$ not global', function(assert) {
    var old$ = window.$,
      exceptionCaught = false;

    window.$ = null;

    try {
      var editor = new Editor({
        schema: schema
      }).render();
    } catch(e) {
      exceptionCaught = true;
    }

    window.$ = old$;

    assert.ok(!exceptionCaught, ' using global \'$\' to render');
  });

  QUnit.test('Option groups', function(assert) {
    var editor = new Editor({
      schema: optGroupSchema
    }).render();

    assert.equal(editor.$('optgroup').length, 2);
    assert.equal(editor.$('optgroup').first().attr('label'), 'Cities')
  });

  QUnit.test('Option groups only contain their "own" options', function(assert) {
    var editor = new Editor({
      schema: optGroupSchema
    }).render();

    var group = editor.$('optgroup').first();
    assert.equal($('option', group).length, 3);
    var options = _.map($('option', group), function(el) {
        return $(el).text();
    });
    assert.ok(~options.indexOf('Paris'));
    assert.ok(~options.indexOf('Beijing'));
    assert.ok(~options.indexOf('San Francisco'));

    var group = editor.$('optgroup').last();
    assert.equal($('option', group).length, 2);
    var options = _.map($('option', group), function(el) {
        return $(el).text();
    });
    assert.ok(~options.indexOf('France'));
    assert.ok(~options.indexOf('China'));
  });

  QUnit.test('Option groups allow to specify option value / label', function(assert) {
    var editor = new Editor({
      schema: optGroupSchema
    }).render();

    var group = editor.$('optgroup').last();
    var options = $('option', group);
    assert.equal(options.first().attr('value'), 'fr');
    assert.equal(options.last().attr('value'), 'cn');
    assert.equal(options.first().text(), 'France');
    assert.equal(options.last().text(), 'China');
  });

  QUnit.test('Option groups with options as string', function(assert) {
    var editor = new Editor({
      schema: {
        options: [
          {
            group: 'Cities',
            options: '<option>Paris</option><option>Beijing</option><option>San Francisco</option>'
          },
          {
            group: 'Countries',
            options: '<option value="fr">France</option><option value="cn">China</option>'
          }
        ]
      }
    }).render();

    var group = editor.$('optgroup').first();
    assert.equal(group.attr('label'), 'Cities');
    assert.equal($('option', group).length, 3);
    assert.equal($('option', group).first().text(), 'Paris');
    assert.equal(editor.$('optgroup').length, 2);
  });

  QUnit.test('Option groups with options as callback', function(assert) {
    var editor = new Editor({
      schema: {
        options: function(callback, thisEditor) {
          assert.ok(thisEditor instanceof Editor);
          assert.ok(thisEditor instanceof Form.editors.Base);
          callback(optGroupSchema.options);
        }
      }
    }).render();

    var optgroups = editor.$('optgroup');

    assert.equal(optgroups.length, 2);

    assert.equal($('option', optgroups.first()).first().text(), 'Paris');
    assert.equal($('option', optgroups.last()).first().text(), 'France');
    assert.equal($('option', optgroups.last()).first().attr('value'), 'fr');
  });

  QUnit.test('Each option group as its own callback', function(assert) {
    var editor = new Editor({
      schema: {
        options: [
          {
            group: 'Cities',
            options: function(callback, thisEditor) {
              assert.ok(thisEditor instanceof Editor);
              assert.ok(thisEditor instanceof Form.editors.Base);
              callback(optGroupSchema.options[0].options);
            }
          },
          {
            group: 'Countries',
            options: function(callback, thisEditor) {
              assert.ok(thisEditor instanceof Editor);
              assert.ok(thisEditor instanceof Form.editors.Base);
              callback(optGroupSchema.options[1].options);
            }
          }
        ]
      }
    }).render();

    var optgroups = editor.$('optgroup');

    assert.equal(optgroups.length, 2);

    assert.equal($('option', optgroups.first()).first().text(), 'Paris');
    assert.equal($('option', optgroups.last()).first().text(), 'France');
    assert.equal($('option', optgroups.last()).first().attr('value'), 'fr');
  });

  QUnit.test('Mixed specification for option groups', function(assert) {
    var countries = new OptionCollection([
      { id: 'fr', name: 'France' },
      { id: 'cn', name: 'China' }
    ]);
    var editor = new Editor({
      schema: {
        options: [
          { group: 'Countries', options: countries },
          { group: 'Cities', options: ['Paris', 'Beijing', 'Tokyo']},
          { group: 'Food', options: '<option>Bread</option>'},
          { group: 'Cars', options: function(callback, thisEditor) {
            assert.ok(thisEditor instanceof Editor);
            assert.ok(thisEditor instanceof Form.editors.Base);
            callback(['VolksWagen', 'Fiat', 'Opel', 'Tesla']);
          }}
        ]
      }
    }).render();

    var optgroups = editor.$('optgroup');

    assert.equal(optgroups.length, 4);
    // Countries:
    var options = $('option', optgroups.get(0));
    assert.equal(options.length, 2);
    assert.equal(options.first().attr('value'), 'fr');
    assert.equal(options.first().text(), 'France');
    // Cities
    var options = $('option', optgroups.get(1));
    assert.equal(options.length, 3);
    assert.equal(options.first().text(), 'Paris');
    // Food
    var options = $('option', optgroups.get(2));
    assert.equal(options.length, 1);
    assert.equal(options.first().text(), 'Bread');
    // Cars
    var options = $('option', optgroups.get(3));
    assert.equal(options.length, 4);
    assert.equal(options.last().text(), 'Tesla');
  });

  QUnit.test('Option groups with collections', function(assert) {
    var countries = new OptionCollection([
      { id: 'fr', name: 'France' },
      { id: 'cn', name: 'China' }
    ]);
    var cities = new OptionCollection([
      { id: 'paris', name: 'Paris' },
      { id: 'bj', name: 'Beijing' },
      { id: 'sf', name: 'San Francisco' }
    ]);

    var editor = new Editor({
      schema: {
        options: [
          {
            group: 'Countries',
            options: countries
          },
          {
            group: 'Cities',
            options: cities
          }
        ]
      }
    }).render();

    var optgroups = editor.$el.find('optgroup');
    assert.equal(optgroups.length, 2);

    assert.equal($('option', optgroups.first()).first().text(), 'France');
    assert.equal($('option', optgroups.first()).first().attr('value'), 'fr');
    assert.equal($('option', optgroups.last()).last().attr('value'), 'sf');
    assert.equal($('option', optgroups.last()).last().text(), 'San Francisco');
  });

  QUnit.test('setOptions() - updates the options on a rendered select', function(assert) {
    var editor = new Editor({
      schema: schema
    }).render();

    editor.setOptions([1,2,3]);

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.length, 3);
    assert.equal(newOptions.first().html(), 1);
    assert.equal(newOptions.last().html(), 3);
  });

  QUnit.test('Options as array of items', function(assert) {
    var editor = new Editor({
      schema: {
        options: ['Matilda', 'Larry']
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().html(), 'Matilda');
    assert.equal(newOptions.last().html(), 'Larry');
  });

  QUnit.test('Options as array of objects', function(assert) {
    var editor = new Editor({
      schema: {
        options: [
          { val: 'kid1', label: 'Teo' },
          { val: 'kid2', label: 'Lilah' },
        ]
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().val(), 'kid1');
    assert.equal(newOptions.last().val(), 'kid2');
    assert.equal(newOptions.first().html(), 'Teo');
    assert.equal(newOptions.last().html(), 'Lilah');
  });

  QUnit.test('Options as any object', function(assert) {
    var editor = new Editor({
      schema: {
        options: {y:"Yes",n:"No"}
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().val(), 'y');
    assert.equal(newOptions.last().val(), 'n');
    assert.equal(newOptions.first().html(), 'Yes');
    assert.equal(newOptions.last().html(), 'No');
  });

  QUnit.test('Options as function that calls back with options', function(assert) {
    var editor = new Editor({
      schema: {
        options: function(callback, thisEditor) {
          assert.ok(thisEditor instanceof Editor);
          assert.ok(thisEditor instanceof Form.editors.Base);
          callback(['Melony', 'Frank']);
        }
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().html(), 'Melony');
    assert.equal(newOptions.last().html(), 'Frank');
  });

  QUnit.test('Options as string of HTML', function(assert) {
    var editor = new Editor({
      schema: {
        options: '<option>Howard</option><option>Bree</option>'
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().html(), 'Howard');
    assert.equal(newOptions.last().html(), 'Bree');
  });

  QUnit.test('Options as a pre-populated collection', function(assert) {
    var options = new OptionCollection([
      { id: 'kid1', name: 'Billy' },
      { id: 'kid2', name: 'Sarah' }
    ]);

    var editor = new Editor({
      schema: {
        options: options
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().val(), 'kid1');
    assert.equal(newOptions.last().val(), 'kid2');
    assert.equal(newOptions.first().html(), 'Billy');
    assert.equal(newOptions.last().html(), 'Sarah');
  });

  QUnit.test('Options as a new collection (needs to be fetched)', function(assert) {
    var options = new OptionCollection();

    this.sinon.stub(options, 'fetch', function(options) {
      this.set([
        { id: 'kid1', name: 'Barbara' },
        { id: 'kid2', name: 'Phil' }
      ]);

      options.success(this);
    });

    var editor = new Editor({
      schema: {
        options: options
      }
    }).render();

    var newOptions = editor.$el.find('option');

    assert.equal(newOptions.first().val(), 'kid1');
    assert.equal(newOptions.last().val(), 'kid2');
    assert.equal(newOptions.first().html(), 'Barbara');
    assert.equal(newOptions.last().html(), 'Phil');
  });

  QUnit.test("setValue() - updates the input value", function(assert) {
    var editor = new Editor({
      value: 'Pam',
      schema: schema
    }).render();

    editor.setValue('Lana');

    assert.equal(editor.getValue(), 'Lana');
    assert.equal($(editor.el).val(), 'Lana');
  });



  QUnit.module('Select events', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.editor = new Editor({
        value: 'Pam',
        schema: schema
      }).render();

      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  QUnit.test("focus() - gives focus to editor and its selectbox", function(assert) {
    var editor = this.editor;

    editor.focus();

    assert.ok(editor.hasFocus);
    assert.ok(editor.$el.is(':focus'));
  });

  QUnit.test("focus() - triggers the 'focus' event", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("blur() - removes focus from the editor and its selectbox", function(assert) {
    var editor = this.editor;

    editor.focus();

    editor.blur();

    assert.ok(!editor.hasFocus);
    assert.ok(!editor.$el.is(':focus'));
  });

  QUnit.test("blur() - triggers the 'blur' event", function(assert) {
    var editor = this.editor;

    editor.focus()

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.blur();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
  });

  QUnit.test("'change' event - bubbles up from the selectbox", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('change', spy);

    editor.$el.val('Cyril');
    editor.$el.change();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

  QUnit.test("'change' event - is triggered when value of select changes", function(assert) {
    const done = assert.async();

    var editor = this.editor;

    var callCount = 0;

    var spy = this.sinon.spy();

    editor.on('change', spy);
    // Pressing a key
    editor.$el.keypress();
    editor.$el.val('a');

    setTimeout(function(){
      callCount++;

      editor.$el.keyup();

      // Keeping a key pressed for a longer time
      editor.$el.keypress();
      editor.$el.val('Pam');

      setTimeout(function(){
        callCount++;

        editor.$el.keypress();
        editor.$el.val('Cheryl');

        setTimeout(function(){
          callCount++;

          editor.$el.keyup();

          // Left; Right: Pointlessly moving around
          editor.$el.keyup();
          editor.$el.keyup();

          assert.ok(spy.callCount == callCount);
          assert.ok(spy.alwaysCalledWith(editor));

          done();
        }, 0);
      }, 0);
    }, 0);
  });

  QUnit.test("'focus' event - bubbles up from the selectbox", function(assert) {
    var editor = this.editor;

    var spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.$el.focus();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });

  QUnit.test("'blur' event - bubbles up from the selectbox", function(assert) {
    var editor = this.editor;

    editor.$el.focus();

    var spy = this.sinon.spy();

    editor.on('blur', spy);

    editor.$el.blur();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
  });



  QUnit.module('Select Text Escaping', {
    beforeEach: function() {
      this.sinon = sinon.sandbox.create();

      this.options = [
        {
          val: '"/><script>throw("XSS Success");</script>',
          label: '"/><script>throw("XSS Success");</script>'
        },
        {
          val: '\"?\'\/><script>throw("XSS Success");</script>',
          label: '\"?\'\/><script>throw("XSS Success");</script>',
        },
        {
          val: '><b>HTML</b><',
          label: '><div class=>HTML</b><',
        }
      ];

      this.editor = new Editor({
        schema: {
          options: this.options
        }
      }).render();

      $('body').append(this.editor.el);
    },

    afterEach: function() {
      this.sinon.restore();

      this.editor.remove();
    }
  });

  QUnit.test.todo('options content gets properly escaped', function(assert) {

    assert.deepEqual(this.editor.schema.options, this.options);

    //What an awful string.
    //CAN'T have white-space on the left, or the string will no longer match
    //If this bothers you aesthetically, can switch it to concat syntax
    var escapedHTML = "<option value=\"&quot;/><script>throw(&quot;XSS Success&quot;);\
</script>\">\"/&gt;&lt;script&gt;throw(\"XSS Success\");&lt;/script&gt;</option><option \
value=\"&quot;?'/><script>throw(&quot;XSS Success&quot;);</script>\">\"?'/&gt;&lt;script&gt;\
throw(\"XSS Success\");&lt;/script&gt;</option><option value=\"><b>HTML</b><\">&gt;&lt;div \
class=&gt;HTML&lt;/b&gt;&lt;</option>";

    assert.deepEqual(this.editor.$el.html(), escapedHTML);

    assert.deepEqual(this.editor.$('option').val(), this.options[0].val);
    assert.deepEqual(this.editor.$('option').first().text(), this.options[0].label);
    assert.deepEqual(this.editor.$('option').first().html(), '\"/&gt;&lt;script&gt;throw(\"XSS Success\");&lt;/script&gt;' );
    assert.deepEqual(this.editor.$('option').text(), "\"/><script>throw(\"XSS Success\");</script>\"?'/><script>throw(\"XSS Success\");</script>><div class=>HTML</b><");
  });

  QUnit.test.todo('options object content gets properly escaped', function(assert) {

      var options = {
        key1: '><b>HTML</b><',
        key2: '><div class=>HTML</b><'
      };

      var editor = new Editor({
        schema: {
          options: options
        }
      }).render();

    assert.deepEqual(editor.schema.options, options);

    //What an awful string.
    //CAN'T have white-space on the left, or the string will no longer match
    //If this bothers you aesthetically, can switch it to concat syntax
    var escapedHTML = "<option value=\"key1\">&gt;&lt;b&gt;HTML&lt;/b&gt;&lt;</option>\
<option value=\"key2\">&gt;&lt;div class=&gt;HTML&lt;/b&gt;&lt;</option>";

    assert.deepEqual(editor.$el.html(), escapedHTML );

    assert.deepEqual(editor.$('option').val(), _.keys(options)[0]);
    assert.deepEqual(editor.$('option').first().text(), options.key1);
    assert.deepEqual(editor.$('option').first().html(), '&gt;&lt;b&gt;HTML&lt;/b&gt;&lt;');
    assert.deepEqual(editor.$('option').text(), '><b>HTML</b><><div class=>HTML</b><' );
  });

  QUnit.test.todo('option groups content gets properly escaped', function(assert) {
    var options = [{
      group: '"/><script>throw("XSS Success");</script>',
      options: [
        {
          val: '"/><script>throw("XSS Success");</script>',
          label: '"/><script>throw("XSS Success");</script>'
        },
        {
          val: '\"?\'\/><script>throw("XSS Success");</script>',
          label: '\"?\'\/><script>throw("XSS Success");</script>',
        },
        {
          val: '><b>HTML</b><',
          label: '><div class=>HTML</b><',
        }
      ]
    }];
    var editor = new Editor({
      schema: {
        options: options
      }
    }).render();

    assert.deepEqual(editor.schema.options, options);

    //What an awful string.
    //CAN'T have white-space on the left, or the string will no longer match
    //If this bothers you aesthetically, can switch it to concat syntax
    var escapedHTML = "<optgroup label=\"&quot;/>\<script>throw(&quot;XSS \
Success&quot;);</script>\"><option value=\"&quot;/>\
<script>throw(&quot;XSS Success&quot;);</script>\">\"/&gt;&lt;script&gt;throw\
(\"XSS Success\");&lt;/script&gt;</option><option value=\"&quot;?'/><script>\
throw(&quot;XSS Success&quot;);</script>\">\"?'/&gt;&lt;script&gt;throw(\"XSS \
Success\");&lt;/script&gt;</option><option value=\"><b>HTML</b><\">&gt;&lt;\
div class=&gt;HTML&lt;/b&gt;&lt;</option></optgroup>";

    assert.deepEqual(editor.$el.html(), escapedHTML);

    assert.deepEqual(editor.$('option').val(), options[0].options[0].val);
    assert.deepEqual(editor.$('option').first().text(), options[0].options[0].label);
    assert.deepEqual(editor.$('option').first().html(), '\"/&gt;&lt;script&gt;throw(\"XSS Success\");&lt;/script&gt;' );
    assert.deepEqual(editor.$('option').text(), "\"/><script>throw(\"XSS Success\");</script>\"?'/><script>throw(\"XSS Success\");</script>><div class=>HTML</b><");
  });

})(Backbone.Form, Backbone.Form.editors.Select);
