const Base = require("./base");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
class SaveCatalog extends Base {
    static get signature() {
        return `
            Novel:SaveCatalog
            { novelName: 小说名称 }
            { url: 目录地址 }
    `;
    }

    static get description() {
        return `
            根据目录地址将目录信息整理写入文件
        `;
    }

    constructor() {
        super();
        this.dir = "";
        this.novelName = "";
    }

    execute = async (args) => {
        const { novelName, url } = args;
        this.novelName = novelName;
        this.validateDir(novelName);
        this.loadCatalog(url);
    };

    async loadCatalog(url) {
        const options = {
            defaultViewport: { width: 1920, height: 1080 }
            // 代表有界面
            // headless: false
            // slowMo: 250 // 减慢速度(毫秒)
        };

        // 启动浏览器
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await this.openPage(page, url);
        const catalog = await page.evaluate(() => {
            return new Promise((resolve) => {
                const items = $("#list dd a");
                const baseUrl = "https://www.vipxs.la";
                if (items.length > 0) {
                    const catalogJson = { read: 0, chapters: [] };
                    const map = new Map();
                    [].slice.call(items).forEach((item) => {
                        const link = baseUrl + $(item).attr("href");
                        const chapter = $(item).text();
                        if (!map.get(chapter) && /^第/.test(chapter)) {
                            map.set(chapter, link);
                            catalogJson.chapters.push({ chapter, link });
                        }
                    });
                    resolve(catalogJson);
                } else {
                    reject({});
                }
            });
        });
        await this.saveCatalog(catalog);
        await page.close();
        return catalog;
    }
}

module.exports = SaveCatalog;
