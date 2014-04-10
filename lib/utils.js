/*
 * panelview utils
 * An SDK Module to help creating subview panels introduced in Australis
 * Heavily insperide by the SDK panel/utils module
 * Created by Martin Giger
 * Licensed under the GPLv3
 */

//TODO
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

    header.value = headerTitle;
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
            node.setAttribute("value", item.title);
            node.setAttribute("oncommand", function(event) {
                hide(document);
                item.action(event);
            });
            node.setAttribute("image", item.icon);
            node.setAttribute("disabled", item.hasOwnAttribute("disabled") && item.disabled);

            if(item.hasOwnAttribute("type"))
                node.setAttribute("type", item.type);

            if(item.hasOwnAttribute("accesskey"))
                node.setAttribute("accesskey", item.accesskey);
        }
        else if(item.type == "separator") {
            node = document.createElementNS(XUL_NS, "menuseparator");
            if(item.hasOwnAttribute("small") && item.small)
                node.setAttribute("class", "small-separator");
        }
        content.appendChild(node);
    });
    panelview.appendChild(content);
}
exports.addActions = addActions;

function setFooter(panelview, footerOptions) {
    document = document || getMostRecentBrowserWindow().document;
    let footer = document.createElementNS(XUL_NS, "toolbarbutton");
    footer.setAttribute("class", "panel-subview-footer subviewbutton");
    //panelview.footer = footer;

    footer.setAttribute("label", footerOptions.title);
    footer.setAttribute("oncommand", panelviewClick(footerOptions.action));

    panelview.appendChild(footer);
}
exports.setFooter = set Footer;

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
    panelview.getElementsByClassName("subviewbutton").forEach(function(button) {
        button.onclick = null;
    });

    detach(panelview);
}
exports.dispose = dispose;
