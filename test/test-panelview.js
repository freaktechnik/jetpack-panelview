/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { PanelView } = require("../lib/panelview");
const { ActionButton } = require ("sdk/ui");
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");
const { MainMenu } = require("../lib/panelview/mainmenu");
const { setTimeout, removeTimeout } = require("sdk/timers");
const { browserWindows } = require("sdk/windows");
const workaround = require("../lib/panelview/workaround");

//yes, I feel dirty for doing this.
var buttonTest = "waiting";

function createPanelView(testId) {
    return PanelView({
        id: testId,
        title: 'testView',
        content: [
            {
                label: 'an action',
                type: 'button',
                onClick: function() {
                    buttonTest = "successful";
                }
                //TODO test icon
            },
            {
                type: 'separator'
            },
            {
                label: 'a checkbox',
                type: 'button',
                actionType: 'checkbox',
                onClick: function() {
                    //nothing
                }
            }
        ],
        footer: {
            label: 'footer',
            onClick: function() {
                buttonTest = "footer";
            }
        }
    });
}

function createActionButton(buttonId) {
    return ActionButton({
        id: buttonId,
        label: "Test button",
        icon: module.uri.replace(/[^\.\\\/]*\.js$/, "test-icon.png")
    });
}

function moveButtonToMenu(button) {
    // move button to menu panel
    workaround.applyButtonFix(button);
    CustomizableUI.addWidgetToArea(getNodeView(button).id, CustomizableUI.AREA_PANEL);
}

exports.testContract = function(assert) {
    //copied from test-ui-action-button
    assert.throws(
    () => PanelView({}),
    /^The option/,
    'throws on no option given');

  // Test no title
  assert.throws(
    () => PanelView({ id: 'my-button', content: [ { type: 'button'} ] }),
    /^The option "label"/,
    'throws on no title given');

  // Test no id
  assert.throws(
    () => PanelView({ title: 'my button', content: [ { type: 'button'} ] }),
    /^The option "id"/,
    'throws on no id given');

  // Test no content
  assert.throws(
    () => PanelView({ id: 'my-button', title: 'my button' }),
    /^The content item array/,
    'throws on no content given');


  // Test empty title
  assert.throws(
    () => PanelView({ id: 'my-button', title: '', content: [ { type: 'button'} ] }),
    /^The option "label"/,
    'throws on no valid title given');

  // Test invalid id
  assert.throws(
    () => PanelView({ id: 'my button', title: 'my button', content: [ { type: 'button'} ] }),
    /^The option "id"/,
    'throws on no valid id given');

  // Test empty id
  assert.throws(
    () => PanelView({ id: '', title: 'my button', content: [ { type: 'button'} ] }),
    /^The option "id"/,
    'throws on no valid id given');

  // Test invalid empty content array
  assert.throws(
    () => PanelView({ id: 'my-button', title: 'my button', content: [] }),
    /^The content item array/,
    'throws on no valid content given');

  // Test unknown content type
  assert.throws(
    () => PanelView({ id: 'my-button', title: 'my button', content: [ { type: 'frame' } ] }),
    /^The option "type"/,
    'throws on no valid content type');

  // Test only a separator
  assert.throws(
    () => PanelView({ id: 'my-panelview', title: 'my panelview', content: [ { type: 'separator' } ] }),
    /^The content item array/,
    'throws on only a separator as content');

  // Test footer
  assert.throws(
    () => PanelView({ id: 'my-panelview', title: 'my panelview', content: [ { type: 'button' } ], footer: 'footer' }),
    /^The footer/,
    'throws on no footer object');

  // Test footer without function
  assert.throws(
    () => PanelView({ id: 'my-panelview', title: 'my panelview', content: [ { type: 'button' } ], footer: { label: 'footer' } }),
    /^The option "onClick"/,
    'throws on no footer onClick function');

  // Test footer without label
  assert.throws(
    () => PanelView({ id: 'my-panelview', title: 'my panelview', content: [ { type: 'button' } ], footer: { onClick: function() {} } }),
    /^The option "label"/,
    'throws on no footer label');

    var pva, pvb;
    try {
        pva = PanelView({
            id:'test-panelview-content-a',
            title:'Another Panelview',
            content: [
                {
                    label: "invalid content item"
                }
            ]
        });
    }
    catch(e) {
        assert.pass("Creating a view with an invalid content item throws an error");
    }
    finally {
        if(pva)
            pva.destroy();
    }

    try {
        pvb = PanelView({
            id:'test-panelview-content-b',
            title:'Yet Another Panelview',
            content: [
                {
                    label: "content item with unsupported type",
                    type: "menu"
                }
            ]
        });
    }
    catch(e) {
        assert.pass("Creating a view with a content item with an unsuported type throws an error");
    }
    finally {
        if(pvb)
            pvb.destroy();
    }
};

exports.testConstruction = function(assert) {
    let testId = "test-panelview-construction";

    let pv = createPanelView(testId);

    let document = getMostRecentBrowserWindow().document;
    assert.ok(document.getElementById(testId),"Panel has not been added to the window");
    assert.equal(testId, pv.id, "Id has not been set correctly");
    let subview = document.getElementById(pv.id);

    assert.ok(subview.getElementsByClassName("panel-subview-header")[0], "Panelview header has not been created");
    assert.equal(subview.getElementsByClassName("panel-subview-header")[0].getAttribute("value"), "testView", "Subview title isn't set properly");

    assert.ok(subview.getElementsByClassName("panel-subview-body")[0], "Panelview main content has not been created");
    let content = subview.getElementsByClassName("panel-subview-body")[0];
    assert.ok(content.getElementsByClassName("subviewbutton")[0], "Panelview main content does not have an action inside");
    assert.equal(content.getElementsByClassName("subviewbutton")[0].getAttribute("label"), "an action", "Panelview main content first action does not have the correct label");

    assert.ok(content.getElementsByTagName("menuseparator")[0], "Toolbar separator not created");

    assert.ok(content.getElementsByClassName("subviewbutton")[1], "Second button not created properly");
    assert.equal(content.getElementsByClassName("subviewbutton")[1].getAttribute("type"), "checkbox");

    assert.ok(subview.getElementsByClassName("panel-subview-footer")[0], "Subview footer not created properly");
    assert.equal(subview.getElementsByClassName("panel-subview-footer")[0].getAttribute("label"), 'footer');
    subview.getElementsByClassName("panel-subview-footer")[0].doCommand();
    assert.equal(buttonTest, "footer", "Footer command is not executed properly");
    assert.ok(!pv.isShowing, "Panel not closed after command on footer button");

    pv.destroy();
};
/* disabled, since it never completes
exports.testButtons = function(assert, done) {
    var pv = createPanelView("test-panelview-buttons"),
        button = createActionButton("test-panelview-buttons-button"),
        document = getMostRecentBrowserWindow().document,
        content = document.getElementById(pv.id).getElementsByClassName("panel-subview-body")[0],
        buttonNo = 0,
        buttonTestVal = buttonTest,
        buttons = content.getElementsByClassName("subviewbutton"),
        shouldHide = true,
        next = false,
        timer;

    pv.on("show", show);
    pv.on("hide", hide);

    pv.show(button);

    function hide() {
        if(!next) {
            next = true;
            assert.equal(buttonTest, buttonTestVal, "Action click handler not working properly");
            if(shouldHide)
                assert.pass("Panel closed after command on regular content button");
            else {
                assert.fail("Panel closed after command on checkbox item");
                removeTimeout(timer);
            }

            if(++buttonNo == buttons.length)
                allDone();
            else
                pv.show(button);
        }
        else
            pv.show(button);
    }
    function show() {
        next = false;
        if(buttons[buttonNo].type == "checkbox") {
            shouldHide = false;
            buttonTest = "nothing";
            buttonTestVal = "nothing";
        }
        else {
            buttonTestVal = "successful";
            shouldHide = true;
        }

        if(!shouldHide) {
            timer = setTimeout(hideCheck, 200);
        }

        buttons[buttonNo].click();
    }
    function hideCheck() {
        if(!next) {
            next = true;
            assert.equal(buttonTest, buttonTestVal, "Action click handler not working properly");
            if(!shouldHide)
                assert.pass("Panel didn't close after clicking on checkbox item");
            else
                assert.fail("Panel didn't hide");

            if(++buttonNo == buttons.length)
                allDone();
            else {
                pv.hide();
            }
        }
    }

    function allDone() {
        pv.off("show", show);
        pv.off("hide", hide);
        pv.destroy();
        button.destroy();
        done();
    }
};*/

exports.testDestroy = function(assert) {
    let document = getMostRecentBrowserWindow().document;
    assert.ok(!document.getElementById("test-panelview-destroy"), "There already is an element with the desired ID");
    let pv = createPanelView("test-panelview-destroy");
    assert.ok(document.getElementById(pv.id), "Panelview wasn't created properly");
    pv.destroy();
    // can't use pv.id, as viewFor will not return anything if it has been destroyed properly.
    assert.ok(!document.getElementById("test-panelview-destroy"), "Panelview wasn't removed properly");
};

exports.testShow = function(assert) {
    let pv = createPanelView("test-panelview-show");
    assert.ok(!pv.isShowing, "Panelview is already displaying even though never prompted to open");
    assert.throws(pv.show,/A subview can only be displayed with a button as anchor/,"Show didn't throw even though it didn't get the required arguments");
    assert.ok(!pv.isShowing, "Panelview is opened even though no anchor was passed");

    assert.throws(function() {
        pv.show({});
    } ,/A subview can only be displayed with a button as anchor/, "Show didn't throw even though it didn't get the required arguments");
    assert.ok(!pv.isShowing, "Panelview is oepened even though it didn't get the required arguments");

    pv.destroy();
};

exports.testShowEvent = function(assert, done) {
    var pv = createPanelView("test-panelview-showevent"),
        button = createActionButton("test-panelview-showevent-button");

    let window = getMostRecentBrowserWindow();
    window.document.getElementById("test-panelview-showevent").panelMultiView.removeAttribute("transitioning");

    pv.once("show", function(event) {
        setTimeout(function() {
            assert.ok(pv.isShowing,"Panelview was successfully opened");

            pv.hide();
            pv.destroy();
            button.destroy();

            done();
        }, 2000);
    });
    pv.show(button);
};

exports.testShowProperty = function(assert, done) {
    var pv = PanelView({
            id: "test-panelview-showproperty",
            title: "Test Panel",
            content: [
                {
                    type: "button",
                    label: "button"
                }
            ],
            onShow: function(event) {
                setTimeout(function() {
                    assert.ok(pv.isShowing,"Panelview was successfully opened");

                    pv.hide();
                    pv.destroy();
                    button.destroy();

                    done();
                }, 200);
            }
        }),
        button = createActionButton("test-panelview-showproperty-button");
    pv.show(button);
};

exports.testMenuShow = function(assert, done) {
    var pv = createPanelView("test-panelview-menushow"),
        button = createActionButton("test-panelview-menushow-button"),
        listener = {
            onWidgetAdded: function() {
                pv.show(button);
            }
        };


    pv.once("show", function(event) {
        assert.ok(pv.isShowing,"Panelview was successfully opened");

        pv.hide();
        CustomizableUI.removeListener(listener);
        pv.destroy();
        button.destroy();
        setTimeout(() => MainMenu.close(), 100);

        done();
    });

    CustomizableUI.addListener(listener);

    moveButtonToMenu(button);
};

exports.testShowInOtherWindow = function(assert, done) {
    var pv = createPanelView("test-panelview-menushow"),
        button = createActionButton("test-panelview-menushow-button");

    moveButtonToMenu(button);

    pv.once("show", function(event) {
        assert.ok(pv.isShowing,"Panelview was successfully opened");

        pv.hide();
        pv.destroy();
        button.destroy();
        MainMenu.close();
        newWindow.close();

        done();
    });

    browserWindows.on("open", () => setTimeout(() => pv.show(button), 9000));

    var newWindow = browserWindows.open("about:home");
};


exports.testHideEvent = function(assert, done) {
    var pv = createPanelView("test-panelview-hideevent"),
        button = createActionButton("test-panelview-hideevent-button");

    pv.once("hide", function(event) {
        assert.ok(!pv.isShowing,"Panelview was successfully closed");

        pv.destroy();
        button.destroy();

        done();
    });
    pv.show(button);
    pv.hide();
};

exports.testHideProperty = function(assert, done) {
    var pv = PanelView({
            id: "test-panelview-hideproperty",
            title: "Test Panel",
            content: [
                {
                    type: "button",
                    label: "button"
                }
            ],
            onHide: function(event) {
                assert.ok(!pv.isShowing,"Panelview was successfully closed");

                pv.destroy();
                button.destroy();

                done();
            }
        }),
        button = createActionButton("test-panelview-hideproperty-button");
    pv.show(button);
    pv.hide();
};

exports.testMenuHide = function(assert, done) {
    var pv = createPanelView("test-panelview-menuhide"),
        button = createActionButton("test-panelview-menuhide-button"),
        listener = {
            onWidgetAdded: function() {
                pv.show(button);
            }
        };

    let window = getMostRecentBrowserWindow();
    window.document.getElementById("PanelUI-multiView").removeAttribute("transitioning");

    pv.once("show", function() {
        setTimeout(() => pv.hide(), 200);
    });

     pv.once("hide", function(event) {
        setTimeout(function() {
            assert.ok(!pv.isShowing, "Panelview was successfully closed");

            CustomizableUI.removeListener(listener);
            pv.destroy();
            button.destroy();

            MainMenu.close();

            done();
        }, 200);
    });

    CustomizableUI.addListener(listener);
    moveButtonToMenu(button);
};

exports.testForcedMenuHide = function(assert, done) {
    var pv = createPanelView("test-panelview-forcedmenuhide"),
        button = createActionButton("test-panelview-forcedmenuhide-button"),
        listener = {
            onWidgetAdded: function() {
                pv.show(button);
            }
        };

    let window = getMostRecentBrowserWindow();
    window.document.getElementById("PanelUI-multiView").removeAttribute("transitioning");

    pv.once("show", function() {
        setTimeout(() => pv.hide(true), 200);
    });

    pv.once("hide", function(event) {
        setTimeout(function() {
            assert.ok(!pv.isShowing, "Panelview was successfully closed");
            assert.ok(!MainMenu.isOpen(), "Menu was successfully closed");

            CustomizableUI.removeListener(listener);
            pv.destroy();
            button.destroy();

            done();
        }, 200);
    });

    CustomizableUI.addListener(listener);
    moveButtonToMenu(button);
};

require('sdk/test').run(exports);
