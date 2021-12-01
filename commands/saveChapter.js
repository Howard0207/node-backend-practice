const Base = require("./base");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const sp = require("superagent");
const symbols = require("log-symbols");
const chalk = require("chalk");
const { WEBSITE } = require("../config");
const schedule = require("node-schedule");

class SaveChapter extends Base {
	static get signature() {
		return `
            Novel:SaveChapter
            { novelName: 小说名称 }
        `;
	}

	static get description() {
		return `在小说目录下基于catalog下载章节`;
	}

	constructor() {
		super();
		this.dir = "";
		this.novelName = "";
		this.job = null;
	}

	async execute(args) {
		const { novelName } = args;

		this.novelName = novelName;

		this.validateDir(novelName);

		this.registerSchedule();
	}

	async registerSchedule() {
		this.job = schedule.scheduleJob("*/10 * * * * *", () => {
			const chapter = this.visitChapterPage();
			this.loadChapter(chapter);
		});
	}

	// 下载章节
	async loadChapter(chapter) {
		const { href, title } = chapter;

		// 小说文件
		const novelPath = path.resolve(this.dir, `${title}.txt`);
		const writeStream = fs.createWriteStream(novelPath);

		console.log(symbols.info, chalk.yellow(`正在读取${title}...`));

		let html = await sp.get(WEBSITE.bqg.url + href);
		let $ = cheerio.load(html.text);
		const content = $("#content")
			.text()
			.replace(/<br>/g, "\n")
			.replace(/&nbsp;/g, "\b");

		writeStream.write(content);
		console.log(symbols.success, chalk.yellow(`${title}写入完成...`));
		console.log(symbols.info, chalk.yellow(`稍等片刻...`));
	}

	// 访问caltalog
	visitChapterPage() {
		const catalogPath = path.resolve(this.dir, `catalog.json`);
		const catalogStr = fs.readFileSync(catalogPath);

		const catalog = JSON.parse(catalogStr);
		const { read } = catalog;
		const chapter = catalog["chapters"][read];
		catalog.read++;
		if (!chapter) {
			this.job.cancel();
		}

		const writeStream = fs.createWriteStream(catalogPath);
		writeStream.write(JSON.stringify(catalog));
		return chapter;
	}
}

module.exports = SaveChapter;
