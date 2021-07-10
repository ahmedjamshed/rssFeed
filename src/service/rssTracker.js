const fs = require("fs");
const { isEqual } = require("lodash");
const Parser = require("rss-parser");
const PubSubIns = require("@app/graphql/subscription");
const transporter = require("./nodemailer");

const rssTracker = async (url) => {

    try {
        const parser = new Parser({
            xml2js: {},
            defaultRSS: 2.0,
            customFields: {feed: ['author']}
        });
        const feed = await parser.parseURL(url);
        let items = [];
        // Clean up the string and replace reserved characters
        const fileName = `${feed.title.replace(/\s+/g, "-").replace(/[/\\?%*:|"<>]/g, '').toLowerCase()}.json`;
        if (fs.existsSync(fileName)) {
            items = JSON.parse(fs.readFileSync(`./${fileName}`));
        }
        // Add the items to the items array
        await Promise.all(feed.items.map(async (currentItem) => {
            // Add a new item if it doesn't already exist
            if (items.filter((item) => isEqual(item, currentItem)).length <= 0) {
                items.push(currentItem);
                PubSubIns.publish("updateStatus", currentItem);
                transporter.sendMail({
                    from: '"Fred Foo 👻" <foo@example.com>', // sender address
                    to: "bar@example.com, ahmedjamshedlead@gmail.com", // list of receivers
                    subject: feed.title, // Subject line
                    text: currentItem.contentSnippet, // plain text body
                    html: currentItem.content, // html body
                  })
            }
        }));
        // Save the file
        fs.writeFileSync(fileName, JSON.stringify(items));
    } catch (e) {
        console.log(e)
    }


};

setInterval(() => {
    const arr = ['https://status.cloud.google.com/feed.atom?format=xml']
    const barr = ['https://www.githubstatus.com/history.atom', 'https://www.cloudflarestatus.com/history.atom', 'https://www.redditstatus.com/history.atom']
    Promise.allSettled([...barr].map(async url => rssTracker(url)))
}, 20 * 1000);

module.exports = rssTracker;
