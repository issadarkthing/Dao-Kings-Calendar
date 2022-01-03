import { MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { client } from "..";

interface EventOptions {
  name: string;
  description?: string;
  date: DateTime;
}

export class Event {
  id = client.events.autonum;
  static dateFormat = "MM/dd/yyyy";
  static timeFormat = "t";
  name: string;
  description?: string;
  date: DateTime;

  constructor(opts: EventOptions) {
    this.name = opts.name;
    this.description = opts.description;
    this.date = opts.date;
  }

  timeLeft() {
    return this.date
      .diffNow(["days", "hours", "minutes", "seconds"])
      .toFormat("**d** 'days' **h** 'hours' **m** 'minutes' **s** 'seconds'");
  }

  show() {
    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(this.name)
      .setDescription(this.description || "")
      .addField("Date", this.date.toLocaleString(DateTime.DATE_SHORT), true)
      .addField("Time", this.date.toLocaleString(DateTime.TIME_SIMPLE), true)
      .setTimestamp(this.date.toJSDate())

    return embed;
  }

  save() {
    const data = { ...this, date: this.date.toJSDate() };
    client.events.set(this.id, data);
  }
}

