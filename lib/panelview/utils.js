/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * panelview utils
 * An SDK Module to help creating subview panels introduced in Australis
 * Heavily insperide by the SDK panel/utils module
 * Created by Martin Giger
 */

//TODO e10s?

"use strict";

const { getMostRecentBrowserWindow, getOwnerBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");
const { MainMenu, SUB_VIEW } = require("./mainmenu");
const { isObject } = require('sdk/lang/type');
const { data } = require("sdk/self");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let nodeEventHandlers = new WeakMap();

let show = (panelview, button, window) => {
    let buttonNode = getNodeView(button);
    window = window || getOwnerBrowserWindow(buttonNode);
    window = window || getMostRecentBrowserWindow();
    attach(panelview, window.document);

    let buttonId = buttonNode.id,
        buttonWidget = CustomizableUI.getWidget(buttonId).forWindow(window),
        anchorView = buttonWidget.anchor;

    let area = CustomizableUI.getPlacementOfWidget(buttonId).area;

    if(MainMenu.contains(button, window)) {
        if(!MainMenu.isOpen(window))
            MainMenu.open(window);
        anchorView = buttonWidget.node;
    }

    // close the overflow panel, so the view can be anchored to it
    if(buttonWidget.overflowed)
        CustomizableUI.hidePanelForNode(buttonWidget.node);

    window.PanelUI.showSubView(panelview.id, anchorView, area);
};
exports.show = show;

let isShowing = (panelview) => {
    // The first condition checks if the menu panel is open, and if yes if it is
    // showing a subview
    // if it isn't, it could be opened as mainView in a standalone
    // panel.
    return panelview.hasAttribute("current") ||
           panelview.classList.contains("cui-widget-panelview");
};
exports.isShowing = isShowing;

let hide = (panelview, closePanel, window) => {
    window = window || getOwnerBrowserWindow(panelview);
    window = window || getMostRecentBrowserWindow();
    if(isShowing(panelview)) {
        // checks if the view is opened as subview in the menu panel
        if(!closePanel && MainMenu.isOpen()) {
            // go back to the menu panel
            MainMenu.showMainView(window);
        }
        else {
            CustomizableUI.hidePanelForNode(panelview);
        }
    }
};
exports.hide = hide;

let setHeader = (panelview, headerTitle) => {
    let header = panelview.getElementsByClassName("panel-subview-header")[0];

    header.setAttribute("value", headerTitle);
};
exports.setHeader = setHeader;

let itemClickHidesPanel = (item) => !item.hasOwnProperty("actionType") ||
            (item.actionType != "radio" && item.actionType != "checkbox");

// inspired by sdk/ui/button/view
let getBestIcon = (icon) => {
    var image = icon,
        targetSize = 16 * getMostRecentBrowserWindow().devicePixelRatio,
        bestSize = Number.MAX_VALUE;
    if(isObject(icon)) {
        for(var size in icon) {
            if(size == targetSize) {
                bestSize = size;
                break;
            }
            else if(size > targetSize && size < bestSize) {
                bestSize = size;
            }
        }
        image = icon[bestSize];
    }
    if(image.match(/^\.\//))
        image = data.url(image.substr(2));

    return image;
};

let addActions = (panelview, actions, document) => {
    document = document || getOwnerBrowserWindow(panelview).document;
    document = document || getMostRecentBrowserWindow().document;

    let content = panelview.getElementsByClassName("panel-subview-body")[0];

    let node;
    actions.forEach(function(item) {
        if(item.type == "button") {
            node = document.createElementNS(XUL_NS, "toolbarbutton");
            node.classList.add("subviewbutton");
            node.setAttribute("label", item.label);

            nodeEventHandlers.set(node, item.onClick);
            if(!itemClickHidesPanel(item))
                node.setAttribute("closemenu", "none");

            node.addEventListener("command", nodeEventHandlers.get(node), false);

            if(item.hasOwnProperty("icon")) {
                node.setAttribute("image", getBestIcon(item.icon));
            }

            if(item.hasOwnProperty("disabled") && item.disabled)
                node.setAttribute("disabled", false);

            if(item.hasOwnProperty("actionType"))
                node.setAttribute("type", item.actionType);

            if(item.hasOwnProperty("accesskey"))
                node.setAttribute("accesskey", item.accesskey);
        }
        else if(item.type == "separator") {
            node = document.createElementNS(XUL_NS, "menuseparator");
        }
        else {
            throw new Error("No known content item type defined (item: " +
                              item.toSource() + ")");
        }
        content.appendChild(node);
    });
};
exports.addActions = addActions;

let removeActions = (panelview, document = getOwnerBrowserWindow(panelview).document) => {
    let content = panelview.getElementsByClassName("panel-subview-body")[0];

    if(content.hasChildNodes()) {
        let nodes = [...content.childNodes];

        for(let node of nodes) {
            node.remove();
        }
    }
};
exports.removeActions = removeActions;

let setFooter = (panelview, footerOptions, document) => {
    document = document || getOwnerBrowserWindow(panelview).document;
    document = document || getMostRecentBrowserWindow().document;
    let footer = document.createElementNS(XUL_NS, "toolbarbutton");
    footer.classList.add("panel-subview-footer");
    footer.classList.add("subviewbutton");
    //panelview.footer = footer;

    footer.setAttribute("label", footerOptions.label);
    nodeEventHandlers.set(footer, footerOptions.onClick);
    footer.addEventListener("command", nodeEventHandlers.get(footer));

    panelview.appendChild(footer);
};
exports.setFooter = setFooter;

let make = (document = getMostRecentBrowserWindow().document) => {
    let panelview = document.createElementNS(XUL_NS, "panelview");
    panelview.setAttribute("flex", 1);
    panelview.classList.add("PanelUI-subView");

    let header = document.createElementNS(XUL_NS, "label");
    header.classList.add("panel-subview-header");
    //panelview.header = header;
    panelview.appendChild(header);

    let content = document.createElementNS(XUL_NS, "vbox");
    content.classList.add("panel-subview-body");
    //panelview.content = content;
    panelview.appendChild(content);

    // the footer elements is not created here due to it being optional

    attach(panelview, document);

    return panelview;
};
exports.make = make;

let attach = (panelview, document = getMostRecentBrowserWindow().document) => {
    let container = document.getElementById("PanelUI-multiView");
    if (container !== panelview.parentNode) {
        detach(panelview);
        container.appendChild(panelview);
    }
};
exports.attach = attach;

let detach = (panelview) => {
    if (panelview.parentNode)
        panelview.parentNode.removeChild(panelview);
};
exports.detach = detach;

let dispose = (panelview) => {
    // remove all event listeners
    let nodes = panelview.getElementsByTagNameNS(XUL_NS,"toolbarbutton");
    for(let i = 0; i < nodes.length; ++i) {
        nodes[i].removeEventListener("command", nodeEventHandlers.get(nodes[i]), false);
        nodeEventHandlers.delete(nodes[i]);
    }

    detach(panelview);
};
exports.dispose = dispose;
