const Router = require("@koa/router");
const router = new Router();

/**
 * 模块路由
 */
const mail = require("./mail");
const account = require("./account");
const upload = require("./upload");
const validate = require("./validate");
const craw = require("./crawl");
/**
 * 路由中间件统一管理
 */
const routes = [mail, account, upload, validate, craw];
router.use(...routes);

module.exports = router.routes();
