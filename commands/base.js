const { BaseCommand } = require("@adonisjs/ace");
const _ = require("lodash");
const moment = require("moment");
const DATE_FORMAT = require("../const");
const path = require("path");
const fs = require("fs");
const log4js = require("log4js");
const logger = log4js.getLogger();
logger.level = "INFO";

class Base extends BaseCommand {
    static get signature() {
        return `
            Novel:Base
            {--onlyFlag: [必传]flag, 只有true/false两个值}
            {--logName=@value:[必传]日志文件名}
            {--isTest?=@value:[可选]是否处于测试环境}
        `;
    }

    static get description() {
        return `Base`;
    }

    /**
     * 在最外层进行一次封装， 方便获得报错信息
     * @param args
     * @param options
     * @returns {Promise<void>}
     */
    async handle(args, options) {
        this.log("command start");
        await this.execute(args, options).catch((e) => {
            this.log("catch error");
            this.log(e.stack);
        });
        this.log("command finish");
    }

    async execute(args, options) {
        logger.error("this method must be override!");
        // must be override
    }

    // 检查目录是否存在，弱不存在则创建
    validateDir(name) {
        const dir = path.resolve(__dirname, `../../novel/${name}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }, (err) => {
                if (err) throw err;
                this.dir = dir;
            });
        }
        this.dir = dir;
    }

    async log() {
        let message = "";
        for (let rawMessage of arguments) {
            if (_.isString(rawMessage) === false) {
                message = message + JSON.stringify(rawMessage);
            } else {
                message += rawMessage;
            }
        }
        let triggerAt = moment().format(DATE_FORMAT.DISPLAY_BY_MILLSECOND);
        logger.info(`[${triggerAt}]-[${this.constructor.name}]`, message);
    }

    async warn() {
        let message = "";
        for (let rawMessage of arguments) {
            if (_.isString(rawMessage) === false) {
                message = message + JSON.stringify(rawMessage);
            } else {
                message = message + rawMessage;
            }
        }
        let triggerAt = moment().format(DATE_FORMAT.DISPLAY_BY_MILLSECOND);
        logger.warn(`[${triggerAt}]-[${this.constructor.name}] ${message}`);
    }
}

module.exports = Base;
