/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

"use strict";

const { ActionButton, ToggleButton } = require("sdk/ui");
const { viewFor } = require("sdk/view/core");
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { browserWindows } = require("sdk/windows");
const { when } = require("sdk/system/unload");

exports.fixButton = (button, window) => {
    CustomizableUI.getWidget(viewFor(button).id).forWindow(window).node.setAttribute("closemenu", "none");
};

exports.applyButtonFix = (button) => {
    if(!(button instanceof ToggleButton || button instanceof ActionButton))
        throw new Error("The workaround can only be applied to an SDK button");

    //Apply fix to existing windows.
    let view = viewFor(button);
    if(view) {
        for(let w of browserWindows)
            exports.fixButton(button, viewFor(w));
    }

    let listener = {
            onWidgetAfterDOMChange: function(node, nn, c, removed) {
                view = viewFor(button);
                if(view && view.id == node.id) {
                    if(removed)
                        CustomizableUI.removeListener(listener);
                    else
                        node.setAttribute("closemenu", "none");
                }
            }
        };
    CustomizableUI.addListener(listener);
    when(() => CustomizableUI.removeListener(listener));

    browserWindows.on("open", (w) => {
        if(viewFor(button))
            exports.fixButton(button, viewFor(w));
    });
};
