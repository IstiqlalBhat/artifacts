import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const payload = {
  ...JSON.parse(read("subjects.json")),
  mailer_templates_confirmation_content: read("confirmation.html"),
  mailer_templates_magic_link_content: read("magic-link.html"),
  mailer_templates_recovery_content: read("recovery.html"),
  mailer_templates_invite_content: read("invite.html"),
  mailer_templates_email_change_content: read("email-change.html"),
  mailer_templates_reauthentication_content: read("reauthentication.html"),
  mailer_templates_password_changed_notification_content: read(
    "notifications/password-changed.html",
  ),
  mailer_templates_email_changed_notification_content: read(
    "notifications/email-changed.html",
  ),
  mailer_templates_phone_changed_notification_content: read(
    "notifications/phone-changed.html",
  ),
  mailer_templates_identity_linked_notification_content: read(
    "notifications/identity-linked.html",
  ),
  mailer_templates_identity_unlinked_notification_content: read(
    "notifications/identity-unlinked.html",
  ),
  mailer_templates_mfa_factor_enrolled_notification_content: read(
    "notifications/mfa-factor-enrolled.html",
  ),
  mailer_templates_mfa_factor_unenrolled_notification_content: read(
    "notifications/mfa-factor-unenrolled.html",
  ),
};

if (process.argv.includes("--enable-notification-emails")) {
  Object.assign(payload, {
    mailer_notifications_password_changed_enabled: true,
    mailer_notifications_email_changed_enabled: true,
    mailer_notifications_phone_changed_enabled: true,
    mailer_notifications_identity_linked_enabled: true,
    mailer_notifications_identity_unlinked_enabled: true,
    mailer_notifications_mfa_factor_enrolled_enabled: true,
    mailer_notifications_mfa_factor_unenrolled_enabled: true,
  });
}

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
