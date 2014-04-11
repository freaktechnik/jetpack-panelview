
var { PanelView } = require("./panelview");
var { ActionButton } = require ("sdk/ui/button/action");
const { getMostRecentBrowserWindow } = require('sdk/window/utils');

function createPanelView(testId, buttonTest) {
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
            title: 'footer',
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
        icon: "./test-icon.png"
    });
}

exports.testConstruction = function(assert) {
    let testId = "test-panelview-construction";
    let buttonTest = "waiting";

    let pv = createPanelView(testId, buttonTest);
    
    let document = getMostRecentBrowserWindow().document;
    assert.ok(document.getElementById(testId));
    let subview = document.getElementById(testId);
    
    assert.ok(subview.getElementsByClassName("panel-subview-header")[0], "Panelview header has not been created");
    assert.equal(subview.getElementsByClassName("panel-subview-header")[0].getAttribute("value"), "testView", "Subview title isn't set properly");

    assert.ok(subview.getElementsByClassName("panel-subview-body")[0], "Panelview main content has not been created");
    let content = subview.getElementsByClassName("panel-subview-body")[0];
    assert.ok(content.getElementsByClassName("subviewbutton")[0], "Panelview main content does not have an action inside");
    assert.equal(content.getElementsByClassName("subviewbutton")[0].getAttribute("label"), "an action", "Panelview main content first action does not have the correct label");
    content.getElementsByClassName("subviewbutton")[0].doCommand();
    assert.equal(buttonTest, "successful", "Action click handler not working properly");

    assert.ok(content.getElementsByTagName("toolbarseparator")[0], "Toolbar separator not created");

    assert.ok(content.getElementsByClassName("subviewbutton")[1], "Second button not created properly");
    let secondButton = content.getElementsByClassName("subviewbutton")[1];
    assert.equal(secondButton.getAttribute("type"), "checkbox");
    buttonTest = "click test";
    secondButton.doCommand();
    assert.equal(buttonTest, "click test", "Command triggers command functions of other buttons");

    assert.ok(subview.getElementsByClassName("panel-subview-footer")[0], "Subview footer not created properly");
    assert.equal(subview.getElementsByClassName("panel-subview-footer")[0].getAttribute("label"), 'footer');
    subview.getElementsByClassName("panel-subview-footer")[0].doCommand();
    assert.equal(buttonTest, "footer", "Footer command is not executed properly");

    pv.dispose();
    
    PanelView({
        id:'test-panelview-content-a',
        title:'Another Panelview',
        content: [
            {
                label: "invalid content item"
            }
        ]
    });
    assert.equal(document.getElementById("test-panelview-content-a").getElementsByClassName("panel-subview-body")[0].childNodes.length,0, "Subview content item added even though there is no valid item to add");
    PanelView({
        id:'test-panelview-content-b',
        title:'Yet Another Panelview',
        content: [
            {
                label: "content item with unsupported type",
                type: "menu"
            }
        ]
    });
    assert.equal(document.getElementById("test-panelview-content-b").getElementsByClassName("panel-subview-body")[0].childNodes.length,0, "Subview content item added even though there is no item with a supported type to add");
};

exports.testDispose = function(assert) {
    let document = getMostRecentBrowserWindow().document;
    assert.ok(!document.getElementById("test-panelview-dispose"), "There already is an element with the desired ID");
    var pv = createPanelView("test-panelview-dispose");
    assert.ok(document.getElementById("test-panelview-dispose"), "Panelview wasn't created properly");
    pv.dispose();
    assert.ok(!document.getElementById("test-panelview-dispose"), "Panelview wasn't removed properly");
};

exports.testShow = function(assert) {
    var pv = createPanelView("test-panelview-show");
    assert.ok(!pv.isShowing(), "Panelview is already displaying even though never prompted to open");
    pv.show();
    assert.ok(!pv.isShowing(), "Panelview is opened even though no anchor was passed");
    pv.show(createActionButton("test-panelview-show-button"));
    assert.ok(pv.isShowing(), "Panelview did not open");
};

exports.testHide = function(assert) {
    var pv = createPanelView("test-panelview-hide");
    pv.show(createActionButton("test-panelview-hide-button"));
    assert.ok(pv.isShowing(), "Panelview hasn't been opened to run this test properly");
    pv.hide();
    assert.ok(!pv.isShowing(), "Panelview hasn't been closed by hide");
};

require('sdk/test').run(exports);

