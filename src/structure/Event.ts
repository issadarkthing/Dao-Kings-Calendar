import { MessageEmbed, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { client } from "..";
import { Settings } from "./Settings";

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
  guildID?: string;
  messageID?: string;
  ended = false;
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
    event.date = DateTime.fromJSDate(data.date);

    return event;
  }

  hasPassed() {
    return this.date.diffNow(["seconds"]).seconds <= 0;
  }

  show() {
    const timeLeft = this.ended ? "This event has ended" : this.timeLeft();

    const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(this.name)
      .setDescription(this.description || "")
      .addField("ID", this.id.toString(), true)
      .addField("Date", this.date.toLocaleString(DateTime.DATE_SHORT), true)
      .addField("Time", this.date.toLocaleString(DateTime.TIME_SIMPLE), true)
      .addField("Time Left", timeLeft)

    return embed;
  }

  save() {
    const data = { ...this, date: this.date.toJSDate() };
    client.events.set(this.id, data);
  }
}

export class EventUpdate {

  static async update() {
    for (const id of client.events.keys()) {
      const event = Event.fromID(id as number);
      const guild = client.guilds.cache.get(event.guildID!);

      if (!guild) continue;

      const settings = new Settings(guild.id);
      const channel = await guild.channels.fetch(settings.eventChannel);

      if (!channel || !(channel instanceof TextChannel)) continue;
      if (event.ended) continue;

      await channel.messages.fetch();
      const message = channel.messages.cache.get(event.messageID!);

      if (message) {
        message.edit({ embeds: [event.show()] });
      } else {
        channel.send({ embeds: [event.show()] });
      }

      if (event.hasPassed() && !event.ended) {

        event.ended = true;
        event.save();
      }
    }
  }

  // runs update every x minutes
  static run(interval: number) {

    setInterval(() => {

      this.update();

    }, 1000 * 60 * interval)
  }
}
