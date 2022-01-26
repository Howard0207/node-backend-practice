const puppeteer = require("puppeteer");
const log4js = require("log4js");
const path = require("path");
const fs = require("fs");
const { WEBSITE } = require("../../config");
const logger = log4js.getLogger();
logger.level = "debug";

class SearchNovel {
    constructor(props) {
        const { name, type = "byzw" } = props;
        this.name = name;
        this.type = type;
        this.options = {
            defaultViewport: { width: 1920, height: 1080 },
            headless: false // 代表有界面
        };
        this.browser = null;
        this.searchResult = [];
    }

    // 打开无头浏览器
    createBrowser = async () => {
        this.browser = await puppeteer.launch(this.options);
    };

    // 关闭无头浏览器
    closeBrowser = async () => {
        await this.browser.close();
        this.browser = null;
    };

    // 打开指定页面
    openPage = async (url) => {
        const page = await this.browser.newPage();
        await page.goto(url, { timeout: 120 * 1000 }); // 等待2min
        return page;
    };

    // 整合搜索地址
    composeSearchPageInfo = () => {
        const { url, search } = WEBSITE[this.type];
        return `${url}${search}?q=${this.name}`;
    };

    // 获取下一页地址
    getNextPageAddress = (pageNum) => {
        const baseurl = this.composeSearchPageInfo();
        return `${baseurl}&p=${pageNum}`;
    };

    evaluateSearchPageNovelInfo = async () => {
        const novels = $(".result-list .result-item");
        if (novels.length > 0) {
            const res = [].slice.call(novels).map((novel) => {
                const link = $(novel).find(".result-game-item-pic-link").attr("href");
                const name = $(novel).find(".result-item-title span").text();
                const tags = $(novel).find(".result-game-item-info-tag");
                let post = $(novel).find(".result-game-item-pic-link-img").attr("src");
                post = post.startsWith("/") ? "https://www.81zw.com/files/article/image/40/40154/40154s.jpg" : post;
                const tagsInfo = {};
                const tagsKeyList = ["author", "type", "updatetime", "lastchapter"];
                [].slice.call(tags).forEach((tag, idx) => {
                    const span = $(tag).find("span")[1];
                    tagsInfo[tagsKeyList[idx]] = span ? $(span).text() : $(tag).find(".result-game-item-info-tag-item").text();
                });
                return { ...tagsInfo, post, name, link };
            });
            return res;
        } else {
            return [];
        }
    };

    /**
     * 爬取分页内小说信息
     * @param {分页信息} pageNum
     * @returns {小说信息} novelList
     */
    crawlSearchPageNovelInfo = async (pageNum) => {
        const pageAddress = this.getNextPageAddress(pageNum);
        const page = await this.openPage(pageAddress);
        const listInfo = await page.evaluate(this.evaluateSearchPageNovelInfo);
        await page.close();
        return listInfo;
    };

    /**
     * 处理分页dom
     * @returns num Number
     */
    evaluateSearchPageNum = async () => {
        const pages = $(".search-result-page-main a");
        const lastPageDom = pages[pages.length - 1];
        if (pages.length > 1) {
            return $(lastPageDom).text() !== "末页" ? pages.length - 1 : pages.length;
        } else {
            return 0;
        }
    };

    // 爬取搜索结果页面有多少个分页
    crawlResultPagesInfo = async (address) => {
        const page = await this.openPage(address);
        const pageLength = await page.evaluate(this.evaluateSearchPageNum);
        await page.close();
        return pageLength;
    };

    // 处理搜索任务（这里一次打开多个标签，手动限制了最多打开50个标签）
    handleCrawlSearchPageNovelInfo = async (num) => {
        const promises = [];
        const max = Math.min(num, 50);
        for (let i = 0; i < max; i++) {
            promises.push(this.crawlSearchPageNovelInfo(i + 1));
        }
        return Promise.all(promises);
    };

    // 搜索小说
    search = async () => {
        try {
            // 启动浏览器
            await this.createBrowser();
            // 整合搜索地址
            const pageAddress = this.composeSearchPageInfo();
            // 爬取搜索页面里面有多少个分页
            const resultPages = await this.crawlResultPagesInfo(pageAddress);
            // 根据分页数量爬取各个分页小说信息
            const data = await this.handleCrawlSearchPageNovelInfo(resultPages);
            // 对各个分页数据集合进行一次平铺
            return data.flat();
        } catch (error) {
            console.log(error);
        } finally {
            // 关闭浏览器
            await this.closeBrowser();
        }
    };
}

module.exports = SearchNovel;
