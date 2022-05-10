;(function(Form, Field, editors) {

QUnit.module('List', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
        this.sinon.restore();
        $('#qunit-fixture').remove('.length-test')
    }
});

(function() {
    var Post = Backbone.Model.extend({
        defaults: {
            title: 'Danger Zone!',
            content: 'I love my turtleneck',
            author: 'Sterling Archer',
            slug: 'danger-zone',
            weapons: ['uzi', '9mm', 'sniper rifle']
        },

        schema: {
            title:      { type: 'Text' },
            content:    { type: 'TextArea' },
            author:     {},
            slug:       {},
            weapons:    'List'
        }
    });

    var List = editors.List;

    QUnit.test('Default settings', function(assert) {
        var list = new List();

        assert.deepEqual(list.Editor, editors.Text);
    });

    QUnit.test('Uses custom list editors if defined', function(assert) {
        var list = new List({
            schema: { itemType: 'Object' }
        });

        assert.deepEqual(list.Editor, editors.List.Object);
    });
/*
    QUnit.test('Uses custom list template if defined', function(assert) {
        var list = new List({
            schema: { listTemplate: _.template('<div>Custom<div/>') }
        });

        assert.deepEqual(list.template(), '<div>Custom<div/>');
    });
*/
    QUnit.test('Uses regular editor if there is no list version', function(assert) {
        var list = new List({
            schema: { itemType: 'Number' }
        });

        assert.deepEqual(list.Editor, editors.Number);
    });

    QUnit.test('Default value', function(assert) {
        var list = new List().render();

        assert.deepEqual(list.getValue(), []);
    });

    QUnit.test('Custom value', function(assert) {
        var list = new List({
            schema: { itemType: 'Number' },
            value: [1,2,3]
        }).render();

        assert.deepEqual(list.getValue(), [1,2,3]);
    });

    QUnit.test('Add label default value', function(assert) {
        var list = new List().render();

        assert.deepEqual(list.$('[data-action="add"]').text(), 'Add');
    });
/*
    QUnit.test('Add label can be customized', function(assert) {
        var list = new List({
            schema: { addLabel: 'Agregar' }
        }).render();

        assert.deepEqual(list.$('[data-action="add"]').text(), 'Agregar');
    });

    QUnit.test('length: Add button is hidden if maxListLength is reached', function(assert) {
        var maxLength = 10;
        var list = new List({
            schema: { maxListLength: maxLength }
        }).render();

        $('#qunit-fixture').append(list.el);

        assert.deepEqual(list.$('[data-action="add"]').is(':visible'), true);

        for(var i = 1;i < maxLength;i++) {
            list.addItem('foo_' + i);
        }

        assert.deepEqual(list.items.length, maxLength);

        assert.deepEqual(list.$('[data-action="add"]').is(':visible'), false);
    });
*/
    QUnit.test('Uses Backbone.$ not global', function(assert) {
      var old$ = window.$,
        exceptionCaught = false;

      window.$ = null;

      try {
        var editor = new List({
          schema: { itemType: 'Number' },
          value: [1,2,3]
        }).render();
      } catch(e) {
        exceptionCaught = true;
      }

      window.$ = old$;

      assert.ok(!exceptionCaught, ' using global \'$\' to render');
    });
/*
    function createListWithMaxItems(maxLength) {
        var items = [];
        for(var i = 0;i < maxLength;i++) {
            items.push('foo_' + i);
        }

        var list = new List({
            className: 'length-test',
            schema: { maxListLength: maxLength },
            value: items
        }).render();

        $('#qunit-fixture').append(list.el);

        assert.deepEqual(list.items.length, maxLength);

        assert.deepEqual(list.$('[data-action="add"]').is(':visible'), false);

        return list;
    }

    QUnit.test('length: Add button is hidden if initial items >= maxListLength', function(assert) {
        var maxLength = 10;

        createListWithMaxItems(maxLength);
    });

    QUnit.test('length: Add button is shown again if num items < maxListLength', function(assert) {
        var maxLength = 10;

        var list = createListWithMaxItems(maxLength);

        for(i = 1;i < maxLength / 2;i++) {
            list.removeItem(list.items[i]);
        }

        assert.deepEqual(list.$('[data-action="add"]').is(':visible'), true);
    });
*/

    QUnit.test('Value from model', function(assert) {
        var list = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        assert.deepEqual(list.getValue(), ['uzi', '9mm', 'sniper rifle']);
    });

    QUnit.test('setValue() - updates input value', function(assert) {
        var list = new List().render();

        list.setValue(['a', 'b', 'c']);

        assert.deepEqual(list.getValue(), ['a', 'b', 'c']);
    });

    QUnit.test('validate() - returns validation errors', function(assert) {
        var list = new List({
            schema: { validators: ['required', 'email'] },
            value: ['invalid', 'john@example.com', '', 'ok@example.com']
        }).render();

        var err = list.validate();

        assert.deepEqual(err.type, 'list');
        assert.deepEqual(err.errors[0].type, 'email');
        assert.deepEqual(err.errors[1], null);
        assert.deepEqual(err.errors[2].type, 'required');
        assert.deepEqual(err.errors[3], null);
    });

    QUnit.test('validate() - returns null if there are no errors', function(assert) {
        var list = new List({
            schema: { validators: ['required', 'email'] },
            value: ['john@example.com', 'ok@example.com']
        }).render();

        var errs = list.validate();

        assert.deepEqual(errs, null);
    });

    QUnit.test('event: clicking something with data-action="add" adds an item', function(assert) {
        var list = new List().render();

        assert.deepEqual(list.items.length, 1);

        list.$('[data-action="add"]').click();

        assert.deepEqual(list.items.length, 2);
    });

    QUnit.test('event: clicking something with data-action="add" adds an item', function(assert) {
        var list = new List().render();

        assert.deepEqual(list.items.length, 1);

        list.$('[data-action="add"]').click();

        assert.deepEqual(list.items.length, 2);
    });

    QUnit.test('render() - sets the $list property to the data-items placeholder', function(assert) {
        var list = new List({
            template: _.template('<ul class="customList" data-items></div>')
        }).render();

        assert.ok(list.$list.hasClass('customList'));
    });

    function testItemCreate(assert, list, values) {
        assert.deepEqual(list.items.length, 0);

        list.render();

        assert.deepEqual(list.items.length, 3);

        assert.deepEqual(values, _.map(list.items, 'value'));
    }

    QUnit.test('render() - creates items for each item in value array', function(assert) {
        var values = [1,2,3];

        var list = new List({
            schema: { itemType: 'Number' },
            value: values
        });

        testItemCreate(assert, list, values);
    });

    QUnit.test('render() - creates items for each item in value collection', function(assert) {
        var values = [
            { value: 1 },
            { value: 2 },
            { value: 3 }
        ];
        var list = new List({
            schema: { itemType: 'Number' },
            key: 'value',
            value: new Backbone.Collection(values)
        });

        testItemCreate(assert, list, values);
    });

    QUnit.test('render() - creates an initial empty item for empty array', function(assert) {
        var list = new List({
            value: []
        });

        assert.deepEqual(list.items.length, 0);

        list.render();

        assert.deepEqual(list.items.length, 1);
    });

    QUnit.test('addItem() - with no value', function(assert) {
        var form = new Form();

        var list = new List({
            form: form
        }).render();

        var spy = this.sinon.spy(editors.List.Item.prototype, 'initialize');

        list.addItem();

        var expectedOptions = {
            form: form,
            list: list,
            schema: list.schema,
            value: undefined,
            Editor: editors.Text,
            key: list.key
        }

        var actualOptions = spy.lastCall.args[0];

        assert.deepEqual(spy.callCount, 1);
        assert.deepEqual(list.items.length, 2);
        assert.deepEqual(_.last(list.items).value, undefined);

        //Test options
        assert.deepEqual(actualOptions, expectedOptions);
    });

    QUnit.test('addItem() - with no value and a defaultValue on the itemType', function(assert) {
        var form = new Form();

        editors.defaultValue = editors.Text.extend({
            defaultValue: 'defaultValue'
        });

        var list = new List({
            form: form,
            schema: {
                itemType: "defaultValue"
            }
        }).render();

        var spy = this.sinon.spy(editors.List.Item.prototype, 'initialize');

        list.addItem();

        var expectedOptions = {
            form: form,
            list: list,
            schema: list.schema,
            value: undefined,
            Editor: editors.defaultValue,
            key: list.key
        };

        var actualOptions = spy.lastCall.args[0];

        assert.deepEqual(spy.callCount, 1);
        assert.deepEqual(list.items.length, 2);
        assert.deepEqual(_.last(list.items).editor.value, 'defaultValue');
        assert.deepEqual(_.last(list.items).getValue(), 'defaultValue');

        //Test options
        assert.deepEqual(actualOptions, expectedOptions);
    });

    QUnit.test('addItem() - with value', function(assert) {
        var form = new Form();

        var list = new List({
            form: form
        }).render();

        var spy = this.sinon.spy(editors.List.Item.prototype, 'initialize');

        list.addItem('foo');

        var expectedOptions = {
            form: form,
            list: list,
            schema: list.schema,
            value: 'foo',
            Editor: editors.Text,
            key: list.key
        }

        var actualOptions = spy.lastCall.args[0];

        assert.deepEqual(spy.callCount, 1);
        assert.deepEqual(actualOptions, expectedOptions);
        assert.deepEqual(list.items.length, 2);
        assert.deepEqual(_.last(list.items).value, 'foo');
    });

    QUnit.test('addItem() - adds the item to the DOM', function(assert) {
        var list = new List().render();

        list.addItem('foo');

        var $el = list.$('[data-items] div:last input');

        assert.deepEqual($el.val(), 'foo');
    });

    QUnit.test('removeItem() - removes passed item from view and item array', function(assert) {
        var list = new List().render();

        list.addItem();

        assert.deepEqual(list.items.length, 2);
        assert.deepEqual(list.$('[data-items] div').length, 2);

        var item = _.last(list.items);

        list.removeItem(item);

        assert.deepEqual(list.items.length, 1);
        assert.deepEqual(list.$('[data-items] div').length, 1);
        assert.deepEqual(_.indexOf(list.items, item), -1, 'Removed item is no longer in list.items');
    });

    QUnit.test('addItem() - sets editor focus if editor is not isAsync', function(assert) {
        var list = new List().render();

        this.sinon.spy(list.Editor.prototype, 'focus');

        list.addItem();

        assert.ok(list.Editor.prototype.focus.calledOnce);
    });

    QUnit.test('removeItem() - adds an empty item if list is empty', function(assert) {
        var list = new List().render();

        var spy = sinon.spy(list, 'addItem');

        list.removeItem(list.items[0]);

        assert.deepEqual(spy.callCount, 1);
        assert.deepEqual(list.items.length, 1);
    });

    QUnit.test('removeItem() - can be configured to ask for confirmation - and is cancelled', function(assert) {
        //Simulate clicking 'cancel' on confirm dialog
        var stub = this.sinon.stub(window, 'confirm', function(assert) {
            return false;
        });

        var list = new List({
            schema: {
                confirmDelete: 'You sure about this?'
            }
        }).render();

        list.addItem();
        list.removeItem(_.last(list.items));

        //Check confirmation was shown
        assert.deepEqual(stub.callCount, 1);

        //With custom message
        var confirmMsg = stub.lastCall.args[0];
        assert.deepEqual(confirmMsg, 'You sure about this?')

        //And item was not removed
        assert.deepEqual(list.items.length, 2, 'Did not remove item');
    });

    QUnit.test('removeItem() - can be configured to ask for confirmation - and is confirmed', function(assert) {
        //Simulate clicking 'ok' on confirm dialog
        var stub = this.sinon.stub(window, 'confirm', function(assert) {
            return true;
        });

        var list = new List({
            schema: {
                confirmDelete: 'You sure about this?'
            }
        }).render();

        list.addItem();
        list.removeItem(_.last(list.items));

        //Check confirm was shown
        assert.deepEqual(stub.callCount, 1);

        //And item was removed
        assert.deepEqual(list.items.length, 1, 'Removed item');
    });

    QUnit.test("focus() - gives focus to editor and its first item's editor", function(assert) {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        field.focus();

        assert.ok(field.items[0].editor.hasFocus);
        assert.ok(field.hasFocus);

        field.remove();
    });

    QUnit.test("focus() - triggers the 'focus' event", function(assert) {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();
        $(document.body).append(field.el);

        var spy = this.sinon.spy();

        field.on('focus', spy);

        field.focus();

        assert.ok(spy.called);
        assert.ok(spy.calledWith(field));

        field.remove();
    });

    QUnit.test("blur() - removes focus from the editor and its first item's editor", function(assert) {
      const done = assert.async();

      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      field.focus();

      field.blur();

      setTimeout(function() {
        assert.ok(!field.items[0].editor.hasFocus);
        assert.ok(!field.hasFocus);

        done();
      }, 0);
    });

    QUnit.test("blur() - triggers the 'blur' event", function(assert) {
      const done = assert.async();

      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();
      $(document.body).append(field.el);

      field.focus();

      var spy = this.sinon.spy();

      field.on('blur', spy);

      field.blur();

      setTimeout(function() {
        assert.ok(spy.called);
        assert.ok(spy.calledWith(field));

        done();
      }, 0);

      field.remove();
    });

    QUnit.test("'change' event - bubbles up from item's editor", function(assert) {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();

        field.on('change', spy);

        field.items[0].editor.trigger('change', field.items[0].editor);

        assert.ok(spy.called);
        assert.ok(spy.calledWith(field));
    });

    QUnit.test("'change' event - is triggered when an item is added", function(assert) {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();

        field.on('change', spy);

        var item = field.addItem(null, true);

        assert.ok(spy.called);
        assert.ok(spy.calledWith(field));
    });

    QUnit.test("'change' event - is triggered when an item is removed", function(assert) {
        var field = new List({
            model: new Post,
            key: 'weapons'
        }).render();

        var spy = this.sinon.spy();

        var item = field.items[0];

        field.on('change', spy);

        field.removeItem(item);

        assert.ok(spy.called);
        assert.ok(spy.calledWith(field));
    });

    QUnit.test("'focus' event - bubbles up from item's editor when editor doesn't have focus", function(assert) {
      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();
      $(document.body).append(field.el);

      var spy = this.sinon.spy();

      field.on('focus', spy);

      field.items[0].editor.focus();

      assert.ok(spy.called);
      assert.ok(spy.calledWith(field));

      field.remove();
    });

    QUnit.test("'focus' event - doesn't bubble up from item's editor when editor already has focus", function(assert) {
      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      field.focus();

      var spy = this.sinon.spy();

      field.on('focus', spy);

      field.items[0].editor.focus();

      assert.ok(!spy.called);
    });

    QUnit.test("'blur' event - bubbles up from item's editor when editor has focus and we're not focusing on another one of the editor's item's editors", function(assert) {
      const done = assert.async();

      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();
      $(document.body).append(field.el);

      field.focus();

      var spy = this.sinon.spy();

      field.on('blur', spy);

      field.items[0].editor.blur();

      setTimeout(function() {
        assert.ok(spy.called);
        assert.ok(spy.calledWith(field));

        done();
      }, 0);

      field.remove();
    });

    QUnit.test("'blur' event - doesn't bubble up from item's editor when editor has focus and we're focusing on another one of the editor's item's editors", function(assert) {
      const done = assert.async();

      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      field.focus();

      var spy = this.sinon.spy();

      field.on('blur', spy);

      field.items[0].editor.blur();
      field.items[1].editor.focus();

      setTimeout(function() {
        assert.ok(!spy.called);

        done();
      }, 0);
    });

    QUnit.test("'blur' event - doesn't bubble up from item's editor when editor doesn't have focus", function(assert) {
      const done = assert.async();

      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      var spy = this.sinon.spy();

      field.on('blur', spy);

      field.items[0].editor.blur();

      setTimeout(function() {
        assert.ok(!spy.called);

        done();
      }, 0);
    });

    QUnit.test("'add' event - is triggered when an item is added", function(assert) {
      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      var spy = this.sinon.spy();

      field.on('add', spy);

      var item = field.addItem(null, true);

      assert.ok(spy.called);
      assert.ok(spy.calledWith(field, item.editor));
    });

    QUnit.test("'remove' event - is triggered when an item is removed", function(assert) {
      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      var item = field.items[0];

      var spy = this.sinon.spy();

      field.on('remove', spy);

      field.removeItem(item);

      assert.ok(spy.called);
      assert.ok(spy.calledWith(field, item.editor));
    });

    QUnit.test("Events bubbling up from item's editors", function(assert) {
      var field = new List({
          model: new Post,
          key: 'weapons'
      }).render();

      var spy = this.sinon.spy();

      field.on('item:whatever', spy);

      field.items[0].editor.trigger('whatever', field.items[0].editor);

      assert.ok(spy.called);
      assert.ok(spy.calledWith(field, field.items[0].editor));
    });
})();



QUnit.module('List.Item', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();
    },

    afterEach: function() {
        this.sinon.restore();
    }
});

(function() {
    var List = editors.List;

    QUnit.test('initialize() - sets the template from options, then schema, then constructor', function(assert) {
      var optionsTemplate = _.template('<div>Options</div>'),
          schemaTemplate = _.template('<div>Schema</div>'),
          constructorTemplate = _.template('<div>Constructor</div>');

      var CustomItem = List.Item.extend({}, {
        template: constructorTemplate
      });

      //Options
      var item = new CustomItem({
        template: optionsTemplate,
        schema: { itemTemplate: schemaTemplate }
      });

      assert.deepEqual(item.template(), '<div>Options</div>');

      //Schema
      var item = new CustomItem({
        schema: { itemTemplate: schemaTemplate }
      });

      assert.deepEqual(item.template(), '<div>Schema</div>');

      //Constructor
      var item = new CustomItem({
        schema: {}
      });

      assert.deepEqual(item.template(), '<div>Constructor</div>');
    });

    QUnit.test('render() - creates the editor for the given itemType', function(assert) {
        var spy = this.sinon.spy(editors, 'Number');

        var form = new Form();

        var list = new List({
            form: form,
            schema: { itemType: 'Number' }
        }).render();

        var item = new List.Item({
            form: form,
            list: list,
            value: 123,
            Editor: editors.Number
        }).render();

        //Check created correct editor
        var editorOptions = spy.lastCall.args[0];

        assert.deepEqual(editorOptions, {
            form: form,
            key: '',
            schema: item.schema,
            value: 123,
            list: list,
            item: item,
            key: item.key
        });
    });

    QUnit.test('render() - creates the main element entirely from template, with editor in data-editor placeholder', function(assert) {
        //Create item
        var item = new List.Item({
            template: _.template('<div class="outer"><div class="inner" data-editor></div></div>'),
            list: new List
        }).render();

        //Check there is no wrapper tag
        assert.ok(item.$el.hasClass('outer'));

        //Check editor placed in correct location
        assert.ok(item.editor.$el.parent().hasClass('inner'));
    });

    QUnit.test('getValue() - returns editor value', function(assert) {
        var item = new List.Item({
            list: new List,
            value: 'foo'
        }).render();

        assert.deepEqual(item.editor.getValue(), 'foo');
        assert.deepEqual(item.getValue(), 'foo');
    });

    QUnit.test('setValue() - sets editor value', function(assert) {
        var item = new List.Item({ list: new List }).render();

        item.setValue('woo');

        assert.deepEqual(item.editor.getValue(), 'woo');
        assert.deepEqual(item.getValue(), 'woo');
    });

    QUnit.test('remove() - removes the editor then itself', function(assert) {
        var item = new List.Item({ list: new List }).render();

        var editorSpy = this.sinon.spy(item.editor, 'remove'),
            viewSpy = this.sinon.spy(Backbone.View.prototype.remove, 'call');

        item.remove();

        //Check removed editor
        assert.ok(editorSpy.calledOnce, 'Called editor remove');

        //Check removed main item
        assert.ok(viewSpy.calledWith(item), 'Called parent view remove');
    });

    QUnit.test('validate() - invalid - calls setError and returns error', function(assert) {
        var item = new List.Item({
            list: new List({
                schema: { validators: ['required', 'email'] }
            }),
            value: 'invalid'
        }).render();

        var spy = this.sinon.spy(item, 'setError');

        var err = item.validate();

        assert.deepEqual(err.type, 'email');
        assert.deepEqual(spy.callCount, 1, 'Called setError');
        assert.deepEqual(spy.lastCall.args[0], err, 'Called with error');
    });

    QUnit.test('validate() - valid - calls clearError and returns null', function(assert) {
        var item = new List.Item({
            list: new List({
                schema: { validators: ['required', 'email'] }
            }),
            value: 'valid@example.com'
        }).render();

        var spy = this.sinon.spy(item, 'clearError');

        var err = item.validate();

        assert.deepEqual(err, null);
        assert.deepEqual(spy.callCount, 1, 'Called clearError');
    });

    QUnit.test('setError()', function(assert) {
        var item = new List.Item({ list: new List }).render();

        item.setError({ type: 'errType', message: 'ErrMessage' });

        assert.ok(item.$el.hasClass(List.Item.errorClassName), 'Element has error class');
        assert.deepEqual(item.$el.attr('title'), 'ErrMessage');
    });

    QUnit.test('clearError()', function(assert) {
        var item = new List.Item({ list: new List }).render();

        item.setError({ type: 'errType', message: 'ErrMessage' });

        item.clearError();

        assert.deepEqual(item.$el.hasClass(item.errorClassName), false, 'Error class is removed from element');
        assert.deepEqual(item.$el.attr('title'), undefined);
    });
})();



QUnit.module('List.Modal', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();

        //ModalAdapter interface
        var MockModalAdapter = this.MockModalAdapter = Backbone.View.extend({
            open: function() {},
            close: function() {},
            preventClose: function() {}
        });

        this.sinon.stub(editors.List.Modal, 'ModalAdapter', MockModalAdapter);

        //Create editor to test
        this.editor = new editors.List.Modal({
            form: new Form()
        });

        //Force nestedSchema because this is usually done by Object or NestedModel constructors
        this.editor.nestedSchema = {
            id: { type: 'Number' },
            name: { }
        };
    },

    afterEach: function() {
        this.sinon.restore();
    }
});


QUnit.test('render() - when empty value, opens the modal', function(assert) {
    var editor = this.editor;

    this.sinon.spy(editor, 'openEditor');
    this.sinon.spy(editor, 'renderSummary');

    editor.value = {};

    editor.render();

    assert.equal(editor.openEditor.calledOnce, true);
    assert.equal(editor.renderSummary.called, false);
});

QUnit.test('render() - with value, renders the summary', function(assert) {
    var editor = this.editor;

    this.sinon.spy(editor, 'openEditor');
    this.sinon.spy(editor, 'renderSummary');

    editor.value = { foo: 'bar' };
    editor.render();

    assert.equal(editor.openEditor.called, false);
    assert.equal(editor.renderSummary.calledOnce, true);
});

QUnit.test('renderSummary()', function(assert) {
    var editor = this.editor;

    editor.setValue({ id: 1, name: 'foo' });

    editor.renderSummary();

    assert.equal(editor.$el.html(), '<div>Id: 1<br>Name: foo</div>');
});

QUnit.test('itemToString() - formats an object', function(assert) {
    var editor = this.editor;

    var result = editor.itemToString({ id: 1, name: 'foo' });

    assert.equal(result, 'Id: 1<br />Name: foo');
});

QUnit.test('getStringValue() - when empty', function(assert) {
    this.editor.setValue({});

    assert.equal(this.editor.getStringValue(), '[Empty]');
});

QUnit.test('getStringValue() - with itemToString', function(assert) {
    this.editor.schema.itemToString = function(val) {
        return 'foo';
    }

    this.editor.setValue({ id: 1, name: 'foo' });

    assert.equal(this.editor.getStringValue(), 'foo');
});

QUnit.test('getStringValue() - defaulting to built-in itemToString', function(assert) {
    this.editor.setValue({ id: 1, name: 'foo' });

    assert.equal(this.editor.getStringValue(), 'Id: 1<br />Name: foo');
});

QUnit.test('openEditor() - opens the modal', function(assert) {
    var editor = this.editor,
        value = { id: 1, name: 'foo' };

    editor.setValue(value);

    //Mocks
    this.sinon.spy(this.MockModalAdapter.prototype, 'initialize');
    this.sinon.spy(this.MockModalAdapter.prototype, 'open');

    editor.openEditor();

    assert.ok(editor.modal instanceof this.MockModalAdapter);
    assert.equal(this.MockModalAdapter.prototype.open.calledOnce, true);

    //Check how modal was instantiated
    var optionsArgs = this.MockModalAdapter.prototype.initialize.args[0][0],
        content = optionsArgs.content;

    assert.ok(content instanceof Form);
    assert.equal(content.schema, editor.nestedSchema);
    assert.equal(content.data, value);
});

QUnit.test('openEditor() - triggers open and focus events on the editor', function(assert) {
    var editor = this.editor;

    //Mocks
    var openSpy = this.sinon.spy(),
        focusSpy = this.sinon.spy();

    editor.on('open', openSpy);
    editor.on('focus', focusSpy);

    editor.openEditor();

    assert.equal(openSpy.calledOnce, true);
    assert.equal(focusSpy.calledOnce, true);
});

QUnit.test('openEditor() - responds to modal "cancel" event', function(assert) {
    var editor = this.editor;

    this.sinon.spy(editor, 'onModalClosed');

    editor.openEditor();

    editor.modal.trigger('cancel');

    assert.equal(editor.onModalClosed.calledOnce, true);
});

QUnit.test('openEditor() - responds to modal "ok" event', function(assert) {
    var editor = this.editor;

    this.sinon.spy(editor, 'onModalSubmitted');

    editor.openEditor();

    editor.modal.trigger('ok');

    assert.equal(editor.onModalSubmitted.calledOnce, true);
});

QUnit.test('onModalSubmitted - calls preventClose if validation fails', function(assert) {
    var editor = this.editor;

    editor.openEditor();

    //Mocks
    this.sinon.stub(editor.modalForm, 'validate', function(assert) {
        return 'err';
    });

    this.sinon.spy(editor.modal, 'preventClose');

    //Run
    editor.onModalSubmitted();

    //Test
    assert.ok(editor.modal.preventClose.calledOnce);
});

QUnit.test('onModalSubmitted - sets editor value and renders the summary', function(assert) {
    var editor = this.editor;

    editor.openEditor();

    //Mocks
    this.sinon.stub(editor.modalForm, 'getValue', function(assert) {
        return { foo: 'bar' };
    });

    this.sinon.spy(editor, 'renderSummary');

    //Run
    editor.onModalSubmitted();

    //Test
    assert.ok(editor.renderSummary.calledOnce);
    assert.deepEqual(editor.value, { foo: 'bar' });
});

QUnit.test('onModalSubmitted - triggers "readyToAdd" if this is a new item (no previous value)', function(assert) {
    var editor = this.editor;

    editor.value = null;

    editor.openEditor();

    //Mocks
    var readyToAddSpy = this.sinon.spy();
    editor.on('readyToAdd', readyToAddSpy)

    //Run
    editor.onModalSubmitted();

    //Test
    assert.ok(readyToAddSpy.calledOnce);
});

QUnit.test('onModalSubmitted - triggers "change" and calls onModalClosed', function(assert) {
    var editor = this.editor;

    editor.openEditor();

    //Mocks
    var changeSpy = this.sinon.spy();
    editor.on('change', changeSpy);

    this.sinon.spy(editor, 'onModalClosed');

    //Run
    editor.onModalSubmitted();

    //Test
    assert.ok(changeSpy.calledOnce);
    assert.ok(editor.onModalClosed.calledOnce);
});

QUnit.test('onModalClosed - triggers events and clears modal references', function(assert) {
    var editor = this.editor;

    editor.openEditor();

    var closeSpy = this.sinon.spy();
    editor.on('close', closeSpy);

    var blurSpy = this.sinon.spy();
    editor.on('blur', blurSpy);

    editor.onModalClosed();

    assert.equal(editor.modal, null);
    assert.equal(editor.modalForm, null);

    assert.ok(closeSpy.calledOnce);
    assert.ok(blurSpy.calledOnce);
});

QUnit.test('getValue()', function(assert) {
    this.editor.value = { foo: 'bar' };

    assert.equal(this.editor.getValue(), this.editor.value);
});

QUnit.test('setValue()', function(assert) {
    var value = { foo: 'bar' };

    this.editor.setValue(value);

    assert.equal(this.editor.value, value);
});

QUnit.test("focus() - opens the modal", function(assert) {
    var editor = this.editor;

    this.sinon.spy(editor, 'openEditor');

    editor.focus();

    assert.ok(editor.openEditor.calledOnce);
});

QUnit.test("focus() - triggers the 'focus' event", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.focus();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
    assert.ok(editor.hasFocus);
});

QUnit.test("blur() - closes the modal", function(assert) {
    var editor = this.editor;

    editor.focus();

    editor.blur()

    assert.ok(!editor.modal);
    assert.ok(!editor.hasFocus);
});

QUnit.test("blur() - triggers the 'blur' event", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.focus();

    editor.on('blur', spy);

    editor.blur();

    assert.ok(spy.called);
    assert.ok(spy.calledWith(editor));
});

QUnit.test("'change' event - is triggered when the modal is submitted", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.openEditor();

    editor.on('blur', spy);

    editor.modal.trigger('ok');

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
});

QUnit.test("'focus' event - is triggered when the modal is opened", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('focus', spy);

    editor.openEditor();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
});

QUnit.test("'blur' event - is triggered when the modal is closed", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.openEditor();

    editor.on('blur', spy);

    editor.modal.trigger('cancel');

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
});

QUnit.test("'open' event - is triggered when the modal is opened", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.on('open', spy);

    editor.openEditor();

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
});

QUnit.test("'close' event - is triggered when the modal is closed", function(assert) {
    var editor = this.editor,
        spy = this.sinon.spy();

    editor.openEditor();

    editor.on('close', spy);

    editor.modal.trigger('cancel');

    assert.ok(spy.calledOnce);
    assert.ok(spy.alwaysCalledWith(editor));
});




QUnit.module('List.Object', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();

        //ModalAdapter interface
        var MockModalAdapter = this.MockModalAdapter = Backbone.View.extend({
            open: function() {},
            close: function() {},
            preventClose: function() {}
        });

        this.sinon.stub(editors.List.Modal, 'ModalAdapter', MockModalAdapter);

        //Create editor to test
        this.editor = new editors.List.Object({
            form: new Form(),
            schema: {
                subSchema: {
                    id: { type: 'Number' },
                    name: { }
                }
            }
        });
    },

    afterEach: function() {
        this.sinon.restore();
    }
});

QUnit.test('initialize() - sets the nestedSchema', function(assert) {
    assert.deepEqual(_.keys(this.editor.nestedSchema), ['id', 'name']);
});




QUnit.module('[List.]NestedModel', {
    beforeEach: function() {
        this.sinon = sinon.sandbox.create();

        //ModalAdapter interface
        var MockModalAdapter = this.MockModalAdapter = Backbone.View.extend({
            open: function() {},
            close: function() {},
            preventClose: function() {}
        });

        this.sinon.stub(editors.List.Modal, 'ModalAdapter', MockModalAdapter);

        //Create editor to test
        this.Model = Backbone.Model.extend({
            schema: {
                id: { type: 'Number' },
                name: { }
            }
        });

        this.editor = new editors.NestedModel({
            form: new Form(),
            schema: {
                model: this.Model
            }
        });
    },

    afterEach: function() {
        this.sinon.restore();
    }
});

QUnit.test('initialize() - sets the nestedSchema, when schema is object', function(assert) {
    var Model = Backbone.Model.extend({
        schema: {
            id: { type: 'Number' },
            name: { }
        }
    });

    var editor = new editors.NestedModel({
        form: new Form(),
        schema: {
            model: Model
        }
    });

    assert.deepEqual(_.keys(editor.nestedSchema), ['id', 'name']);
});

QUnit.test('initialize() - sets the nestedSchema, when schema is function', function(assert) {
    var Model = Backbone.Model.extend({
        schema: function() {
            return {
                id: { type: 'Number' },
                name: { }
            }
        }
    });

    var editor = new editors.NestedModel({
        form: new Form(),
        schema: {
            model: Model
        }
    });

    assert.deepEqual(_.keys(editor.nestedSchema), ['id', 'name']);
});

/*
QUnit.test('Check validation of list nested models', function(assert) {

    //Save proto for restoring after the test otherwise next fails alternately.
    var tmpNestedModel = Backbone.Form.editors.NestedModel;

     Backbone.Form.editors.NestedModel = Backbone.Form.editors.NestedModel;
     var NestedModel = Backbone.Model.extend({
       schema: {
         name: { validators: ['required']},
      }
     });
     var schema = {
       nestedModelList: { type: 'List', itemType: 'NestedModel', model: NestedModel }
     };
     var form = new Backbone.Form({
       schema: schema,
     }).render();

     Backbone.Form.editors.NestedModel = tmpNestedModel;

     assert.deepEqual(_.keys(form.validate().nestedModelList.errors[0]), ['name']);
});

QUnit.test('getStringValue() - uses model.toString() if available', function(assert) {
    this.Model.prototype.toString = function() {
        return 'foo!';
    }

    this.editor.setValue({ id: 1, name: 'foo' });

    assert.equal(this.editor.getStringValue(), 'foo!');
});
*/

})(Backbone.Form, Backbone.Form.Field, Backbone.Form.editors);
