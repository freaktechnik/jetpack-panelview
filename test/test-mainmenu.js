/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { MainMenu } = require("../lib/panelview/mainmenu");
const { ActionButton } = require("sdk/ui");
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { setTimeout } = require("sdk/timers");
const { wait } = require("./event/helpers");
const { env } = require("sdk/system");
const TIMEOUT = env.TRAVIS ? 800 : 200;

getMostRecentBrowserWindow().PanelUI.disableSingleSubviewPanelAnimations();

exports.testMainMenu = function*(assert) {
    let window = getMostRecentBrowserWindow();
    yield window.PanelUI.ensureReady();

    assert.ok(!MainMenu.isOpen(window), "Menu isn't already open");

    yield MainMenu.open(window);
    yield wait(TIMEOUT);
    assert.ok(MainMenu.isOpen(window), "Menu opened");

    yield MainMenu.close(window);
    yield wait(TIMEOUT);

    assert.ok(!MainMenu.isOpen(window), "Menu closed");
};

exports.testContains = function(assert) {
    let button = ActionButton({
        id: "test-mainmenu-button",
        label: "Test button",
        icon: module.uri.replace(/[^\.\\\/]*\.js$/, "test-icon.png")
    });
    let buttonId = getNodeView(button).id;

    assert.notEqual(CustomizableUI.getPlacementOfWidget(buttonId).area, CustomizableUI.AREA_PANEL, "Button is already in menu panel");
    assert.ok(!MainMenu.contains(button), "Button was detected in Panel, even though it isn't in there");

    // move button to menu panel
    CustomizableUI.addWidgetToArea(buttonId, CustomizableUI.AREA_PANEL);
    assert.equal(CustomizableUI.getPlacementOfWidget(buttonId).area, CustomizableUI.AREA_PANEL, "Button was not moved into the menu panel");

    assert.ok(MainMenu.contains(button), "Button not detected in Panel");

    button.destroy();
}

require('sdk/test').run(exports);
