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
const { emit, setListeners } = require("sdk/event/core");
const { removeListener, on } = require("sdk/dom/events");
const { ToggleButton, ActionButton } = require("sdk/ui");
const { panelviewContract } = require("./panelview/contract");

var views = new WeakMap();

function viewFor(panelview) {
    return views.get(panelview);
}

const PanelView = Class({
    implements: [
        EventTarget,
        Disposable
    ],
    setup: function(options) {
        // check if the options are valid
        options = panelviewContract(options);

        // create the panelview element
        let element = panelviewElement.make();

        // set the attributes & content of the element
        element.setAttribute("id", options.id);
        panelviewElement.setHeader(element, options.title);
        panelviewElement.addActions(element, options.content);
        if(options.hasOwnProperty("footer"))
            panelviewElement.setFooter(element, options.footer);

        // setup event listeners
        on(element, "ViewShowing", this);
        on(element, "ViewHiding", this);
        setListeners(this, options);

        views.set(this, element);
    },
    dispose: function() {
        this.hide();

        // clean up event listeners
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
    get isShowing() {
        return panelviewElement.isShowing(viewFor(this));
    },
    hide: function(closePanel) {
        panelviewElement.hide(viewFor(this), closePanel);
    }
});
exports.PanelView = PanelView;