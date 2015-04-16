/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { MainMenu } = require("../lib/panelview/mainmenu");
const { ActionButton } = require("sdk/ui");
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { setTimeout } = require("sdk/timers");

const { env } = require("sdk/system");
const TIMEOUT = env.TRAVIS ? 800 : 200;

exports.testMainMenu = function(assert, done) {
    assert.ok(!MainMenu.isOpen(), "Menu isn't already open");
    getMostRecentBrowserWindow().PanelUI.panel.addEventListener("popupshown", function onPopupShown() {
        this.removeEventListener("popupshown", onPopupShown);
        setTimeout(function () {
            assert.ok(MainMenu.isOpen(), "Menu opend");

            this.addEventListener("popuphidden", function onPopupHidden() {
                this.removeEventListener("popuphidden", onPopupHidden);
                setTimeout(function() {
                    assert.ok(!MainMenu.isOpen(), "Menu closed");
                    done();
                }, TIMEOUT);
            });

            MainMenu.close();
        }, TIMEOUT);
    });

    MainMenu.open();
};

exports.testContains = function(assert) {
    let button = ActionButton({
        id: "test-mainmenu-button",
        label: "Test button",
        icon: module.uri.replace(/[^\.\\\/]*\.js$/, "test-icon.png")
    });

    assert.notEqual(CustomizableUI.getPlacementOfWidget(getNodeView(button).id).area, CustomizableUI.AREA_PANEL, "Button is already in menu panel");
    assert.ok(!MainMenu.contains(button), "Button was detected in Panel, even though it isn't in there");

    // move button to menu panel
    CustomizableUI.addWidgetToArea(getNodeView(button).id, CustomizableUI.AREA_PANEL);
    assert.equal(CustomizableUI.getPlacementOfWidget(getNodeView(button).id).area, CustomizableUI.AREA_PANEL, "Button was not moved into the menu panel");

    assert.ok(MainMenu.contains(button), "Button not detected in Panel");

    button.destroy();
}

require('sdk/test').run(exports);
