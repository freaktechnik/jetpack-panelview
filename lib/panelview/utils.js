/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * panelview utils
 * An SDK Module to help creating subview panels introduced in Australis
 * Heavily insperide by the SDK panel/utils module
 * Created by Martin Giger
 */

"use strict";

const { getMostRecentBrowserWindow, getOwnerBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = require('resource:///modules/CustomizableUI.jsm');
const { getNodeView } = require("sdk/view/core");
const { removeListener, on } = require("sdk/dom/events");
const { MainMenu, SUB_VIEW } = require("./mainmenu");
const { isObject } = require('sdk/lang/type');

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var nodeEventHandlers = new WeakMap();

function show(panelview, button, window) {
    let buttonNode = getNodeView(button);
    window = window || getOwnerBrowserWindow(buttonNode);
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
}
exports.show = show;

function isShowing(panelview) {
    // The first condition checks if the menu panel is open, and if yes if it is
    // showing a subview
    // if it isn't, it could be opened as mainView in a standalone
    // panel.
    return panelview.hasAttribute("current") ||
            panelview.classList.contains("cui-widget-panelview");
};
exports.isShowing = isShowing;

function hide(panelview, closePanel, window) {
    window = window || getOwnerBrowserWindow(panelview);
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
}
exports.hide = hide;

function setHeader(panelview, headerTitle) {
    let header = panelview.getElementsByClassName("panel-subview-header")[0];
    
    header.setAttribute("value", headerTitle);
}
exports.setHeader = setHeader;

function itemClickHidesPanel(item) {
    return !item.hasOwnProperty("actionType") ||
            (item.actionType != "radio" && item.actionType != "checkbox");
}

// inspired by sdk/ui/button/view
function getBestIcon(icon) {
    var image = icon,
        targetSize = 16 * getMostRecentBrowserWindow().devicePixelRatio,
        bestSize = 0;
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
}

function addActions(panelview, actions, document = getMostRecentBrowserWindow().document) {
    let content = panelview.getElementsByClassName("panel-subview-body")[0];

    actions.forEach(function(item) {
        let node;
        if(item.type == "button") {
            node = document.createElementNS(XUL_NS, "toolbarbutton");
            node.classList.add("subviewbutton");
            node.setAttribute("label", item.label);
            
            nodeEventHandlers.set(node, function(event) {
                item.onClick(event);
            });
            if(!itemClickHidesPanel(item))
                node.setAttribute("closemenu", "none");

            on(node, "command", nodeEventHandlers.get(node));

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
}
exports.addActions = addActions;

function setFooter(panelview, footerOptions, document = getMostRecentBrowserWindow().document) {
    let footer = document.createElementNS(XUL_NS, "toolbarbutton");
    footer.classList.add("panel-subview-footer");
    footer.classList.add("subviewbutton");
    //panelview.footer = footer;

    footer.setAttribute("label", footerOptions.label);
    nodeEventHandlers.set(footer, function(event) {
        footerOptions.onClick(event);
    });
    on(footer, "command", nodeEventHandlers.get(footer));

    panelview.appendChild(footer);
}
exports.setFooter = setFooter;

function make(document = getMostRecentBrowserWindow().document) {
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
}
exports.make = make;

function attach(panelview, document = getMostRecentBrowserWindow().document) {
  let container = document.getElementById("PanelUI-multiView");
  if (container !== panelview.parentNode) {
    detach(panelview);
    container.appendChild(panelview);
  }
}
exports.attach = attach;

function detach(panelview) {
  if (panelview.parentNode) panelview.parentNode.removeChild(panelview);
}
exports.detach = detach;

function dispose(panelview) {
    // remove all event listeners
    var nodes = panelview.getElementsByTagNameNS(XUL_NS,"toolbarbutton");
    for(var i = 0; i<nodes.length; ++i) {
        removeListener(nodes[i], "command", nodeEventHandlers.get(nodes[i]));
        nodeEventHandlers.delete(nodes[i]);
    }

    detach(panelview);
}
exports.dispose = dispose;
