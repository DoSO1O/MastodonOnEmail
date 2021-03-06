import { MoEClient } from "./MoEClient/MoEClient";
import { Scheduler } from "./Scheduler";



function launch (): void { Scheduler.scheduleInit(); }
function dismiss (): void { Scheduler.scheduleEnd(); }



function main (): void {
	const threads: GoogleAppsScript.Gmail.GmailThread[] = GmailApp.search(`-in:(trash) is:(unread) subject:(${MoEClient.SubjectMatcher})`);
	threads.forEach(thread => {
		const request: MoEClient.MoERequest = MoEClient.Utils.getRequest(thread.getFirstMessageSubject());
		const { feature, instance, toot_visibility, notify_types, help_language, help_feature } = request;

		const client: MoEClient = new MoEClient(instance);

		const mails: GoogleAppsScript.Gmail.GmailMessage[] = thread.getMessages();
		mails.forEach(mail => {
			if (!mail.isUnread()) return;

			switch (feature) {
				default:
				case ":TOOT":
					client.Toot.toot(mail.getPlainBody(), toot_visibility);
					break;
	
				case ":NOTIFY":
					client.Notify.send(mail.getFrom(), notify_types);
					break;
	
				case ":HELP":
					client.Help.send(mail.getFrom(), help_language, help_feature);
					break;
			}

			mail.markRead();
			mail.moveToTrash();
		});
	});
}