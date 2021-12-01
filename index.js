const Koa = require("koa");
const koaStatic = require("koa-static");
const koajwt = require("koa-jwt");
const Router = require("@koa/router");
const { tokenPaser, handleAuth, bodyParser } = require("./middleware");
const { TOKENSECRET } = require("./config");
const routes = require("./router");
const mysql = require("mysql2");
const ace = require("@adonisjs/ace");
const { MYSQL_CONFIG } = require("./config");
const log4js = require("log4js");
const logger = log4js.getLogger();
logger.level = "INFO";

// 创建http实例
const app = new Koa();
// 创建路由对象
const router = new Router();
// 静态资源托管
app.use(koaStatic("upload-files"));
// 连接数据库
const connection = mysql.createConnection(MYSQL_CONFIG);

connection.connect((err) => {
    if (err) throw err;
    logger.info("mysql connncted success!");
});

// 路由鉴权
app.use(handleAuth);
app.use(koajwt({ secret: TOKENSECRET }).unless({ path: [/^\/account/, /^\/validate/] }));

// token 解析到request对象上
app.use(tokenPaser);

// body parser, 上传文件处理，限制20Mb
app.use(bodyParser);

// 路由挂在
app.use(routes).use(router.allowedMethods());

// 启动服务
app.listen(10100, () => {
    console.log("服务已启动，10100端口监听中...");
});

const registedCommandList = [
    "./commands/search",
    "./commands/saveCatalog",
    "./commands/saveChapter",
    "./commands/saveNewNovelInfo",
    "./commands/saveQualityNovel"
];

// register commands
for (let command of registedCommandList) {
    ace.addCommand(require(command));
}

// Boot ace to execute commands
ace.wireUpWithCommander();
ace.invoke();
