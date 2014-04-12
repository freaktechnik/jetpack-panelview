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
const { getActiveView } = require("sdk/view/core");

var views = new WeakMap();

function viewFor(panelview) views.get(panelview)

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

        views.set(this, element);
    },
    dispose: function() {
        this.hide();

        viewFor(this).removeEventListener("viewShowing", this);
        viewFor(this).removeEventListener("ViewHiding", this);
        panelviewElement.dispose(viewFor(this));
    },
    get id() {
        return viewFor(this).getAttribute("id");
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
            panelviewElement.show(viewFor(this), button);
    },
    isShowing: function() {
        return panelviewElement.isShowing(viewFor(this));
    },
    hide: function() {
        panelviewElement.hide(viewFor(this));
    }
});
exports.PanelView = PanelView;

getActiveView.define(PanelView, viewFor);
