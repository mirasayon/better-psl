import punycode from "punycode/punycode.js";
const { toASCII } = punycode;
import { rules } from "./data/rules.js";
import { errorCodes } from "./constants/error-codes.js";
import type { ParseReturnType, parseReturnType } from "./types/index.js";
import { validate } from "./common/validator.js";

/**
 * Parse rules from file.
 */
const rulesByPunySuffix = rules.reduce((map, rule) => {
    const suffix = rule.replace(/^(\*\.|\!)/, "");
    const punySuffix = toASCII(suffix);
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
    const punyDomain = toASCII(domain);
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
            status: "error",
            parsed: null,
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
        return { parsed, error: null, status: "success" };
    }

    const handlePunycode = () => {
        if (!/xn--/.test(domain)) {
            return parsed;
        }
        if (parsed.domain) {
            parsed.domain = toASCII(parsed.domain);
        }
        if (parsed.subdomain) {
            parsed.subdomain = toASCII(parsed.subdomain);
        }
        return parsed;
    };

    const rule = findRule(domain);

    // Unlisted tld.
    if (!rule) {
        if (domainParts.length < 2) {
            return { parsed, error: null, status: "success" };
        }
        parsed.tld = domainParts.pop() ?? null;
        parsed.sld = domainParts.pop() ?? null;
        parsed.domain = [parsed.sld, parsed.tld].join(".");
        if (domainParts.length) {
            parsed.subdomain = domainParts.pop() ?? null;
        }

        return { parsed: handlePunycode(), error: null, status: "success" };
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
        return { parsed: handlePunycode(), error: null, status: "success" };
    }

    if (rule.wildcard) {
        tldParts.unshift(privateParts.pop());
        parsed.tld = tldParts.join(".");
    }

    if (!privateParts.length) {
        return { parsed: handlePunycode(), error: null, status: "success" };
    }

    parsed.sld = privateParts.pop() ?? null;
    parsed.domain = [parsed.sld, parsed.tld].join(".");

    if (privateParts.length) {
        parsed.subdomain = privateParts.join(".");
    }

    return { parsed: handlePunycode(), error: null, status: "success" };
};

/** Get domain */
export const get = (domain?: string | null): string | null => {
    if (!domain) {
        return null;
    }
    const { parsed, error } = parse(domain);
    if (error) {
        return null;
    }
    return parsed.domain;
};

/** Check whether domain belongs to a known public suffix. */
export const isValid = (domain: string) => {
    const parsed = parse(domain);
    return Boolean(parsed.parsed?.domain && parsed.parsed?.listed);
};
export { rules };
/**  */
const psl = { parse, get, isValid, rules };
export default psl;
