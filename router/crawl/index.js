const Router = require("@koa/router");
const puppeteer = require("puppeteer");
const BQGXS = require("./biquge");
const { SuccessResponse, ErrorResponse } = require("../../model/response");

const router = new Router();

const crawlSearchPage = async function crawlSearchPage(name) {
    // 传入配置项
    const options = {
        defaultViewport: { width: 1920, height: 1080 }
        // 代表有界面
        // headless: false
        // slowMo: 250 // 减慢速度(毫秒)
    };

    // 启动浏览器
    const browser = await puppeteer.launch(options);
    const bqg = new BQGXS(browser, { name });
    const crawlInfo = await bqg.crawlSearchPage();

    // 关闭浏览器
    await browser.close();
    return crawlInfo;
};

const crawNovel = async function crawlNovel(catalogUrl, name) {
    const options = {
        defaultViewport: { width: 1920, height: 1080 },
        // 代表有界面
        headless: false
        // slowMo: 250 // 减慢速度(毫秒)
    };
    // 启动浏览器
    const browser = await puppeteer.launch(options);
    const bqg = new BQGXS(browser, { catalogUrl, name });
    const crawlInfo = await bqg.crawlNovel();

    // 关闭浏览器
    await browser.close();
    return crawlInfo;
};

// 小说搜索
// router.post("/search-novel", async (ctx) => {
//     const { name } = ctx.request.body;
//     try {
//         const data = await crawlSearchPage(name);
//         ctx.body = new SuccessResponse(data);
//     } catch (error) {
//         ctx.body = new ErrorResponse(500, error, "小说查询失败");
//     }
// });

// // 小说爬取开关
// router.post("/crawl", async (ctx) => {
//     const { url, name } = ctx.request.body;
//     try {
//         const data = await craw(name);
//         ctx.body = new SuccessResponse("小说开始爬取");
//     } catch (error) {
//         ctx.body = new ErrorResponse(500, error, "小说查询失败");
//     }
// });

// crawNovel("https://www.vipxs.la/0_495/", "赘婿");

module.exports = router.routes();
