"use strict";

angular.module('swot').directive('ckedit', function ($parse) {
    CKEDITOR.disableAutoInline = true;
    var counter = 0,
    prefix = '__ckd_';
 
    return {
        restrict: 'A',
        link: function (scope, element, attrs, controller) {
            var getter = $parse(attrs.ckedit),
                setter = getter.assign;
 
            attrs.$set('contenteditable', true); // inline ckeditor needs this
            if (!attrs.id) {
                attrs.$set('id', prefix + (++counter));
            }

            // Function to update the model based on editor contents. Requires the 'event' argument
            // passed by CKEditor-generated events.
            var updateModel = function (e) {
                if (e.editor.checkDirty()) {
                    var ckValue = e.editor.getData();
                    scope.$apply(function () {
                        setter(scope, ckValue);
                    });
                    ckValue = null;
                    e.editor.resetDirty();
                }
            };
 
            // CKEditor stuff
            // Override the normal CKEditor save plugin
 
            CKEDITOR.plugins.registered['save'] =
            {
                init: function (editor) {
                    editor.addCommand('save',
                        {
                            modes: { wysiwyg: 1, source: 1 },
                            exec: function (editor) {
                                if (editor.checkDirty()) {
                                    var ckValue = editor.getData();
                                    scope.$apply(function () {
                                        setter(scope, ckValue);
                                    });
                                    ckValue = null;
                                    editor.resetDirty();
                                }
                            }
                        }
                    );
                    editor.ui.addButton('Save', { label: 'Save', command: 'save', toolbar: 'document' });
                }
            };
            var options = {};
            options.on = {
                blur: updateModel,
                change: updateModel
            };
            //options.extraPlugins = 'sourcedialog';
            //options.removePlugins = 'sourcearea';
            options.title = false;
            var editorangular = CKEDITOR.inline(element[0], options); //invoke
 
            scope.$watch(attrs.ckedit, function (value) {
                if (editorangular.getData() !== value) {
                    editorangular.setData(value);
                }
            });
        }
    }
 
});
