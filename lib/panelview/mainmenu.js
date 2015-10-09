/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

//TODO e10s?

"use strict";

const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");
const { when } = require("sdk/dom/events");

const MAIN_VIEW = "main";
const SUB_VIEW = "subview";

exports.MAIN_VIEW = MAIN_VIEW;
exports.SUB_VIEW = SUB_VIEW;

const MainMenu = {
    contains: function(button) {
        return CustomizableUI.getPlacementOfWidget(getNodeView(button).id).area === CustomizableUI.AREA_PANEL;
    },
    isOpen: function(window = getMostRecentBrowserWindow()) {
        let state = window.PanelUI.panel.state;
        return state == "open" || state == "showing";
    },
    open: function(window = getMostRecentBrowserWindow()) {
        return window.PanelUI.show();
    },
    showMainView: function(window = getMostRecentBrowserWindow()) {
        if(!this.isOpen(window))
            this.open(window);

        window.PanelUI.showMainView();
    },
    close: function(window = getMostRecentBrowserWindow()) {
        let promise = when(window.PanelUI.panel, "popuphidden", false);
        window.PanelUI.hide();
        return promise;
    },
    get view() {
        let window = getMostRecentBrowserWindow();
        if(!window.PanelUI.multiView.showingSubView)
            return MAIN_VIEW;
        else
            return SUB_VIEW;
    }
};
exports.MainMenu = MainMenu;
