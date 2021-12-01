const Base = require("./base");
const http = require("http");
const querystring = require("querystring");
const cheerio = require("cheerio");
const chalk = require("chalk");

class Search extends Base {
	static get signature() {
		return `
            Novel:Search
            {novelName: 小说名字}
        `;
	}
	static get description() {
		return `基于小说名搜索`;
	}

	constructor() {
		super();
	}

	async execute(args) {
		const { novelName } = args;
		await this.handleSearch(novelName);
	}

	// 搜索
	async handleSearch(novelName) {
		const postData = querystring.stringify({ searchkey: novelName });

		// 创建http实例
		const req = http.request(
			"http://www.xbiquge.la/modules/article/waps.php",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"Content-Length": Buffer.byteLength(postData),
				},
			},
			(res) => {
				let content = "";
				res.setEncoding("utf-8");

				res.on("data", (chunk) => {
					content += chunk.toString();
				});

				res.on("end", () => {
					const $ = cheerio.load(content);
					$(".even a").each((_, element) => {
						const href = $(element).attr("href");
						const title = $(element).text();
						if (href && title) {
							console.log(chalk.green(title + ":"), chalk.blue(href));
						}
					});
				});
			}
		);

		req.write(postData);
		req.end();
	}
}

module.exports = Search;
