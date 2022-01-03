import { Command } from "@jiman24/commandment";
import { Message } from "discord.js";
import { Prompt } from "@jiman24/discordjs-prompt";
import { DateTime } from "luxon";
import { Event } from "../structure/Event";

export default class extends Command {
  name = "event";

  async exec(msg: Message) {

    const prompt = new Prompt(msg);
    const dateFormat = Event.dateFormat;
    const timeFormat = "hh:mm am";

    const nameInput = await prompt.collect(
      "What is the name of the event you want to create?"
    );

    const name = nameInput.content;

    const descriptionInput = await prompt.collect(
      "Event description"
    );

    const description = descriptionInput.content;


    const dateInput = await prompt.collect(
      `Please specify date in this format **${dateFormat}**`
    );

    const dateStr = dateInput.content;


    let date = DateTime.fromFormat(dateStr, dateFormat);

    if (!date.isValid) {
      throw new Error(date.invalidExplanation!);
    }

    const timeInput = await prompt.collect(
      `Please specify time in this format **${timeFormat}**`
    );

    const timeStr = timeInput.content;


    const time = DateTime.fromFormat(timeStr, Event.timeFormat);

    if (!time.isValid) {
      throw new Error(time.invalidExplanation!);
    }

    date = date.set({ hour: time.hour, minute: time.minute });

    const event = new Event({ date, name, description });
    const timeLeft = event.timeLeft();

    if (date.diffNow("seconds").seconds < 0) {
      throw new Error("cannot create event for the past");
    }

    msg.channel.send({ embeds: [event.show()] });

    msg.channel.send(`${name} will start in ${timeLeft}`);
  }
}
