/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * panelview
 * An SDK Module to create subview panels introduced in Australis
 * Heavily inspired by the SDK panel module
 * Created by Martin Giger
 */

//TODO e10s

"use strict";

const panelviewElement = require("./panelview/utils");
const { Class } = require("sdk/core/heritage");
const { EventTarget } = require("sdk/event/target");
const { Disposable } = require("sdk/core/disposable");
const { emit, setListeners } = require("sdk/event/core");
const { ToggleButton, ActionButton } = require("sdk/ui");
const { panelviewContract } = require("./panelview/contract");
const { viewFor : vf } = require("sdk/view/core");
const { when } = require("sdk/event/utils");

let views = new WeakMap();
let models = new WeakMap();

let viewFor = (panelview) => views.get(panelview);
let modelFor = (panelview) => models.get(panelview);

const VIEW_SHOWING = "ViewShowing";
const VIEW_HIDING = "ViewHiding";

let listeners = [ VIEW_SHOWING, VIEW_HIDING ];

const PanelView = Class({
    extends: EventTarget,
    implements: [
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
        listeners.forEach((event) => element.addEventListener(event, this, false));

        // set up disposable
        setListeners(this, options);

        views.set(this, element);

        models.set(this, { isShowing: false, id: options.id, content: options.content });
    },
    dispose: function() {
        this.hide();

        // clean up event listeners
        listeners.forEach((event) => viewFor(this).removeEventListener(event, this, false));

        panelviewElement.dispose(viewFor(this));

        views.delete(this);
    },
    get id() {
        return modelFor(this).id;
    },
    get content() {
        return modelFor(this).content;
    },
    set content(val) {
        let el = viewFor(this);
        panelviewElement.removeActions(el);
        panelviewElement.addActions(el, val);
        modelFor(this).content = val;
    },
    handleEvent: function(event) {
        if(event.type == VIEW_SHOWING) {
            modelFor(this).isShowing = true;
            emit(this, "show", event.detail);
        }
        else if(event.type == VIEW_HIDING) {
            modelFor(this).isShowing = false;
            emit(this, "hide", event.detail);
        }
    },
    show: function(button) {
        let promise = when(this, "show");
        if(!button || !(button instanceof ToggleButton || button instanceof ActionButton))
            throw new Error("A subview can only be displayed with a button as anchor");
        else
            panelviewElement.show(viewFor(this), button);

        return promise;
    },
    get isShowing() {
        return modelFor(this).isShowing;
    },
    hide: function(closePanel) {
        let promise = when(this, "hide");
        panelviewElement.hide(viewFor(this), closePanel);
        return promise;
    }
});
exports.PanelView = PanelView;

vf.define(PanelView, viewFor);
