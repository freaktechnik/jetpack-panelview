/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");

const MAIN_VIEW = exports.MAIN_VIEW = "main";
const SUB_VIEW = exports.SUB_VIEW = "subview";

const MainMenu = {
    contains: function(button) {
        return CustomizableUI.getPlacementOfWidget(getNodeView(button).id).area == CustomizableUI.AREA_PANEL;
    },
    isOpen: function(window = getMostRecentBrowserWindow()) {
        let { state } = window.PanelUI.panel;
        return state == "open" || state == "showing";
    },
    open: function(window = getMostRecentBrowserWindow()) {
        window.PanelUI.show();
    },
    showMainView: function(window = getMostRecentBrowserWindow()) {
        if(this.isOpen(window))
            this.open(window);

        window.PanelUI.showMainView();
    },
    close: function(window = getMostRecentBrowserWindow()) {
        window.PanelUI.hide();
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
