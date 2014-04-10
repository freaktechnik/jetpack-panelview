/*
 * panelview
 * An SDK Module to create subview panels introduced in Australis
 * Heavily inspired by the SDK panel module
 * Created by Martin Giger
 * Licensed under the GPLv3
 */

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
        panelviewElement.addActions(element, options.actions);
        if(options.hasOwnAttribute("footer"))
            panelviewElement.setFooter(element, options.footer);

        elementss.set(this, element);
    },
    dispose: function() {
        this.hide();
        panelviewElement.dispose(element.get(this));
    },
    get id() {
        return elements.get(this).id
    },
    show: function(button) {
        if(!button)
            throw "A subview can only be displayed with a button as anchor";
        else
            panelviewElement.show(elements.get(this), button);
    },
    hide: function() {
        panelviewElement.hide();
    }
});
exports.PanelView = PanelView;
