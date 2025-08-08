import punycode from "punycode/punycode.js";
const { toASCII } = punycode;
/**
 *
 *  Validate domain name and throw if not valid.
 *
 *  From wikipedia:
 *
 *  Hostnames are composed of series of labels concatenated with dots, as are all
 *  domain names. Each label must be between 1 and 63 characters long, and the
 *  entire hostname (including the delimiting dots) has a maximum of 255 chars.
 *
 *  Allowed chars:
 *
 *  * `a-z`
 *  * `0-9`
 *  * `-` but not as a starting or ending character
 *  * `.` as a separator for the textual portions of a domain name
 *
 *  * http://en.wikipedia.org/wiki/Domain_name
 *  * http://en.wikipedia.org/wiki/Hostname */

export const validate = (input: string) => {
    /** Before we can validate we need to take care of IDNs with unicode chars. */
    const ascii = toASCII(input);

    if (ascii.length < 1) {
        return "DOMAIN_TOO_SHORT";
    }
    if (ascii.length > 255) {
        return "DOMAIN_TOO_LONG";
    }

    // Check each part's length and allowed chars.
    const labels = ascii.split(".");
    let label;

    for (let i = 0; i < labels.length; ++i) {
        label = labels[i];
        if (!label.length) {
            return "LABEL_TOO_SHORT";
        }
        if (label.length > 63) {
            return "LABEL_TOO_LONG";
        }
        if (label.charAt(0) === "-") {
            return "LABEL_STARTS_WITH_DASH";
        }
        if (label.charAt(label.length - 1) === "-") {
            return "LABEL_ENDS_WITH_DASH";
        }
        if (!/^[a-z0-9\-_]+$/.test(label)) {
            return "LABEL_INVALID_CHARS";
        }
    }
};
