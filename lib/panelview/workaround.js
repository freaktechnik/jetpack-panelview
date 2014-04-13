/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

const { ActionButton, ToggleButton } = require("sdk/ui");
const { getNodeView } = require("sdk/view/core");

exports.applyButtonFix = function(button) {
    if(!(button instanceof ToggleButton || button instanceof ActionButton))
        throw new Error("The workaround can only be applied to an SDK button");

    getNodeView(button).setAttribute("closemenu", "none");
};