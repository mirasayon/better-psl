import psl from "../dist/index.js";

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
