const Router = require("@koa/router");
const puppeteer = require("puppeteer");
const SearchNovel = require("./bayizhongwen");
const { SuccessResponse, ErrorResponse } = require("../../model/response");
const log4js = require("log4js");
const logger = log4js.getLogger();
logger.level = "debug";
const router = new Router();

// 小说搜索
router.post("/search-novel", async (ctx) => {
    const { name } = ctx.request.body;
    const searchInit = new SearchNovel({ name });
    try {
        const data = await searchInit.search();
        logger.info(data);
        ctx.body = new SuccessResponse(data);
    } catch (error) {
        ctx.body = new ErrorResponse(500, error, "小说查询失败");
    }
});

// // 小说爬取开关
router.post("/crawl", async (ctx) => {
    const { url, name } = ctx.request.body;
    try {
        const data = await craw(name);
        ctx.body = new SuccessResponse("小说开始爬取");
    } catch (error) {
        ctx.body = new ErrorResponse(500, error, "小说查询失败");
    }
});

module.exports = router.routes();
