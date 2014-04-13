/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { contract } = require("sdk/util/contract");
const { merge } = require("sdk/util/object");
const { isLocalURL } = require("sdk/url");
const { isNil, isString, isObject } = require("sdk/lang/type");
const { stateContract } = require("sdk/ui/button/contract");
const { union } = require("sdk/util/array");

let string = { is: ['string', 'undefined', 'null'] };
let boolean = { is: ['boolean', 'undefined', 'null'] };
let object = { is: ['object', 'undefined', 'null'] };

// grabbed form api-utils
function optional(req) {
  req = merge({is: []}, req);
  req.is = findTypes(req).filter(isTruthyType).concat('undefined', 'null');

  return req;
}

let isTruthyType = type => !(type === 'undefined' || type === 'null');
let findTypes = v => { while (!Array.isArray(v) && v.is) v = v.is; return v };
function either(...types) {
  return union.apply(null, types.map(findTypes));
}

// from the button contract
function isIconSet(icons) {
  return Object.keys(icons).
    every(size => String(size >>> 0) === size && isLocalURL(icons[size]))
}

let iconSet = {
  is: either(object, string),
  ok: v => (isString(v) && isLocalURL(v)) || (isObject(v) && isIconSet(v)),
  msg: 'The option "icon" must be a local URL or an object with ' +
    'numeric keys / local URL values pair.'
}

let id = {
  is: string,
  ok: v => /^[a-z-_][a-z0-9-_]*$/i.test(v),
  msg: 'The option "id" must be a valid alphanumeric id (hyphens and ' +
        'underscores are allowed).'
};

let label = {
  is: string,
  ok: v => isNil(v) || v.trim().length > 0,
  msg: 'The option "label" must be a non empty string'
};

let contentItemType = {
    is: string,
    ok: v => v == "button" || v == "separator",
    msg: 'The option "type" must be either "button" or "separator"'
};

let contentItemContract = contract({
    type: contentItemType,
    small: optional(boolean),
    icon: optional(iconSet),
    label: label,
    onClick: optional({is: ['function', 'undefined', 'null']}),
    disabled: optional(boolean),
    actionType: optional(string),
    accesskey: optional(string)
});

let contentArray = {
    is: ['array'],
    ok: v => v.every(item => contentItemContract(item)),
    msg: 'The content item array must only contain valid items'
};

let footerContract = contract({
    label: label,
    onClick: {is: ['function']}
});

let footer = {
    is: object,
    ok: v => isNil(v) || footerContract(v),
    msg: 'The footer must be a vaild footer element or not given'
};

let panelviewContract = contract({
    id: id,
    title: label,
    content: contentArray,
    footer: footer
});
exports.panelviewContract = panelviewContract;
