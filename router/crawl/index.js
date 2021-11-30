const Router = require("@koa/router");
const puppeteer = require("puppeteer");
const BQGXS = require("./biquge");
const { SuccessResponse, ErrorResponse } = require("../../model/response");

const router = new Router();

const craw = async function craw(name) {
    // 传入配置项
    const options = {
        defaultViewport: { width: 1920, height: 1080 }
        // 代表有界面
        // headless: false
        // slowMo: 250 // 减慢速度(毫秒)
    };

    // 启动浏览器
    const browser = await puppeteer.launch(options);
    const bqg = new BQGXS(browser, name);
    const crawlInfo = await bqg.crawl();

    // 关闭浏览器
    await browser.close();
    return crawlInfo;
};

router.post("/crawl", async (ctx) => {
    const { name } = ctx.request.body;
    console.log(name);
    try {
        const data = await craw(name);
        console.log(data);
        ctx.body = new SuccessResponse(data);
    } catch (error) {
        ctx.body = new ErrorResponse(500, error, "小说查询失败");
    }
});

module.exports = router.routes();
