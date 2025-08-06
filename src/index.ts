import punycode from "punycode/punycode.js";
import { rules } from "./data/rules.js";
import { errorCodes } from "./constants/error-codes.js";

/**
 * Parse rules from file.
 */
const rulesByPunySuffix = rules.reduce((map, rule) => {
    const suffix = rule.replace(/^(\*\.|\!)/, "");
    const punySuffix = punycode.toASCII(suffix);
    const firstChar = rule.charAt(0);

    if (map.has(punySuffix)) {
        throw new Error(`Multiple rules found for ${rule} (${punySuffix})`);
    }

    map.set(punySuffix, {
        rule,
        suffix,
        punySuffix,
        wildcard: firstChar === "*",
        exception: firstChar === "!",
    });

    return map;
}, new Map());

/** Find rule for a given domain. */
const findRule = (domain: string) => {
    const punyDomain = punycode.toASCII(domain);
    const punyDomainChunks = punyDomain.split(".");

    for (let i = 0; i < punyDomainChunks.length; i++) {
        const suffix = punyDomainChunks.slice(i).join(".");
        const matchingRules = rulesByPunySuffix.get(suffix);
        if (matchingRules) {
            return matchingRules;
        }
    }
    return null;
};

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

const validate = (input: string) => {
    /** Before we can validate we need to take care of IDNs with unicode chars. */
    const ascii = punycode.toASCII(input);

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
type ParseReturnType = {
    input: string;
    tld: null | string;
    sld: null | string;
    domain: null | string;
    subdomain: null | string;
    listed: boolean;
};
type ICode = Exclude<Required<ReturnType<typeof validate>>, undefined>;
type ParseReturnTypeOnError = {
    input?: string;
    message: (typeof errorCodes)[ICode];
    code: ICode;
};
type parseReturnType = {
    error?: ParseReturnTypeOnError;
    parsed?: ParseReturnType;
};
/** Parse domain. */
export const parse = (input: string): parseReturnType => {
    if (typeof input !== "string") {
        throw new TypeError("Domain name must be a string.");
    }

    // Force domain to lowercase.
    let domain = input.slice(0).toLowerCase();

    // Handle FQDN.
    // TODO: Simply remove trailing dot?
    if (domain.charAt(domain.length - 1) === ".") {
        domain = domain.slice(0, domain.length - 1);
    }

    // Validate and sanitise input.
    const error = validate(domain);
    if (error) {
        return {
            error: {
                input: input,
                message: errorCodes[error],
                code: error,
            },
        };
    }

    const parsed: ParseReturnType = {
        input: input,
        tld: null,
        sld: null,
        domain: null,
        subdomain: null,
        listed: false,
    };

    const domainParts = domain.split(".");

    // Non-Internet TLD
    if (domainParts[domainParts.length - 1] === "local") {
        return { parsed };
    }

    const handlePunycode = () => {
        if (!/xn--/.test(domain)) {
            return parsed;
        }
        if (parsed.domain) {
            parsed.domain = punycode.toASCII(parsed.domain);
        }
        if (parsed.subdomain) {
            parsed.subdomain = punycode.toASCII(parsed.subdomain);
        }
        return parsed;
    };

    const rule = findRule(domain);

    // Unlisted tld.
    if (!rule) {
        if (domainParts.length < 2) {
            return { parsed };
        }
        parsed.tld = domainParts.pop() ?? null;
        parsed.sld = domainParts.pop() ?? null;
        parsed.domain = [parsed.sld, parsed.tld].join(".");
        if (domainParts.length) {
            parsed.subdomain = domainParts.pop() ?? null;
        }

        return { parsed: handlePunycode() };
    }

    // At this point we know the public suffix is listed.
    parsed.listed = true;

    const tldParts = rule.suffix.split(".");
    const privateParts = domainParts.slice(
        0,
        domainParts.length - tldParts.length,
    );

    if (rule.exception) {
        privateParts.push(tldParts.shift());
    }

    parsed.tld = tldParts.join(".");

    if (!privateParts.length) {
        return { parsed: handlePunycode() };
    }

    if (rule.wildcard) {
        tldParts.unshift(privateParts.pop());
        parsed.tld = tldParts.join(".");
    }

    if (!privateParts.length) {
        return { parsed: handlePunycode() };
    }

    parsed.sld = privateParts.pop() ?? null;
    parsed.domain = [parsed.sld, parsed.tld].join(".");

    if (privateParts.length) {
        parsed.subdomain = privateParts.join(".");
    }

    return { parsed: handlePunycode() };
};

/** Get domain */
export const get = (domain: string) => {
    if (!domain) {
        return null;
    }
    return parse(domain).parsed?.domain || null;
};

/** Check whether domain belongs to a known public suffix. */
export const isValid = (domain: string) => {
    const parsed = parse(domain);
    return Boolean(parsed.parsed?.domain && parsed.parsed?.listed);
};
export { rules };
export default { parse, get, isValid, rules };
