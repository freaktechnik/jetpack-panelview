/*
 * panelview
 * An SDK Module to create subview panels introduced in Australis
 * Heavily inspired by the SDK panel module
 * Created by Martin Giger
 * Licensed under the GPLv3
 */

//NOTES
// ViewShowing event on subview when it is showing
// ViewHiding when it is dismissed

"use strict";

const panelviewElement = require("./utils");
const { Class } = require("sdk/core/heritage");
const { EventTarget } = require("sdk/event/target");
const { Disposable } = require("sdk/core/disposable");

var elements = new WeakMap();

const PanelView = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    setup: function(options) {
        let element = panelviewElement.make();
        element.setAttribute("id", options.id);
        panelviewElement.setHeader(element, options.title);
        panelviewElement.addActions(element, options.content);
        if(options.hasOwnProperty("footer"))
            panelviewElement.setFooter(element, options.footer);

        elements.set(this, element);
    },
    dispose: function() {
        if(this.isShowing())
            this.hide();
        panelviewElement.dispose(elements.get(this));
    },
    get id() {
        return elements.get(this).getAttribute("id");
    },
    show: function(button) {
        if(!button)
            throw "A subview can only be displayed with a button as anchor";
        else
            panelviewElement.show(elements.get(this), button);
    },
    isShowing: function() {
        return panelviewElement.isShowing(elements.get(this));
    },
    hide: function() {
        panelviewElement.hide();
    }
});
exports.PanelView = PanelView;
