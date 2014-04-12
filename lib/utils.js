/*
 * panelview utils
 * An SDK Module to help creating subview panels introduced in Australis
 * Heavily insperide by the SDK panel/utils module
 * Created by Martin Giger
 * Licensed under the GPLv3
 */

"use strict";

const { Cu } = require('chrome');
const { id: addonID, data } = require('sdk/self');
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = Cu.import('resource:///modules/CustomizableUI.jsm', {});
const { getNodeView } = require("sdk/view/core");
const { removeListener, on } = require("sdk/dom/events");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var nodeEventHandlers = new WeakMap()

function show(panelview, button, window) {
    window = window || getMostRecentBrowserWindow();
    // reverse-engineered from sdk/ui/button/view
    let buttonId = getNodeView(button).id;
    if(CustomizableUI.getPlacementOfWidget(buttonId).area == CustomizableUI.AREA_PANEL)
        window.PanelUI.multiView.showSubView(panelview.id, window.document.getElementById(buttonId));
    else
        window.PanelUI.showSubView(panelview.id, window.document.getElementById(buttonId), CustomizableUI.getPlacementOfWidget(buttonId).area);
        
}
exports.show = show;

function isShowing(panelview) {
    return !!(panelview.getAttribute("current") || ( panelview.panelMultiView && panelview.panelMultiView.getAttribute("viewtype") == "main" && !panelview.panelMultiView.showingSubView ));
};
exports.isShowing = isShowing;

function hide(panelview, window) {
    if(isShowing(panelview)) {
        if(panelview.getAttribute("current")) {
            // go back to the menu panel
            window = window || getMostRecentBrowserWindow();
            window.PanelUI.multiView.showMainView();
        }
        else {
            panelview.panelMultiView._panel.hidePopup();
        }
    }
}
exports.hide = hide;

function setHeader(panelview, headerTitle, document) {
    document = document || getMostRecentBrowserWindow().document;
    let header = document.createElementNS(XUL_NS, "label");
    header.classList.add("panel-subview-header");
    //panelview.header = header;

    header.setAttribute("value", headerTitle);
    panelview.appendChild(header);
}
exports.setHeader = setHeader;

function addActions(panelview, actions, document) {
    document = document || getMostRecentBrowserWindow().document;
    let content = document.createElementNS(XUL_NS, "vbox");
    content.classList.add("panel-subview-body");
    //panelview.content = content;

    actions.forEach(function(item) {
        let node;
        if(item.type == "button") {
            node = document.createElementNS(XUL_NS, "toolbarbutton");
            node.classList.add("subviewbutton");
            node.setAttribute("label", item.label);
            
            nodeEventHandlers.set(node, function(event) {
                hide(panelview);
                item.onClick(event);
            });
            on(node, "command", nodeEventHandlers.get(node));

            if(item.hasOwnProperty("icon")) {
                if(item.icon.match(/^\.\//))
                    item.icon = data.url(item.icon);
                node.setAttribute("image", item.icon);
            }

            node.setAttribute("disabled", item.hasOwnProperty("disabled") && item.disabled);

            if(item.hasOwnProperty("actionType"))
                node.setAttribute("type", item.actionType);

            if(item.hasOwnProperty("accesskey"))
                node.setAttribute("accesskey", item.accesskey);
        }
        else if(item.type == "separator") {
            node = document.createElementNS(XUL_NS, "toolbarseparator");
            if(item.hasOwnProperty("small") && item.small)
                node.classList.add("small-separator");
        }
        else {
            throw new Error("No known content item type defined (item: " + item.toSource() + ")");
        }
        content.appendChild(node);
    });
    panelview.appendChild(content);
}
exports.addActions = addActions;

function setFooter(panelview, footerOptions, document) {
    document = document || getMostRecentBrowserWindow().document;
    let footer = document.createElementNS(XUL_NS, "toolbarbutton");
    footer.classList.add("panel-subview-footer");
    footer.classList.add("subviewbutton");
    //panelview.footer = footer;

    footer.setAttribute("label", footerOptions.label);
    nodeEventHandlers.set(footer, function(event) {
        hide(panelview);
        footerOptions.onClick(event);
    });
    on(footer, "command", nodeEventHandlers.get(footer));

    panelview.appendChild(footer);
}
exports.setFooter = setFooter;

function make(document) {
    document = document || getMostRecentBrowserWindow().document;
    let panelview = document.createElementNS(XUL_NS, "panelview");
    panelview.setAttribute("flex", 1);
    panelview.classList.add("PanelUI-subView");
    attach(panelview, document);

    return panelview;
}
exports.make = make;

function attach(panelview, document) {
  document = document || getMostRecentBrowserWindow().document;
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
