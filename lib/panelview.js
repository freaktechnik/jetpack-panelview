/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * panelview
 * An SDK Module to create subview panels introduced in Australis
 * Heavily inspired by the SDK panel module
 * Created by Martin Giger
 */

"use strict";

const panelviewElement = require("./panelview/utils");
const { Class } = require("sdk/core/heritage");
const { EventTarget } = require("sdk/event/target");
const { Disposable } = require("sdk/core/disposable");
const { emit } = require("sdk/event/core");
const { removeListener, on } = require("sdk/dom/events");
const { ToggleButton, ActionButton } = require("sdk/ui");
const { panelviewContract } = require("./panelview/contract");

var views = new WeakMap();

function viewFor(panelview) views.get(panelview)

const PanelView = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    setup: function(options) {
        options = panelviewContract(options);
        let element = panelviewElement.make();
        element.setAttribute("id", options.id);
        panelviewElement.setHeader(element, options.title);
        panelviewElement.addActions(element, options.content);
        if(options.hasOwnProperty("footer"))
            panelviewElement.setFooter(element, options.footer);

        on(element, "ViewShowing", this);
        on(element, "ViewHiding", this);

        views.set(this, element);
    },
    dispose: function() {
        this.hide();

        removeListener(viewFor(this), "ViewShowing", this);
        removeListener(viewFor(this), "ViewHiding", this);
        panelviewElement.dispose(viewFor(this));

        views.delete(this);
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
        if(!button || !(button instanceof ToggleButton || button instanceof ActionButton))
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
