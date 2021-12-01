const Base = require("./base");
const sp = require("superagent");
const cheerio = require("cheerio");
const symbols = require("log-symbols");
const chalk = require("chalk");
const NewNovel = require("../db/model/novel");
const md5 = require("md5");
const { novelClassify, novelState } = require("../constant/novel");

class QualityNovel extends Base {
	static get signature() {
		return `
      Novel:QualityNovel
      { url: 地址(http://m.xbiquge.la/top/allvote_1/) }
    `;
	}

	static get description() {
		return `获取品质小说`;
	}

	constructor() {
		super();
		this.novelInfo = [];
	}

	async execute(args) {
		const { url } = args;
		const list = await this.load(url);
		this.insertNewNovel(list);
	}

	async load(url) {
		console.log(symbols.info, chalk.yellow("正在读取数据..."));
		const html = await sp.get(url);
		const $ = cheerio.load(html.text);
		console.log(symbols.success, chalk.green(`读取完毕`));

		const novelList = [];
		$(".line .blue").each((_, element) => {
			novelList.push($(element).attr("href"));
		});
		return novelList;
	}

	async insertNewNovel(list) {
		for (let url of list) {
			const info = await this.visitEach(url);
			console.log(info);
			this.novelInfo.push(info);
		}
		NewNovel.bulkCreate(this.novelInfo);
	}

	async visitEach(url) {
		console.log(symbols.info, chalk.yellow("正在读取数据..."));
		const baseUrl = "http://m.xbiquge.la";
		const html = await sp.get(`${baseUrl}${url}`);
		const $ = cheerio.load(html.text);
		const novelInfo = {
			cover: $(".block_img2 img").attr("src"),
			name: $(".block_txt2 h2").text(),
			id: md5($(".block_txt2 h2").text()),
			synopsis: $(".intro_info").text().trim(),
			type: 2,
		};
		const map = {
			作者: "author",
			分类: "classify",
			状态: "state",
			更新: "updatetime",
			最新: "newChapter",
		};
		$(".block p").each((_, ele) => {
			const text = $(ele).text();
			const info = text.split("：");
			if (info.length === 2 && map[info[0]]) {
				novelInfo[map[info[0]]] = info[1].trim();
			}
		});

		if (novelInfo["classify"]) {
			novelInfo["classify"] = novelClassify[novelInfo["classify"]];
		}

		if (novelInfo["state"]) {
			novelInfo["state"] = novelState[novelInfo["state"]];
		}
		console.log(symbols.success, chalk.green(`读取完毕`));
		return novelInfo;
	}
}

module.exports = QualityNovel;
