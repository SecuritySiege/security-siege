import chalk from "chalk";

export default class Logger {
  static log(message: string): void {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.greenBright("[INFO]")} ${message}`);
  }

  static warn(message: string): void {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.yellowBright("[WARN]")} ${message}`);
  }

  static error(message: string | Error): void {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.redBright("[ERROR]")} ${message instanceof Error ? message.stack : message}`);
  }

  static debug(message: string): void {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.blueBright("[DEBUG]")} ${message}`);
  }

  static info(message: string): void {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.cyanBright("[INFO]")} ${message}`);
  }

  static success(message: string): void {
    console.log(`${chalk.gray(`[${new Date().toLocaleTimeString()}]`)} ${chalk.greenBright("[SUCCESS]")} ${message}`);
  }
}