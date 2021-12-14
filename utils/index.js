const uuid = require("uuid");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const log4js = require("log4js");
const Sequelize = require("sequelize");
const { MYSQL_CONFIG } = require("../config");
log4js.configure({
    appenders: {
        console: { type: "console" }, // 控制台输出
        // 全部日志文件
        app: {
            type: "file",
            filename: path.join(__dirname, "../logs/app"),
            maxLogSize: 1024 * 500, //一个文件的大小，超出后会自动新生成一个文件
            backups: 2, // 备份的文件数量
            pattern: "_yyyy-MM-dd.log",
            alwaysIncludePattern: true
        },
        // 错误日志文件
        errorFile: {
            type: "file",
            filename: path.join(__dirname, "../logs/error"),
            maxLogSize: 1024 * 500, // 一个文件的大小，超出后会自动新生成一个文件
            backups: 2, // 备份的文件数量
            pattern: "_yyyy-MM-dd.log",
            alwaysIncludePattern: true
        }
    },
    categories: {
        // 默认日志，输出debug 及以上级别的日志
        default: { appenders: ["app", "console"], level: "debug" },
        // 错误日志，输出error 及以上级别的日志
        error: { appenders: ["errorFile"], level: "error" }
    },
    replaceConsole: true // 替换console.log
});

// 获取默认日志
const defaultLogger = log4js.getLogger();
// 获取错误级别日志
const errorLogger = log4js.getLogger("error");

const logger = {};
const levels = log4js.levels.levels;
levels.forEach((level) => {
    const curLevel = level.levelStr.toLowerCase();
    logger[curLevel] = (...params) => {
        defaultLogger[curLevel](...params);
        errorLogger[curLevel](...params);
    };
});

/**
 * 判断文件目录是否存在
 * @param {String} path
 * @returns {Boolean}
 */
const isDirExist = (path) => fs.existsSync(path);

/**
 * 如果目录不存在则创建目录
 * @param {String} path
 */
const makeDirIfUnExist = (path) => {
    if (!isDirExist(path)) {
        fs.mkdirSync(path, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
};

/**
 * 如果目录存在则删除目录
 * @param {String} path
 */
const removeDirIfExist = (path) => {
    if (isDirExist(path)) {
        fs.rm(path, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
};

//读取目录及文件
function readDir(obj, nowPath) {
    let files = fs.readdirSync(nowPath); //读取目录中的所有文件及文件夹（同步操作）
    files.forEach(function (fileName, index) {
        //遍历检测目录中的文件
        let fillPath = nowPath + "/" + fileName;
        let file = fs.statSync(fillPath); //获取一个文件的属性
        if (file.isDirectory()) {
            //如果是目录的话，继续查询
            let dirlist = zip.folder(fileName); //压缩对象中生成该目录
            readDir(dirlist, fillPath); //重新检索目录文件
        } else {
            obj.file(fileName, fs.readFileSync(fillPath)); //压缩目录添加文件
        }
    });
}

/**
 * 压缩文件夹（绝对路径）
 * @param {Stirng} dirPath 压缩目录
 * @param {String} savePath 压缩文件保存目录
 * @returns {Promise}
 */
function startZIP(dirPath, savePath, zipName) {
    const zip = new JSZip();
    readDir(zip, dirPath);
    //开始打包 设置压缩格式 -- 压缩算法 -- 压缩级别
    return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } }).then(function (content) {
        makeDirIfUnExist(savePath);
        //将打包的内容写入 当前目录下的 zipName.zip中
        fs.writeFileSync(savePath + `/${zipName}.zip`, content, "utf-8");
    });
}

const sequelize = new Sequelize(MYSQL_CONFIG.database, MYSQL_CONFIG.username, MYSQL_CONFIG.password, {
    host: MYSQL_CONFIG.host,
    dialect: "mysql",
    port: MYSQL_CONFIG.port,
    pool: { max: 5, min: 0, idle: 30000 }
});

const generateUUID = () => {
    let uid = uuid.v1();
    uid = uid.replace(/\-/g, "");
    return uid;
};

module.exports = {
    makeDirIfUnExist,
    removeDirIfExist,
    generateUUID,
    isDirExist,
    startZIP,
    sequelize,
    logger
};
