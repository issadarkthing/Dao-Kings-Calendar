import { MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { client } from "..";

interface EventOptions {
  id?: number;
  name: string;
  description?: string;
  date: DateTime;
}

export class Event {
  id: number;
  static dateFormat = "MM/dd/yyyy";
  static timeFormat = "t";
  name: string;
  description?: string;
  messageID?: string;
  date: DateTime;

  constructor(opts: EventOptions) {
    this.id = opts.id || client.events.autonum;
    this.name = opts.name;
    this.description = opts.description;
    this.date = opts.date;
  }

  timeLeft() {
    return this.date
      .diffNow(["days", "hours", "minutes"])
      .toFormat("**d** 'days' **h** 'hours' **m** 'minutes'");
  }

  static fromID(id: number) {
    const data = client.events.get(id);
    const event = new Event(data);

    Object.assign(event, data);
    return event;
  }

  show() {
    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(this.name)
      .setDescription(this.description || "")
      .addField("ID", this.id.toString(), true)
      .addField("Date", this.date.toLocaleString(DateTime.DATE_SHORT), true)
      .addField("Time", this.date.toLocaleString(DateTime.TIME_SIMPLE), true)
      .addField("Time Left", this.timeLeft())

    return embed;
  }

  save() {
    const data = { ...this, date: this.date.toJSDate() };
    client.events.set(this.id, data);
  }
}

