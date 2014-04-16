/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

const { ActionButton, ToggleButton } = require("sdk/ui");
const { getNodeView } = require("sdk/view/core");
const { Cu } = require('chrome');
const { CustomizableUI } = Cu.import('resource:///modules/CustomizableUI.jsm', {});
const { windows } = require("sdk/window/utils");

exports.fixButton = function(button, window) {
    CustomizableUI.getWidget(getNodeView(button).id).forWindow(window).node.setAttribute("closemenu", "none");    
};

exports.applyButtonFix = function(button) {
    if(!(button instanceof ToggleButton || button instanceof ActionButton))
        throw new Error("The workaround can only be applied to an SDK button");

    let bWindows = windows();
    for(var w in bWindows)
        this.fixButton(button, bWindows[w]);

    var buttonId = getNodeView(button).id,
        CUI = CustomizableUI,
        listener = {
            onWidgetAfterDOMChange: function(node, nn, c, removed) {
                if(node.id == buttonId) {
                    if(removed)
                        CUI.removeListener(listener);
                    else
                        exports.fixButton(button, node.ownerWindow);
                }
            }
        };
        CustomizableUI.addListener(listener);
};
