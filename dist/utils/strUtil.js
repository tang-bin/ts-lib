"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StrUtil {
    rand(len = 16) {
        len = len || 16;
        const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz1234567890", maxPos = chars.length;
        let str = "";
        for (let i = 0; i < len; i++) {
            str += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    }
    endsWith(searchIn, lookingFor, caseInsensitive = false) {
        if (searchIn.length < lookingFor.length)
            return false;
        else if (caseInsensitive)
            return searchIn.toLowerCase().lastIndexOf(lookingFor.toLowerCase()) === searchIn.length - lookingFor.length;
        else
            return searchIn.lastIndexOf(lookingFor) === searchIn.length - lookingFor.length;
    }
    endsWithList(searchIn, lookingFor, caseInsensitive = false) {
        if (caseInsensitive)
            searchIn = searchIn.toLowerCase();
        return lookingFor.some((str) => {
            if (caseInsensitive)
                str = str.toLowerCase();
            return searchIn.endsWith(str);
        });
    }
    startsWith(searchIn, lookingFor) {
        return String(searchIn).indexOf(String(lookingFor)) === 0;
    }
    identifyName(name) {
        return String(name).replace(/\s/gi, "_");
    }
    camel2Dash(camel) {
        return camel.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    }
    parseParams(str) {
        const params = {};
        const addParam = (key, valList) => {
            if (key) {
                if (valList.length) {
                    params[key] = valList.join(" ");
                }
                else {
                    params[key] = "true";
                }
            }
        };
        let key = "", valList = [];
        str.split(" ")
            .map((v) => String(v).trim())
            .filter((v) => !!v)
            .forEach((item) => {
            const isKey = item.charAt(0) === "-";
            if (isKey) {
                addParam(key, valList);
                while (item.charAt(0) === "-") {
                    item = item.substring(1);
                }
                key = item || "";
                valList = [];
            }
            else if (key) {
                valList.push(item);
            }
        });
        addParam(key, valList);
        return params;
    }
    includes(long, short) {
        const ignore = /[\s|-|_|,|\.]/g;
        long = long.toLowerCase().replace(ignore, "");
        short = short.toLowerCase().replace(ignore, "");
        return long.includes(short);
    }
    splitClause(str) {
        const rs = [];
        let parenLv = 0, curStr = "";
        (str || "").split("").forEach((char) => {
            if (char === "," && parenLv === 0) {
                if (curStr)
                    rs.push(curStr);
                curStr = "";
            }
            else {
                if (char === "(")
                    parenLv++;
                else if (char === ")")
                    parenLv--;
                curStr += char;
            }
        });
        if (curStr)
            rs.push(curStr);
        return rs;
    }
    findAttributesFromExpression(expStr) {
        const matchList = [], len = expStr.length;
        let started = false, curChars = [];
        for (let i = 0; i < len; i++) {
            const char = expStr.charAt(i), nextChar = expStr.charAt(i + 1);
            if (char === "," || char === "(") {
                if (char === "," && started && curChars.length) {
                    curChars.push(char);
                    matchList.push(curChars.join(""));
                }
                curChars = [char];
                started = true;
            }
            else if ("=<>".includes(char) || char === ")") {
                if (started && curChars.length) {
                    curChars.push(char);
                    if ("<>".includes(char) && nextChar === "=") {
                        curChars.push(nextChar);
                        i += 1;
                    }
                    matchList.push(curChars.join(""));
                }
                started = false;
                curChars = [];
            }
            else if (!"(),=<>".includes(char) && started) {
                curChars.push(char);
            }
            else {
                curChars = [];
                started = false;
            }
        }
        return matchList;
    }
    labelling(str) {
        return str
            .replace(/[-_]/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/\s+/g, " ")
            .split(" ")
            .map((s) => {
            s = String(s).trim().toLowerCase();
            s = this.capitalFirst(s);
            return s;
        })
            .join(" ")
            .trim();
    }
    capitalFirst(str) {
        str = String(str || "").trim();
        return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    }
    /**
     * @param text
     * @param len
     * @param splitWord:Boolean. Only split text on space.
     * @param greedy:Boolean. If splitWord is true, greedy will include next word even the result length is longer than len.
     */
    shortenText(text, len, splitWord = false, greedy = true) {
        if (!text) {
            return text;
        }
        else if (splitWord) {
            text = String(text).trim();
            const rsText = text.split(" ").reduce((rs, t) => {
                const nextTxt = rs + " " + t, nextLen = nextTxt.length;
                if (nextLen > len)
                    return rs;
                else
                    return nextTxt.trim();
            }, "");
            if (rsText) {
                if (text !== rsText)
                    return rsText + "...";
                else
                    return text;
            }
            else {
                return this.shortenText(text, len);
            }
        }
        else if (len > 3 && text.length > len) {
            return text.substring(0, len - 3) + "...";
        }
        else
            return text;
    }
    parseKeyValueStr(str) {
        return this.splitClause(str || "").reduce((data, item) => {
            const idx = item.indexOf(":"), key = (item.substring(0, idx) || "").trim(), val = (item.substring(idx + 1) || "").trim();
            if (key)
                data[key] = val;
            return data;
        }, {});
    }
    findNearestBreak(str, nearIndex) {
        const hit = (c) => c === " " || c === null || c === undefined || c === "\r" || c === "\n" || c === "_" || c === "-";
        let char = str.charAt(nearIndex), off = 0, backward = 0;
        if (hit(char))
            return nearIndex;
        while (true) {
            const f = nearIndex + ++off, b = nearIndex - off;
            if (hit(str.charAt(f)))
                return f;
            else if (hit(str.charAt(b)))
                return b;
            else if (f > str.length && b < 0)
                return 0;
        }
    }
    splitCSVRow(str) {
        const rs = [];
        str = String(str || "").trim();
        let i = 0, char = str[i], portion = "", inQuote = false;
        while (char) {
            if (char === "," && !inQuote) {
                // CSV cell data may be empty. DON'T remove empty.
                rs.push(portion || "");
                portion = "";
            }
            else if (char === '"') {
                if (!inQuote && !portion)
                    inQuote = true;
                else if (inQuote)
                    inQuote = false;
            }
            else {
                portion = portion + char;
            }
            i += 1;
            char = str[i];
        }
        // CSV cell data may be empty.
        rs.push(portion || "");
        return rs;
    }
    findBracketRange(str, start = "{", end = "}") {
        let startIndex = -1, endIndex = -1, lv = 0, index = 0, len = String(str || "").length;
        while (index < len) {
            const char = str.charAt(index);
            if (char === start) {
                if (lv === 0)
                    startIndex = index;
                lv += 1;
            }
            else if (char === end) {
                if (lv === 1) {
                    endIndex = index;
                    break;
                }
                lv -= 1;
            }
            index += 1;
        }
        return { startIndex, endIndex };
    }
    hexEncode(str, dec = 16, digit = 2) {
        if (!str)
            return "";
        if (!(digit >= 2))
            digit = 2;
        if (!(dec >= 2))
            dec = 16;
        const zeros = "0".repeat(digit);
        let rs = "";
        for (let i = 0, len = str.length; i < len; i++) {
            const hex = zeros + str.charCodeAt(i).toString(dec), hLen = hex.length;
            rs += hex.slice(hLen - digit, hLen);
        }
        return rs.toUpperCase();
    }
    /**
     * Prettify the label. e.g.,
     * 1. this_is_a_label => This Is A Label
     * 2. srcHostName => Src Host Name
     * 3. another_goodToKnow_example => Another Good To Know Example
     *
     * @param label The label will be formatted.
     * @returns
     */
    prettifyLabel(label) {
        return String(label || "")
            .trim()
            .replace(/__/gi, "_")
            .split("_")
            .map((str) => {
            return str
                .replace(/(\W)/gi, " $1")
                .split(" ")
                .map((word) => {
                word = String(word).trim();
                return word[0].toUpperCase() + word.substring(1).toLowerCase();
            })
                .join(" ");
        })
            .join(" ");
    }
}
const strUtil = new StrUtil();
exports.default = strUtil;
