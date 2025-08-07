# better-psl (Public Suffix List)

Repository: [github.com/mirasayon/better-psl](https://github.com/mirasayon/better-psl/)

NPM package url: [www.npmjs.com/package/better-psl](https://www.npmjs.com/package/better-psl)

`better-psl` is a modern `JavaScript` domain name parser based on the
[Public Suffix List](https://publicsuffix.org/).

## What is the Public Suffix List?

The Public Suffix List is a cross-vendor initiative to provide an accurate list
of domain name suffixes.

The Public Suffix List is an initiative of the Mozilla Project, but is
maintained as a community resource. It is available for use in any software,
but was originally created to meet the needs of browser manufacturers.

A "public suffix" is one under which Internet users can directly register names.
Some examples of public suffixes are ".com", ".co.uk" and "pvt.k12.wy.us". The
Public Suffix List is a list of all known public suffixes.

Source: [publicsuffix.org](https://publicsuffix.org/)

## Installation (with `npm`)

This module is currently only available for `Node.js`. See below for details.

### Node.js

This module is tested on Node.js v20 and v22

```bash
npm install better-psl
```

#### ESM

The package is ESM-only

```ts
import psl from "better-psl";
```

or

```ts
import { get, isValid, parse, rules } from "better-psl";
```

## API

### `psl.parse(domain)`

Parse domain based on Public Suffix List. Returns an `Object` with the following
properties:

-   `tld`: Top level domain (this is the _public suffix_).
-   `sld`: Second level domain (the first private part of the domain name).
-   `domain`: The domain name is the `sld` + `tld`.
-   `subdomain`: Optional parts left of the domain.

#### Examples

Parse domain without subdomain:

```ts
import psl from "better-psl";

const { parsed } = psl.parse("google.com");
if (parsed) {
    console.log(parsed);
    // parsed: {
    //     input: "google.com",
    //     tld: "com",
    //     sld: "google",
    //     domain: "google.com",
    //     subdomain: null,
    //     listed: true,
    // };
}
```

Parse domain with subdomain:

```ts
import psl from "better-psl";
const { parsed, error } = psl.parse("www.google.com");
if (error) {
    // return
}
if (parsed) {
    console.log(parsed);
    // parsed: {
    //     input: "www.google.com",
    //     tld: "com",
    //     sld: "google",
    //     domain: "google.com",
    //     subdomain: "www",
    //     listed: true,
    // };
}
```

Parse domain with nested subdomains:

```ts
import psl from "better-psl";

const { parsed, error } = psl.parse("a.b.c.d.foo.com");
if (error) {
    // return;
}
console.log(parsed);
// parsed: {
//     input: "a.b.c.d.foo.com",
//     tld: "com",
//     sld: "foo",
//     domain: "foo.com",
//     subdomain: "a.b.c.d",
//     listed: true,
// };
```

### `psl.get(domain)`

Get domain name, `sld` + `tld`. Returns `null` if not valid.

#### Examples

```ts
import psl from "better-psl";

// null input.
psl.get(null); // null
psl.get(undefined); // null
psl.get("some-thing-else"); // null

// Mixed case.
psl.get("COM"); // null
psl.get("example.COM"); // 'example.com'
psl.get("WwW.example.COM"); // 'example.com'

// Unlisted TLD.
psl.get("example"); // null
psl.get("example.example"); // 'example.example'
psl.get("b.example.example"); // 'example.example'
psl.get("a.b.example.example"); // 'example.example'

// TLD with only 1 rule.
psl.get("biz"); // null
psl.get("domain.biz"); // 'domain.biz'
psl.get("b.domain.biz"); // 'domain.biz'
psl.get("a.b.domain.biz"); // 'domain.biz'

// TLD with some 2-level rules.
psl.get("uk.com"); // null);
psl.get("example.uk.com"); // 'example.uk.com');
psl.get("b.example.uk.com"); // 'example.uk.com');

// More complex TLD.
psl.get("c.kobe.jp"); // null
psl.get("b.c.kobe.jp"); // 'b.c.kobe.jp'
psl.get("a.b.c.kobe.jp"); // 'b.c.kobe.jp'
psl.get("city.kobe.jp"); // 'city.kobe.jp'
psl.get("www.city.kobe.jp"); // 'city.kobe.jp'

// IDN labels.
psl.get("食狮.com.cn"); // '食狮.com.cn'
psl.get("食狮.公司.cn"); // '食狮.公司.cn'
psl.get("www.食狮.公司.cn"); // '食狮.公司.cn'

// Same as above, but punycoded.
psl.get("xn--85x722f.com.cn"); // 'xn--85x722f.com.cn'
psl.get("xn--85x722f.xn--55qx5d.cn"); // 'xn--85x722f.xn--55qx5d.cn'
psl.get("www.xn--85x722f.xn--55qx5d.cn"); // 'xn--85x722f.xn--55qx5d.cn'
```

### `psl.isValid(domain)`

Check whether a domain has a valid Public Suffix. Returns a `Boolean` indicating
whether the domain has a valid Public Suffix.

#### Example

```ts
import psl from "better-psl";

psl.isValid("google.com"); // true
psl.isValid("www.google.com"); // true
psl.isValid("x.yz"); // false
```

## Testing and Building

```bash
# Update rules from publicsuffix.org
npm run update-rules

# Build and create dist files
npm run build
```

Feel free to fork if you see possible improvements!

## Acknowledgements

-   Mozilla Foundation's [Public Suffix List](https://publicsuffix.org/)
-   Inspired by [weppos/publicsuffix-ruby](https://github.com/weppos/publicsuffix-ruby)

## License

The MIT License (MIT)

Copyright (c) 2025 "Mirasayon" <mirasayon@ya.ru>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
