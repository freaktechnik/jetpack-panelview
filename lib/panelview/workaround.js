/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

"use strict";

const { ActionButton, ToggleButton } = require("sdk/ui");
const { getNodeView, viewFor } = require("sdk/view/core");
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { browserWindows } = require("sdk/windows");

exports.fixButton = (button, window) => {
    CustomizableUI.getWidget(getNodeView(button).id).forWindow(window).node.setAttribute("closemenu", "none");
};

exports.applyButtonFix = (button) => {
    if(!(button instanceof ToggleButton || button instanceof ActionButton))
        throw new Error("The workaround can only be applied to an SDK button");

    //TODO check if button exists
    for(let w of browserWindows)
        exports.fixButton(button, viewFor(w));

    let buttonId = getNodeView(button).id,
        listener = {
            onWidgetAfterDOMChange: function(node, nn, c, removed) {
                if(node.id == buttonId) {
                    if(removed)
                        CustomizableUI.removeListener(listener);
                    else
                        exports.fixButton(button, node.ownerWindow);
                }
            }
        };
    CustomizableUI.addListener(listener);

    //TODO make sure onWidgetAfterDOMChange isn't called for new windows. And button exists in windows
    /*browserWindows.on("open", (w) => {
        exports.fixButton(button, viewFor(w));
    });*/
};
