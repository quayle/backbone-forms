;(function(Form) {

  Form.editors.Table = Form.editors.Base.extend({
    events: {
        'click [data-action="add"]': function(event) {
            event.preventDefault();
            this.addItem(undefined, true);
        }
    },

    initialize: function(options) {
        options = options || {};

        var editors = Form.editors;

        editors.Base.prototype.initialize.call(this, options);

        var schema = this.schema;
        if (!schema) throw new Error("Missing required option 'schema'");

        this.schema = _.extend({
            addLabel: 'Add'
        }, schema);

        this.template = options.template || this.constructor.template;

        //Determine the editor to use
        this.Editor = (function() {
            var type = /*schema.itemType || */'RowObject';

            if (!type) {
                throw new Error('Unhandled');
            };

            if (editors.Table[type]) {
                return editors.Table[type];
            }

            return editors[type];
        })();

        this.items = [];
    },

    render: function() {
        var self = this,
            value = this.value || [],
            $ = Backbone.$;

        //Create main element
        var $el = $($.trim(this.template({
            addLabel: this.schema.addLabel
        })));

        this.$list = $el.is('[data-rows]') ?
            $el :
            $el.find('[data-rows]')
        ;

        if (value instanceof Backbone.Collection) {
            value = value.toJSON();
        }
        //Add existing items
        if (value.length) {
            _.each(value, function(itemValue) {
                self.addItem(itemValue);
            });
        }

        //If no existing items create an empty one, unless the editor specifies otherwise
        else {
            if (!this.Editor.isAsync) this.addItem();
        }

        this.setElement($el);
        this.$el.attr('id', this.id);
        this.$el.attr('name', this.key);

        if (this.hasFocus) this.trigger('blur', this);

        return this;
    },

    addItem: function(value, userInitiated) {
        var self = this,
            editors = Form.editors;

        //Create the item
        var item = new this.Editor({
            list: this,
            form: this.form,
            schema: this.schema,
            value: value,
            Editor: this.Editor,
            key: this.key,
            itemNo: self.items.length,
            idPrefix: [ this.id, self.items.length ].join('_') + '_'
        }).render();

        var _addItem = function() {
            self.items.push(item);
            self.$list.append(item.el);

            item.on('all', function(event) {
                if (event === 'change') return;

                // args = ["key:change", itemEditor, fieldEditor]
                var args = _.toArray(arguments);
                args[0] = 'item:' + event;
                args.splice(1, 0, self);
                // args = ["item:key:change", this=listEditor, itemEditor, fieldEditor]

                editors.Table.prototype.trigger.apply(this, args);
            }, self);

            item.on('change', function() {
                if (!item.addEventTriggered) {
                    item.addEventTriggered = true;
                    this.trigger('add', this, item);
                }
                this.trigger('item:change', this, item);
                this.trigger('change', this);
            }, self);

            item.on('focus', function() {
                if (this.hasFocus) return;
                this.trigger('focus', this);
            }, self);
            item.on('blur', function() {
                if (!this.hasFocus) return;
                var self = this;
                setTimeout(function() {
                    if (_.find(self.items, function(item) {
                        return item.hasFocus;
                    })) {
                        return;
                    }
                    self.trigger('blur', self);
                }, 0);
            }, self);

            if (userInitiated || value) {
                item.addEventTriggered = true;
            }

            if (userInitiated) {
                self.trigger('add', self, item);
                self.trigger('change', self);
            }
        };

        //Check if we need to wait for the item to complete before adding to the list
        if (this.Editor.isAsync) {
            item.on('readyToAdd', _addItem, this);
        }

        //Most editors can be added automatically
        else {
            _addItem();
            item.focus();
        }

        return item;
    },

    removeItem: function(item) {
        //Confirm delete
        var confirmMsg = this.schema.confirmDelete;
        if (confirmMsg && !confirm(confirmMsg)) return;

        var index = _.indexOf(this.items, item);

        this.items[index].remove();
        this.items.splice(index, 1);

        if (item.addEventTriggered) {
            this.trigger('remove', this, item);
            this.trigger('change', this);
        }

        if (!this.items.length && !this.Editor.isAsync) {
            this.addItem();
        }
    },

    remove: function() {
      _.invoke(this.items, 'remove');

      Form.editors.Base.prototype.remove.call(this);
    },

    getValue: function() {
        var values = _.map(this.items, function(item) {
            return item.getValue();
        });

        //Filter empty items
        return _.without(values, undefined, '');
    },

    setValue: function(value) {
        var items = this.items;
        _.each(value, function(v, i) {
            if (items[i]) {
                items[i].setValue(v);
            }
        });

        this.value = value;
        this.render();
    },
}, {
    template:_.template('\
        <table>\
            <tbody data-rows></tbody>\
            <tfoot>\
                <tr>\
                    <td>\
                        <button type="button" data-action="add"><%= addLabel %></button>\
                    </td>\
                </tr>\
            </tfoot>\
        </table>\
    ', null, Form.templateSettings)
});

Form.editors.Table.RowObject = Form.editors.Base.extend({
    events: {
        'click [data-action="remove"]': function(event) {
            event.preventDefault();
            this.list.removeItem(this);
        },
    },

    initialize: function(options) {
        var options = options || {};
        options = this.options = _.extend({
            removeButton: true,
            itemNo: 0
        }, options);

        this.list = options.list;
        this.value = options.value || {};

        this.idPrefix = options.idPrefix || [ options.key, options.itemNo ].join('_') + '_';

        //Init
        Form.editors.Base.prototype.initialize.call(this, options);

        //Check required options
        if (!this.form) throw new Error('Missing required option "form"');
        if (!this.schema.subSchema) throw new Error("Missing required 'schema.subSchema' option for Object editor");

        var constructor = this.constructor;
        this.template = options.template || this.template || constructor.template;
        this.Field = options.Field || this.Field || constructor.Field;

        var schema = this.schema.subSchema;

        var selectedFields = this.selectedFields = options.fields || _.keys(schema);

        var fields = this.fields = {};

        _.each(selectedFields, function(key) {
            var fieldSchema = schema[key];
            fields[key] = this.createField(key, fieldSchema);
            fields[key].setValue(this.value[key]);
            fields[key].render();
        }, this);
        ;
    },

    createField: function(key, schema) {
        return Backbone.Form.prototype.createField.call(this, key, schema);
    },

    templateData: function() {
        var options = this.options;

        return {
            removeButton: options.removeButton
        }
    },

    render: function() {
        var self = this,
            fields = this.fields,
            $ = Backbone.$;

        //Render form
        var $form = $($.trim(this.template(_.result(this, 'templateData'))));

        //Render standalone fields
        $form.find('[data-fields]').add($form).each(function(i, el) {
            var $container = $(el),
                selection = $container.attr('data-fields');

            if (_.isUndefined(selection)) return;

            //Work out which fields to include
            var keys = (selection == '*' || selection == '')
                ? self.selectedFields || _.keys(fields)
                : selection.split(',');

            //Add them
            _.each(keys, function(key) {
                var field = fields[key];

                $container.append(field.el);
            });
        });

        //Set the main element
        this.setElement($form);

        //Set class
        $form.addClass(this.className);

        //Set attributes
        if (this.attributes) {
            $form.attr(this.attributes)
        }

        return this;
    },

    getValue: function() {
        return Backbone.Form.prototype.getValue.apply(this, arguments);
    },

    setValue: function() {
        Backbone.Form.prototype.setValue.apply(this, arguments);
    },

    focus: function() {
//         throw new Error('Not implemented');
    },
    blur: function() {
//         throw new Error('Not implemented');
    }
}, {
    //STATICS
    template: _.template('\
        <tr data-fields>\
            <% if (removeButton) { %>\
            <td><button type="button" data-action="remove">&times;</button></td>\
            <% } %>\
        </tr>\
    ', null, this.templateSettings),
    Field: Form.Field.extend({}, {
        template: _.template('\
            <td>\
                <label for="<%= editorId %>"><%= title %></label>\
                <div>\
                    <span data-editor></span>\
                    <div data-error></div>\
                    <div><%= help %></div>\
                </div>\
            </td>\
        ', null, this.templateSettings),
    })
});

})(Backbone.Form);
