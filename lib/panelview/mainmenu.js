/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

const { Cu } = require('chrome');
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = Cu.import('resource:///modules/CustomizableUI.jsm', {});
const { getNodeView } = require("sdk/view/core");

const MainMenu = {
    contains: function(button) {
        return CustomizableUI.getPlacementOfWidget(getNodeView(button).id).area == CustomizableUI.AREA_PANEL;
    },
    isOpen: function(window) {
        window = window || getMostRecentBrowserWindow();
        let { state } = window.PanelUI.panel;
        return state == "open" || state == "showing";
    },
    open: function(window) {
        window = window || getMostRecentBrowserWindow();
        window.PanelUI.show();
    },
    showMainView: function(window) {
        window = window || getMostRecentBrowserWindow();
        if(this.isOpen(window))
            this.open(window);

        window.PanelUI.showMainView();
    },
    close: function(window) {
        window = window || getMostRecentBrowserWindow();
        window.PanelUI.hide();
    }
};
exports.MainMenu = MainMenu;
