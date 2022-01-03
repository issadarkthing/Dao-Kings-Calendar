import { Command } from "@jiman24/commandment";
import { Message, TextChannel } from "discord.js";
import { Prompt } from "@jiman24/discordjs-prompt";
import { DateTime } from "luxon";
import { Event } from "../structure/Event";
import { Settings } from "../structure/Settings";
import { oneLine } from "common-tags";

export default class extends Command {
  name = "event";

  async exec(msg: Message) {

    const prompt = new Prompt(msg);
    const settings = new Settings();

    if (!settings.eventChannel) {

      const channelInput = await prompt.collect(
        oneLine`Event channel has not been configured. Please mention a channel
        to be used as event channel`
      );

      const channel = channelInput.mentions.channels.first();

      if (!channel) {
        throw new Error("no channel was mentioned");
      } else if (channel instanceof TextChannel) {
        throw new Error(`${channel} is not text based channel`);
      }

      settings.eventChannel = channel.id;
      settings.save();

      msg.channel.send(`Successfully set event channel to ${channel}`);
    }

    const dateFormat = Event.dateFormat;
    const timeFormat = "hh:mm am";

    const nameInput = await prompt.collect(
      "What is the name of the event you want to create?"
    );

    const name = nameInput.content;

    const descriptionInput = await prompt.collect(
      "Specify event description"
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
    const confirmation = await prompt.ask(
      "Is this info correct? [y/n]"
    );

    const guild = msg.guild!;
    guild.channels.fetch();

    const eventChannel = guild.channels.cache.get(settings.eventChannel);

    if (!eventChannel) {
      throw new Error(`cannot find event channel`);
    }

    (eventChannel as TextChannel).send({ embeds: [event.show()] });

    if (confirmation === "y") {

      msg.channel.send(`Successfully created ${name} event`);

    } else if (confirmation === "n") {
      throw new Error("operation cancelled");
    } else {
      throw new Error("invalid input was given. operation cancelled");
    }

    msg.channel.send(`${name} will start in ${timeLeft}`);
  }
}
