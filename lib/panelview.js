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
const { emit } = require("sdk/event/core");

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

        element.addEventListener("ViewShowing", this);
        element.addEventListener("ViewHiding", this);

        elements.set(this, element);
    },
    dispose: function() {
        if(this.isShowing())
            this.hide();

        elements.get(this).removeEventListener("ViewShowing", this);
        elements.get(this).removeEventListener("ViewHiding", this);
        panelviewElement.dispose(elements.get(this));
    },
    get id() {
        return elements.get(this).getAttribute("id");
    },
    handleEvent: function(event) {
        if(event.type == "ViewShowing")
            emit(this, "show", event.detail);
        else if(event.type == "ViewHiding")
            emit(this, "hide", event.detail);
    },
    show: function(button) {
        if(!button)
            throw new Error("A subview can only be displayed with a button as anchor");
        else
            panelviewElement.show(elements.get(this), button);
    },
    isShowing: function() {
        return panelviewElement.isShowing(elements.get(this));
    },
    hide: function() {
        panelviewElement.hide(elements.get(this));
    }
});
exports.PanelView = PanelView;
