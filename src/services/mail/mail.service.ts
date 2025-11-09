import { mailQueue } from "./mail.queue";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { NODE_ENV, MAIL_SEND } from "../../config";

export class MailService {
  /**
   * Queues an email job
   */
  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    templateName?: string,
    templateData?: any
  ) {
    try {
      const sendEnabled = MAIL_SEND === "true";

      // Prevent mail sending if disabled
      if (!sendEnabled) {
        console.log(
          `[MailService] Skipped sending mail to ${to} (mail sending disabled)`
        );
        return;
      }

      // Compile HTML from Handlebars template if provided
      if (templateName) {
        const templatePath = path.join(
          process.cwd(),
          "src",
          "services",
          "mail",
          "templates",
          `${templateName}.hbs`
        );

        const source = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(source);
        html = template(templateData);
      }

      await mailQueue.add(
        "sendMail",
        { to, subject, text, html },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      console.log(`[MailService] Mail job queued for ${to}`);
    } catch (err) {
      console.error(`[MailService] Failed to queue mail for ${to}:`, err);
      throw err;
    }
  }
}
