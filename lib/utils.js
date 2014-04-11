/*
 * panelview utils
 * An SDK Module to help creating subview panels introduced in Australis
 * Heavily insperide by the SDK panel/utils module
 * Created by Martin Giger
 * Licensed under the GPLv3
 */

//TODO
// * implement isShowing
// * Fix show and hide
// * Fix buttons oncommand
// * HiDPI icons
// can actions be ui/buttons?
// * allow changing of the disabled state of menu items
// * Add events

"use strict";

const { Cu } = require('chrome');
const { id: addonID } = require('sdk/self');
const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const { CustomizableUI } = Cu.import('resource:///modules/CustomizableUI.jsm', {});

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

function show(panelview, button, document) {
    document = document || getMostRecentBrowserWindow().document;
    // reverse-engineered from sdk/ui/button/view
    let buttonId = 'button--' + addonID.toLowerCase().replace(/[^a-z0-9-_]/g, '') + '-' + button.id;
    document.panelUI.showSubView(panelview.id, button, CustomizableUI.getPlacementOfWidget(buttonId));
}
exports.show = show;

function isShowing(panelview, document) {
    return false;
};
exports.isShowing = isShowing;

function hide(document) {
    document = document || getMostRecentBrowserWindow().document;
    document.panelUI.hide();
}
exports.hide = hide;

function setHeader(panelview, headerTitle, document) {
    document = document || getMostRecentBrowserWindow().document;
    let header = document.createElementNS(XUL_NS, "label");
    header.setAttribute("class", "panel-subview-header");
    //panelview.header = header;

    header.setAttribute("value", headerTitle);
    panelview.appendChild(header);
}
exports.setHeader = setHeader;

function addActions(panelview, actions, document) {
    document = document || getMostRecentBrowserWindow().document;
    let content = document.createElementNS(XUL_NS, "vbox");
    content.setAttribute("class", "panel-subview-body");
    //panelview.content = content;

    actions.forEach(function(item) {
        let node;
        if(item.type == "button") {
            node = document.createElementNS(XUL_NS, "toolbarbutton");
            node.setAttribute("class", "subviewbutton");
            node.setAttribute("label", item.title);
            node.setAttribute("oncommand", function clickAction(event) {
                hide(document);
                item.onClick(event);
            });
            if(item.hasOwnProperty("icon"))
                node.setAttribute("image", item.icon);

            node.setAttribute("disabled", item.hasOwnProperty("disabled") && item.disabled);

            if(item.hasOwnProperty("actionType"))
                node.setAttribute("type", item.actionType);

            if(item.hasOwnProperty("accesskey"))
                node.setAttribute("accesskey", item.accesskey);
        }
        else if(item.type == "separator") {
            node = document.createElementNS(XUL_NS, "menuseparator");
            if(item.hasOwnProperty("small") && item.small)
                node.setAttribute("class", "small-separator");
        }
        else {
            console.error("No known content item type defined (item: " + item.toSource() + ")");
            return;
        }
        content.appendChild(node);
    });
    panelview.appendChild(content);
}
exports.addActions = addActions;

function setFooter(panelview, footerOptions, document) {
    document = document || getMostRecentBrowserWindow().document;
    let footer = document.createElementNS(XUL_NS, "toolbarbutton");
    footer.setAttribute("class", "panel-subview-footer subviewbutton");
    //panelview.footer = footer;

    footer.setAttribute("label", footerOptions.title);
    footer.setAttribute("oncommand", function panelviewFooterClickAction(event) {
        hide(document);
        footerOptions.onClick(event);
    });

    panelview.appendChild(footer);
}
exports.setFooter = setFooter;

function make(document) {
    document = document || getMostRecentBrowserWindow().document;
    let panelview = document.createElementNS(XUL_NS, "panelview");
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
        nodes[i].setAttribute("oncommand", null);
    }

    detach(panelview);
}
exports.dispose = dispose;
